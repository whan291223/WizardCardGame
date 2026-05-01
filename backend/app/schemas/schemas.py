from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

class CardSchema(BaseModel):
    type: str
    suit: Optional[str] = None
    value: Optional[int] = None

class PlayerRead(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    order: int
    bid: Optional[int] = None
    tricks_won: int = 0
    score: int = 0
    hand_count: int = 0

class GameBase(BaseModel):
    name: str

class GameCreate(GameBase):
    pass

class GameRead(GameBase):
    id: int
    name: str
    status: str
    current_round: int
    max_rounds: int
    trump_suit: Optional[str] = None
    lead_suit: Optional[str] = None
    current_player_id: Optional[int] = None
    players: List[PlayerRead]

class GameState(GameRead):
    hand: List[CardSchema]
    current_trick: List[CardSchema]

class BidCreate(BaseModel):
    bid: int

class PlayCard(BaseModel):
    card_index: int
