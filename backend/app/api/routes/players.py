from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from app.core.database import get_session
from app.models.player import Player, PlayerPublic, PlayerCreate

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
