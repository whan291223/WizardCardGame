from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from app.models.game import GameStatus

class GameCreate(BaseModel):
    name: str
    player_name: Optional[str] = "Human"

class GameStateResponse(BaseModel):
    id: UUID
    name: str
    status: GameStatus
    current_round: int
    max_rounds: int
    trump_suit: Optional[str]
    players: List[dict]
    current_trick: List[dict]
    current_player_index: Optional[int] = 0
    current_player_id: Optional[UUID] = None
    hand: Optional[List[dict]] = None

class PlayCardRequest(BaseModel):
    card_index: int

class BidRequest(BaseModel):
    player_id: Optional[UUID] = None
    bid: int
