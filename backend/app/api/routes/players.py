from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List
from uuid import UUID

from app.core.database import get_session
from app.models.player import Player, PlayerPublic, PlayerCreate
from app.models.game import GamePlayer, Game
from app.schemas.game import GameStateResponse

router = APIRouter(prefix="/players", tags=["players"])

@router.post("/", response_model=PlayerPublic)
async def create_player(
    player: PlayerCreate,
    session: Session = Depends(get_session)
):
    """Create a new player"""
    db_player = Player.model_validate(player)
    session.add(db_player)
    session.commit()
    session.refresh(db_player)
    return db_player

@router.get("/", response_model=List[PlayerPublic])
async def list_players(session: Session = Depends(get_session)):
    """List all players"""
    players = session.exec(select(Player)).all()
    return players

@router.get("/leaderboard", response_model=List[PlayerPublic])
async def get_leaderboard(session: Session = Depends(get_session)):
    """Get leaderboard (placeholder logic)"""
    players = session.exec(select(Player).limit(10)).all()
    return players

@router.get("/{player_id}", response_model=PlayerPublic)
async def get_player(
    player_id: UUID,
    session: Session = Depends(get_session)
):
    """Get player by ID"""
    player = session.get(Player, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.get("/{player_id}/games", response_model=List[GameStateResponse])
async def get_player_games(
    player_id: UUID,
    session: Session = Depends(get_session)
):
    """Get games for a player"""
    game_players = session.exec(
        select(GamePlayer).where(GamePlayer.player_id == player_id)
    ).all()

    games_data = []
    from .games import get_game_state
    for gp in game_players:
        try:
            state = await get_game_state(gp.game_id, session, user_id=player_id)
            games_data.append(state)
        except HTTPException:
            continue

    return games_data
