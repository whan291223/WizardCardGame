from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.crud import crud
from app.schemas import schemas
from app.models.models import User, Game, Player, TrickCard
from app.core.db import get_session
from app.core import game_logic
from typing import List, Optional
import json

router = APIRouter()

@router.post("/users/", response_model=schemas.UserRead)
def create_user(user: schemas.UserCreate, session: Session = Depends(get_session)):
    return crud.create_user(session=session, user=user)

@router.get("/games/", response_model=List[schemas.GameRead])
def read_games(session: Session = Depends(get_session)):
    games = session.exec(select(Game)).all()
    # Need to manually populate PlayerRead because of how Relationship works in serialization
    result = []
    for game in games:
        players_read = []
        for p in game.players:
            user = session.get(User, p.user_id)
            players_read.append(schemas.PlayerRead(
                id=p.id, user_id=p.user_id, username=user.username,
                order=p.order, bid=p.bid, tricks_won=p.tricks_won,
                score=p.score, hand_count=len(p.get_hand())
            ))
        result.append(schemas.GameRead(
            id=game.id, name=game.name, status=game.status,
            current_round=game.current_round, max_rounds=game.max_rounds,
            trump_suit=game.trump_suit, lead_suit=game.lead_suit,
            current_player_id=game.current_player_id, players=players_read
        ))
    return result

@router.get("/games/{game_id}", response_model=schemas.GameState)
def read_game(game_id: int, user_id: Optional[int] = None, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    players_read = []
    current_user_player = None
    for p in game.players:
        user = session.get(User, p.user_id)
        players_read.append(schemas.PlayerRead(
            id=p.id, user_id=p.user_id, username=user.username,
            order=p.order, bid=p.bid, tricks_won=p.tricks_won,
            score=p.score, hand_count=len(p.get_hand())
        ))
        if user_id and p.user_id == user_id:
            current_user_player = p

    # Current trick
    trick_cards = session.exec(select(TrickCard).where(TrickCard.game_id == game_id).order_by(TrickCard.order)).all()
    current_trick = [json.loads(tc.card) for tc in trick_cards]

    return schemas.GameState(
        id=game.id, name=game.name, status=game.status,
        current_round=game.current_round, max_rounds=game.max_rounds,
        trump_suit=game.trump_suit, lead_suit=game.lead_suit,
        current_player_id=game.current_player_id, players=players_read,
        hand=current_user_player.get_hand() if current_user_player else [],
        current_trick=current_trick
    )

@router.post("/games/", response_model=schemas.GameRead)
def create_game(game: schemas.GameCreate, session: Session = Depends(get_session)):
    db_game = Game(name=game.name)
    session.add(db_game)
    session.commit()
    session.refresh(db_game)
    return schemas.GameRead(
        id=db_game.id, name=db_game.name, status=db_game.status,
        current_round=db_game.current_round, max_rounds=db_game.max_rounds,
        players=[]
    )

@router.post("/games/{game_id}/join", response_model=schemas.GameRead)
def join_game(game_id: int, user_id: int, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != "waiting":
        raise HTTPException(status_code=400, detail="Game already started")

    # Check if user already in game
    existing = session.exec(select(Player).where(Player.game_id == game_id, Player.user_id == user_id)).first()
    if existing:
        return _get_game_read(game, session)

    player = Player(user_id=user_id, game_id=game_id, order=len(game.players))
    session.add(player)
    session.commit()
    session.refresh(game)
    return _get_game_read(game, session)

@router.post("/games/{game_id}/start", response_model=schemas.GameRead)
def start_game(game_id: int, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if len(game.players) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 players")

    # Initialize first round
    game.current_round = 1
    game.status = "bidding"
    game.dealer_id = game.players[0].id
    game.current_player_id = game.players[0].id # Simplified: dealer starts bidding

    _setup_round(game, session)

    session.add(game)
    session.commit()
    session.refresh(game)
    return _get_game_read(game, session)

@router.post("/games/{game_id}/bid")
def place_bid(game_id: int, player_id: int, bid: schemas.BidCreate, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if game.status != "bidding" or game.current_player_id != player_id:
        raise HTTPException(status_code=400, detail="Not your turn to bid")

    player = session.get(Player, player_id)
    player.bid = bid.bid
    session.add(player)

    # Move to next player
    players = sorted(game.players, key=lambda p: p.order)
    curr_idx = next(i for i, p in enumerate(players) if p.id == player_id)
    next_idx = (curr_idx + 1) % len(players)

    if next_idx == 0: # Everyone bidded
        game.status = "playing"
        game.current_player_id = game.dealer_id # Simplified: dealer starts playing
    else:
        game.current_player_id = players[next_idx].id

    session.add(game)
    session.commit()
    return {"message": "Bid placed"}

@router.post("/games/{game_id}/play")
def play_card(game_id: int, player_id: int, play: schemas.PlayCard, session: Session = Depends(get_session)):
    game = session.get(Game, game_id)
    if game.status != "playing" or game.current_player_id != player_id:
        raise HTTPException(status_code=400, detail="Not your turn to play")

    player = session.get(Player, player_id)
    hand = player.get_hand()
    if play.card_index >= len(hand):
        raise HTTPException(status_code=400, detail="Invalid card index")

    card_data = hand.pop(play.card_index)
    player.set_hand(hand)
    session.add(player)

    # Record trick card
    existing_tricks = session.exec(select(TrickCard).where(TrickCard.game_id == game_id)).all()
    trick_card = TrickCard(game_id=game_id, player_id=player_id, card=json.dumps(card_data), order=len(existing_tricks))
    session.add(trick_card)

    # Update lead suit if first card
    if len(existing_tricks) == 0:
        if card_data["type"] == "normal":
            game.lead_suit = card_data["suit"]
        elif card_data["type"] == "wizard":
            # Lead suit stays None or special? Standard: first player after wizard determines lead suit if it's still none.
            # Simplified: first normal card sets lead suit.
            pass

    # Move to next player
    players = sorted(game.players, key=lambda p: p.order)
    curr_idx = next(i for i, p in enumerate(players) if p.id == player_id)
    next_idx = (curr_idx + 1) % len(players)

    if len(existing_tricks) + 1 == len(players):
        # Trick finished
        all_played = session.exec(select(TrickCard).where(TrickCard.game_id == game_id)).all()
        # Evaluate winner
        played_tuples = []
        for tp in sorted(all_played + [trick_card], key=lambda x: x.order):
            c = game_logic.Card(game_logic.CardType(json.loads(tp.card)["type"]),
                                game_logic.Suit(json.loads(tp.card)["suit"]) if json.loads(tp.card)["suit"] else None,
                                json.loads(tp.card)["value"])
            played_tuples.append((tp.player_id, c))

        winner_idx = game_logic.evaluate_trick(played_tuples,
                                              game_logic.Suit(game.trump_suit) if game.trump_suit else None,
                                              game_logic.Suit(game.lead_suit) if game.lead_suit else None)
        winner_player_id = played_tuples[winner_idx][0]
        winner = session.get(Player, winner_player_id)
        winner.tricks_won += 1
        session.add(winner)

        # Reset trick
        for tp in all_played + [trick_card]:
            session.delete(tp)
        game.lead_suit = None
        game.current_player_id = winner_player_id

        # Check if round finished
        if len(winner.get_hand()) == 0:
            _end_round(game, session)
    else:
        game.current_player_id = players[next_idx].id

    session.add(game)
    session.commit()
    return {"message": "Card played"}

def _get_game_read(game: Game, session: Session) -> schemas.GameRead:
    players_read = []
    for p in game.players:
        user = session.get(User, p.user_id)
        players_read.append(schemas.PlayerRead(
            id=p.id, user_id=p.user_id, username=user.username,
            order=p.order, bid=p.bid, tricks_won=p.tricks_won,
            score=p.score, hand_count=len(p.get_hand())
        ))
    return schemas.GameRead(
        id=game.id, name=game.name, status=game.status,
        current_round=game.current_round, max_rounds=game.max_rounds,
        trump_suit=game.trump_suit, lead_suit=game.lead_suit,
        current_player_id=game.current_player_id, players=players_read
    )

def _setup_round(game: Game, session: Session):
    deck = game_logic.create_deck()
    game_logic.shuffle_deck(deck)

    num_cards = game.current_round
    for player in game.players:
        hand = [deck.pop().to_dict() for _ in range(num_cards)]
        player.set_hand(hand)
        player.bid = None
        player.tricks_won = 0
        session.add(player)

    if deck:
        trump_card = deck.pop()
        if trump_card.card_type == game_logic.CardType.WIZARD:
            # Dealer chooses trump? Simplified: Random suit
            game.trump_suit = random.choice([s.value for s in game_logic.Suit if s != game_logic.Suit.AUTO_AWESOME])
        elif trump_card.card_type == game_logic.CardType.JESTER:
            game.trump_suit = None
        else:
            game.trump_suit = trump_card.suit.value
    else:
        game.trump_suit = None

def _end_round(game: Game, session: Session):
    for player in game.players:
        player.score += game_logic.calculate_score(player.bid or 0, player.tricks_won)
        session.add(player)

    if game.current_round < game.max_rounds:
        game.current_round += 1
        game.status = "bidding"
        # Move dealer
        players = sorted(game.players, key=lambda p: p.order)
        curr_dealer_idx = next(i for i, p in enumerate(players) if p.id == game.dealer_id)
        next_dealer_idx = (curr_dealer_idx + 1) % len(players)
        game.dealer_id = players[next_dealer_idx].id
        game.current_player_id = game.dealer_id
        _setup_round(game, session)
    else:
        game.status = "finished"

import random # Needed for _setup_round random choice
