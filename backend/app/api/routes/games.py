from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List
from uuid import UUID
import json

from app.core.database import get_session
from app.models.game import Game, GamePlayer, GameStatus
from app.models.player import Player
from app.models.round import Round, Bid
from app.models.card import Card, Suit
from app.core.game_logic import WizardGameEngine
from app.core.bot_ai import BotAI
from app.schemas.game import GameStateResponse, PlayCardRequest, BidRequest

router = APIRouter(prefix="/games", tags=["games"])

@router.post("/", response_model=GameStateResponse)
async def create_game(
    player_name: str,
    session: Session = Depends(get_session)
):
    """Create a new game with 1 human player and 3 bots"""

    # Create human player
    human_player = Player(name=player_name, is_bot=False)
    session.add(human_player)

    # Create bot players
    bot_players = []
    for i in range(3):
        bot = Player(name=f"Bot {i+1}", is_bot=True)
        session.add(bot)
        bot_players.append(bot)

    # Create game
    game = Game(status=GameStatus.WAITING)
    session.add(game)
    session.commit()
    session.refresh(game)

    # Add players to game
    all_players = [human_player] + bot_players
    for position, player in enumerate(all_players):
        game_player = GamePlayer(
            game_id=game.id,
            player_id=player.id,
            position=position
        )
        session.add(game_player)

    session.commit()

    # Start first round
    await start_round(game.id, session)

    return await get_game_state(game.id, session)

@router.get("/{game_id}", response_model=GameStateResponse)
async def get_game(
    game_id: UUID,
    session: Session = Depends(get_session)
):
    """Get current game state"""
    return await get_game_state(game_id, session)

@router.post("/{game_id}/bid")
async def submit_bid(
    game_id: UUID,
    request: BidRequest,
    session: Session = Depends(get_session)
):
    """Submit a bid for the current round"""
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != GameStatus.BIDDING:
        raise HTTPException(status_code=400, detail="Not in bidding phase")

    # Get current round
    round_obj = session.exec(
        select(Round)
        .where(Round.game_id == game_id)
        .where(Round.round_number == game.current_round)
    ).first()

    if not round_obj:
        raise HTTPException(status_code=404, detail="Round not found")

    # Check if player already bid
    existing_bid = session.exec(
        select(Bid)
        .where(Bid.round_id == round_obj.id)
        .where(Bid.player_id == request.player_id)
    ).first()
    if existing_bid:
        raise HTTPException(status_code=400, detail="Player already bid")

    # Store bid
    bid = Bid(
        round_id=round_obj.id,
        player_id=request.player_id,
        bid_amount=request.bid
    )
    session.add(bid)

    # After human bid, make bots bid
    game_players = session.exec(
        select(GamePlayer)
        .where(GamePlayer.game_id == game_id)
        .order_by(GamePlayer.position)
    ).all()

    trump_suit = Suit(game.trump_suit) if game.trump_suit else None

    for gp in game_players:
        player = session.get(Player, gp.player_id)
        if player.is_bot:
            # Check if bot already bid
            bot_bid_exists = session.exec(
                select(Bid)
                .where(Bid.round_id == round_obj.id)
                .where(Bid.player_id == player.id)
            ).first()

            if not bot_bid_exists:
                hand = [Card.from_dict(c) for c in json.loads(gp.hand)]
                bot_bid_val = BotAI.make_bid(hand, trump_suit, game.current_round)
                bot_bid = Bid(
                    round_id=round_obj.id,
                    player_id=player.id,
                    bid_amount=bot_bid_val
                )
                session.add(bot_bid)

    # Check if all players have bid
    total_bids_count = session.exec(
        select(Bid).where(Bid.round_id == round_obj.id)
    ).all()

    if len(total_bids_count) >= WizardGameEngine.NUM_PLAYERS:
        game.status = GameStatus.PLAYING

    session.commit()

    return {"success": True, "bid": request.bid}

@router.post("/{game_id}/play")
async def play_card(
    game_id: UUID,
    request: PlayCardRequest,
    session: Session = Depends(get_session)
):
    """Play a card"""
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != GameStatus.PLAYING:
        raise HTTPException(status_code=400, detail="Not in playing phase")

    # Get player's hand
    game_player = session.exec(
        select(GamePlayer)
        .where(GamePlayer.game_id == game_id)
        .where(GamePlayer.player_id == request.player_id)
    ).first()

    if not game_player:
        raise HTTPException(status_code=404, detail="Player not in game")

    hand = [Card.from_dict(c) for c in json.loads(game_player.hand)]
    card_to_play = Card.from_dict(request.card)

    # Validate card is in hand
    if card_to_play not in hand:
        raise HTTPException(status_code=400, detail="Card not in hand")

    # Validate play
    current_trick_data = json.loads(game.current_trick)
    trick_cards_for_validation = [
        (Card.from_dict(t["card"]), UUID(t["player_id"]))
        for t in current_trick_data
    ]
    lead_suit = WizardGameEngine.get_lead_suit(trick_cards_for_validation)

    if not WizardGameEngine.is_valid_play(card_to_play, hand, lead_suit):
        raise HTTPException(status_code=400, detail="Invalid play - must follow suit")

    # Add to current trick
    current_trick_data.append({
        "card": card_to_play.to_dict(),
        "player_id": str(request.player_id)
    })
    game.current_trick = json.dumps(current_trick_data)

    # Remove card from hand
    hand.remove(card_to_play)
    game_player.hand = json.dumps([c.to_dict() for c in hand])

    # After human plays, if trick not full, make bots play
    if len(current_trick_data) < WizardGameEngine.NUM_PLAYERS:
        await bot_turns(game, session)
        # Reload trick after bots played
        current_trick_data = json.loads(game.current_trick)

    # Check if trick is complete
    if len(current_trick_data) >= WizardGameEngine.NUM_PLAYERS:
        await evaluate_trick(game, session)

    session.commit()

    return {"success": True}

async def bot_turns(game: Game, session: Session):
    """Make bots play their cards"""
    current_trick_data = json.loads(game.current_trick)

    game_players = session.exec(
        select(GamePlayer)
        .where(GamePlayer.game_id == game.id)
        .order_by(GamePlayer.position)
    ).all()

    # Simplified: loop through all players and if bot hasn't played in this trick, make them play
    for gp in game_players:
        if len(current_trick_data) >= WizardGameEngine.NUM_PLAYERS:
            break

        player = session.get(Player, gp.player_id)
        if player.is_bot:
            # Check if bot already played in this trick
            bot_played = any(UUID(t["player_id"]) == player.id for t in current_trick_data)
            if not bot_played:
                hand = [Card.from_dict(c) for c in json.loads(gp.hand)]
                trick_cards = [
                    (Card.from_dict(t["card"]), UUID(t["player_id"]))
                    for t in current_trick_data
                ]
                trump_suit = Suit(game.trump_suit) if game.trump_suit else None
                lead_suit = WizardGameEngine.get_lead_suit(trick_cards)

                card_to_play = BotAI.choose_card(hand, trick_cards, trump_suit, lead_suit)

                # Add to trick
                current_trick_data.append({
                    "card": card_to_play.to_dict(),
                    "player_id": str(player.id)
                })
                game.current_trick = json.dumps(current_trick_data)

                # Remove from hand
                hand.remove(card_to_play)
                gp.hand = json.dumps([c.to_dict() for c in hand])

async def start_round(game_id: UUID, session: Session):
    """Start a new round"""
    game = session.get(Game, game_id)

    # Create deck and deal
    deck = WizardGameEngine.create_deck()
    deck = WizardGameEngine.shuffle_deck(deck)

    hands, trump_card = WizardGameEngine.deal_cards(
        deck,
        WizardGameEngine.NUM_PLAYERS,
        game.current_round
    )

    # Set trump
    trump_suit = WizardGameEngine.determine_trump(trump_card)
    game.trump_suit = trump_suit.value if trump_suit else None
    game.trump_card = json.dumps(trump_card.to_dict() if trump_card else None)

    # Distribute hands
    game_players = session.exec(
        select(GamePlayer)
        .where(GamePlayer.game_id == game_id)
        .order_by(GamePlayer.position)
    ).all()

    for i, gp in enumerate(game_players):
        gp.hand = json.dumps([c.to_dict() for c in hands[i]])

    # Create round
    round_obj = Round(game_id=game_id, round_number=game.current_round)
    session.add(round_obj)

    game.status = GameStatus.BIDDING
    session.commit()

async def evaluate_trick(game: Game, session: Session):
    """Evaluate completed trick"""
    current_trick = json.loads(game.current_trick)

    # Convert to proper format for evaluation
    trick_cards = [
        (Card.from_dict(t["card"]), UUID(t["player_id"]))
        for t in current_trick
    ]

    trump_suit = Suit(game.trump_suit) if game.trump_suit else None
    lead_suit = WizardGameEngine.get_lead_suit(trick_cards)

    winner_player_id = WizardGameEngine.evaluate_trick(
        trick_cards,
        trump_suit,
        lead_suit
    )

    # Update tricks won
    round_obj = session.exec(
        select(Round)
        .where(Round.game_id == game.id)
        .where(Round.round_number == game.current_round)
    ).first()

    bid = session.exec(
        select(Bid)
        .where(Bid.round_id == round_obj.id)
        .where(Bid.player_id == winner_player_id)
    ).first()

    if bid:
        bid.tricks_won += 1

    # Clear trick
    game.current_trick = json.dumps([])

    # Check if round is over
    game_players = session.exec(
        select(GamePlayer).where(GamePlayer.game_id == game.id)
    ).all()

    all_hands_empty = all(
        len(json.loads(gp.hand)) == 0
        for gp in game_players
    )

    if all_hands_empty:
        await end_round(game, session)

async def end_round(game: Game, session: Session):
    """End the current round and calculate scores"""
    round_obj = session.exec(
        select(Round)
        .where(Round.game_id == game.id)
        .where(Round.round_number == game.current_round)
    ).first()

    bids = session.exec(
        select(Bid).where(Bid.round_id == round_obj.id)
    ).all()

    for bid in bids:
        bid.score = WizardGameEngine.calculate_score(
            bid.bid_amount,
            bid.tricks_won
        )

        # Update total score
        game_player = session.exec(
            select(GamePlayer)
            .where(GamePlayer.game_id == game.id)
            .where(GamePlayer.player_id == bid.player_id)
        ).first()

        game_player.total_score += bid.score

    # Check if game is over
    if game.current_round >= WizardGameEngine.MAX_ROUNDS:
        game.status = GameStatus.FINISHED
    else:
        game.current_round += 1
        await start_round(game.id, session)

    session.commit()

async def get_game_state(game_id: UUID, session: Session) -> GameStateResponse:
    """Helper to build game state response"""
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    game_players = session.exec(
        select(GamePlayer)
        .where(GamePlayer.game_id == game_id)
        .order_by(GamePlayer.position)
    ).all()

    players_data = []
    for gp in game_players:
        player = session.get(Player, gp.player_id)
        players_data.append({
            "id": str(player.id),
            "name": player.name,
            "is_bot": player.is_bot,
            "score": gp.total_score,
            "position": gp.position
        })

    return GameStateResponse(
        game_id=game.id,
        status=game.status,
        current_round=game.current_round,
        trump_suit=game.trump_suit,
        players=players_data,
        current_trick=json.loads(game.current_trick)
    )
