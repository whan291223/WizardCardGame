from enum import Enum
from sqlmodel import SQLModel, Field
from typing import Optional

class CardType(str, Enum):
    NORMAL = "normal"
    WIZARD = "wizard"
    JESTER = "jester"

class Suit(str, Enum):
    FLARE = "flare"
    POTTED_PLANT = "potted_plant"
    STAR = "star"
    NEARBY = "nearby"

class Card(SQLModel):
    """Card representation (not stored in DB, used in-memory)"""
    type: CardType
    suit: Optional[Suit] = None
    value: Optional[int] = None  # 2-14 (11=J, 12=Q, 13=K, 14=A)

    def __str__(self) -> str:
        if self.type == CardType.WIZARD:
            return "Wizard"
        elif self.type == CardType.JESTER:
            return "Jester"
        else:
            value_map = {11: "J", 12: "Q", 13: "K", 14: "A"}
            val = value_map.get(self.value, str(self.value))
            return f"{val}{self.suit.value[0].upper()}"

    def to_dict(self) -> dict:
        return {
            "type": self.type,
            "suit": self.suit,
            "value": self.value
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Card":
        return cls(**data)
