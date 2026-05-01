from typing import List, Optional, Tuple
from app.models.card import Card, CardType, Suit
import random

class BotAI:
    """Simple AI for bot players"""

    @staticmethod
    def make_bid(hand: List[Card], trump_suit: Optional[Suit], round_num: int) -> int:
        """Bot makes a bid based on hand strength"""
        strength = 0

        for card in hand:
            if card.type == CardType.WIZARD:
                strength += 1.0  # Wizard always wins
            elif card.type == CardType.JESTER:
                strength += 0.0  # Jester never wins
            elif card.type == CardType.NORMAL:
                # High cards are worth more
                if card.value >= 12:  # Q, K, A
                    strength += 0.7
                elif card.value >= 10:  # 10, J
                    strength += 0.5
                else:
                    strength += 0.3

                # Trump cards are worth more
                if trump_suit and card.suit == trump_suit:
                    strength += 0.3

        # Add some randomness
        bid = int(strength + random.uniform(-0.5, 0.5))

        # Clamp to valid range
        return max(0, min(bid, round_num))

    @staticmethod
    def choose_card(
        hand: List[Card],
        trick: List[Tuple[Card, int]],
        trump_suit: Optional[Suit],
        lead_suit: Optional[Suit]
    ) -> Card:
        """Bot chooses a card to play"""
        from app.core.game_logic import WizardGameEngine

        # Filter valid cards
        valid_cards = [
            card for card in hand
            if WizardGameEngine.is_valid_play(card, hand, lead_suit)
        ]

        if not valid_cards:
            return hand[0]

        # Simple strategy:
        # - Play wizard if we have one
        # - Play jester if losing anyway
        # - Try to win with trump or high card
        # - Otherwise play lowest card

        wizards = [c for c in valid_cards if c.type == CardType.WIZARD]
        if wizards:
            return wizards[0]

        jesters = [c for c in valid_cards if c.type == CardType.JESTER]
        normal_cards = [c for c in valid_cards if c.type == CardType.NORMAL]

        if not trick:
            # Leading - play highest card
            if normal_cards:
                return max(normal_cards, key=lambda c: c.value)
            return valid_cards[0]

        # Try to win with trump
        if trump_suit and normal_cards:
            trump_cards = [c for c in normal_cards if c.suit == trump_suit]
            if trump_cards:
                return max(trump_cards, key=lambda c: c.value)

        # Try to win with high card of lead suit
        if lead_suit and normal_cards:
            lead_cards = [c for c in normal_cards if c.suit == lead_suit]
            if lead_cards:
                return max(lead_cards, key=lambda c: c.value)

        # Can't win - play lowest card or jester
        if jesters:
            return jesters[0]

        if normal_cards:
            return min(normal_cards, key=lambda c: c.value)

        return valid_cards[0]
