from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from .player import Player
    from .round import Round

class GameStatus(str, Enum):
    WAITING = "waiting"
    BIDDING = "bidding"
    PLAYING = "playing"
    ROUND_END = "round_end"
    FINISHED = "finished"

class Game(SQLModel, table=True):
    __tablename__ = "games"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(default="Wizard Game")
    max_rounds: int = Field(default=15)
    status: GameStatus = Field(default=GameStatus.WAITING)
    current_round: int = Field(default=1)
    trump_suit: Optional[str] = None
    trump_card: Optional[str] = Field(default=None, sa_column=Column(JSON))
    deck_state: Optional[str] = Field(default=None, sa_column=Column(JSON))
    current_trick: Optional[str] = Field(default="[]", sa_column=Column(JSON))
    lead_suit: Optional[str] = None
    current_player_index: int = Field(default=0)
    dealer_index: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    game_players: List["GamePlayer"] = Relationship(back_populates="game")
    rounds: List["Round"] = Relationship(back_populates="game")

class GamePlayer(SQLModel, table=True):
    __tablename__ = "game_players"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    game_id: UUID = Field(foreign_key="games.id")
    player_id: UUID = Field(foreign_key="players.id")
    position: int = Field()  # 0-3
    total_score: int = Field(default=0)
    hand: Optional[str] = Field(default="[]", sa_column=Column(JSON))

    # Relationships
    game: Game = Relationship(back_populates="game_players")
    player: "Player" = Relationship(back_populates="game_players")
