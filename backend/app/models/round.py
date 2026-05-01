from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .game import Game
    from .player import Player

class Round(SQLModel, table=True):
    __tablename__ = "rounds"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    game_id: UUID = Field(foreign_key="games.id")
    round_number: int

    # Relationships
    game: "Game" = Relationship(back_populates="rounds")
    bids: List["Bid"] = Relationship(back_populates="round")
    tricks: List["Trick"] = Relationship(back_populates="round")

class Bid(SQLModel, table=True):
    __tablename__ = "bids"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    round_id: UUID = Field(foreign_key="rounds.id")
    player_id: UUID = Field(foreign_key="players.id")
    bid_amount: int
    tricks_won: int = Field(default=0)
    score: int = Field(default=0)

    # Relationships
    round: Round = Relationship(back_populates="bids")

class Trick(SQLModel, table=True):
    __tablename__ = "tricks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    round_id: UUID = Field(foreign_key="rounds.id")
    trick_number: int
    winner_player_id: UUID = Field(foreign_key="players.id")

    # Relationships
    round: Round = Relationship(back_populates="tricks")
