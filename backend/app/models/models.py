from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List, Dict
import json

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str

class Game(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    status: str = "waiting" # waiting, bidding, playing, finished
    current_round: int = 0
    max_rounds: int = 15
    trump_suit: Optional[str] = None
    lead_suit: Optional[str] = None
    dealer_id: Optional[int] = None
    current_player_id: Optional[int] = None

    players: List["Player"] = Relationship(back_populates="game")

class Player(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    game_id: int = Field(foreign_key="game.id")
    order: int = 0
    hand: str = "[]" # JSON list of cards
    bid: Optional[int] = None
    tricks_won: int = 0
    score: int = 0

    game: Game = Relationship(back_populates="players")

    def get_hand(self):
        return json.loads(self.hand)

    def set_hand(self, hand_list):
        self.hand = json.dumps(hand_list)

class TrickCard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    game_id: int = Field(foreign_key="game.id")
    player_id: int = Field(foreign_key="player.id")
    card: str # JSON of card
    order: int # order in the trick
