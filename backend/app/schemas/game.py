from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from app.models.game import GameStatus

class GameStateResponse(BaseModel):
    game_id: UUID
    status: GameStatus
    current_round: int
    trump_suit: Optional[str]
    players: List[dict]
    current_trick: List[dict]

class PlayCardRequest(BaseModel):
    player_id: UUID
    card: dict

class BidRequest(BaseModel):
    player_id: UUID
    bid: int
