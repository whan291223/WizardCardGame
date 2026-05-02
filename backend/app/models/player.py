from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime

if TYPE_CHECKING:
    from .game import GamePlayer

class PlayerBase(SQLModel):
    name: str = Field(max_length=100)
    is_bot: bool = Field(default=False)

class Player(PlayerBase, table=True):
    __tablename__ = "players"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    game_players: List["GamePlayer"] = Relationship(back_populates="player")

class PlayerPublic(PlayerBase):
    id: UUID

class PlayerCreate(PlayerBase):
    pass
