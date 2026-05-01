import random
from typing import List, Optional, Tuple
from enum import Enum

class Suit(str, Enum):
    FLARE = "flare"
    POTTED_PLANT = "potted_plant"
    STAR = "star"
    NEARBY = "nearby"
    AUTO_AWESOME = "auto_awesome" # Special suit for Wizards/Jesters

class CardType(str, Enum):
    NORMAL = "normal"
    WIZARD = "wizard"
    JESTER = "jester"

class Card:
    def __init__(self, card_type: CardType, suit: Optional[Suit] = None, value: Optional[int] = None):
        self.card_type = card_type
        self.suit = suit
        self.value = value

    def __repr__(self):
        if self.card_type == CardType.WIZARD:
            return "W"
        if self.card_type == CardType.JESTER:
            return "J"
        return f"{self.suit.value[0].upper()}{self.value}"

    def to_dict(self):
        return {
            "type": self.card_type.value,
            "suit": self.suit.value if self.suit else None,
            "value": self.value
        }

def create_deck() -> List[Card]:
    deck = []
    # 4 suits, values 1-13
    for suit in [Suit.FLARE, Suit.POTTED_PLANT, Suit.STAR, Suit.NEARBY]:
        for value in range(1, 14):
            deck.append(Card(CardType.NORMAL, suit, value))

    # 4 Wizards
    for _ in range(4):
        deck.append(Card(CardType.WIZARD))

    # 4 Jesters
    for _ in range(4):
        deck.append(Card(CardType.JESTER))

    return deck

def shuffle_deck(deck: List[Card]) -> List[Card]:
    random.shuffle(deck)
    return deck

def evaluate_trick(played_cards: List[Tuple[int, Card]], trump_suit: Optional[Suit], lead_suit: Optional[Suit]) -> int:
    """
    Returns the index of the winning player.
    played_cards: List of (player_id, Card)
    """
    if not played_cards:
        return -1

    winner_index = 0
    winning_card = played_cards[0][1]

    # Special case: If first card is Wizard, it wins (unless another Wizard played later?
    # Standard rules: First Wizard played wins the trick)
    for i, (player_id, card) in enumerate(played_cards):
        if card.card_type == CardType.WIZARD:
            return i # First Wizard wins

    # If all cards are Jesters, the first player wins the trick (Standard rules)
    all_jesters = all(card.card_type == CardType.JESTER for _, card in played_cards)
    if all_jesters:
        return 0

    # Find the first non-jester card to determine lead suit if not provided
    # (Though lead_suit should be provided by the first non-jester card played)

    current_best_i = -1

    for i, (player_id, card) in enumerate(played_cards):
        if card.card_type == CardType.JESTER:
            continue

        if current_best_i == -1:
            current_best_i = i
            continue

        best_card = played_cards[current_best_i][1]

        # Trump comparison
        if trump_suit:
            if card.suit == trump_suit and best_card.suit != trump_suit:
                current_best_i = i
                continue
            if card.suit == trump_suit and best_card.suit == trump_suit:
                if card.value > best_card.value:
                    current_best_i = i
                continue

        # Lead suit comparison
        if card.suit == lead_suit:
            if best_card.suit == trump_suit:
                continue # Trump always beats lead suit
            if best_card.suit != lead_suit:
                current_best_i = i
                continue
            if card.value > best_card.value:
                current_best_i = i
                continue

    return current_best_i if current_best_i != -1 else 0

def calculate_score(bid: int, tricks_won: int) -> int:
    if bid == tricks_won:
        return 20 + (tricks_won * 10)
    else:
        return -abs(bid - tricks_won) * 10
