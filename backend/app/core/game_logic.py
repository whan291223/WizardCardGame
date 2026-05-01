from typing import List, Optional, Tuple
from app.models.card import Card, CardType, Suit
import random

class WizardGameEngine:
    """Core game logic for Wizard card game"""

    MAX_ROUNDS = 15
    NUM_PLAYERS = 4

    @staticmethod
    def create_deck() -> List[Card]:
        """Create a 60-card Wizard deck"""
        deck = []

        # Add 52 normal cards (13 cards × 4 suits)
        for suit in Suit:
            for value in range(2, 15):  # 2-14 (Ace is 14)
                deck.append(Card(type=CardType.NORMAL, suit=suit, value=value))

        # Add 4 Wizards and 4 Jesters
        for _ in range(4):
            deck.append(Card(type=CardType.WIZARD))
            deck.append(Card(type=CardType.JESTER))

        return deck

    @staticmethod
    def shuffle_deck(deck: List[Card]) -> List[Card]:
        """Shuffle the deck"""
        shuffled = deck.copy()
        random.shuffle(shuffled)
        return shuffled

    @staticmethod
    def deal_cards(
        deck: List[Card],
        num_players: int,
        round_num: int
    ) -> Tuple[List[List[Card]], Optional[Card]]:
        """
        Deal cards for a round
        Returns: (hands, trump_card)
        """
        hands = [[] for _ in range(num_players)]
        deck_copy = deck.copy()

        # Deal round_num cards to each player
        for i in range(round_num):
            for player_idx in range(num_players):
                if deck_copy:
                    hands[player_idx].append(deck_copy.pop())

        # Flip trump card if any cards remain
        trump_card = deck_copy.pop() if deck_copy else None

        return hands, trump_card

    @staticmethod
    def determine_trump(trump_card: Optional[Card]) -> Optional[Suit]:
        """Determine trump suit from flipped card"""
        if not trump_card:
            return None

        if trump_card.type == CardType.JESTER:
            return None
        elif trump_card.type == CardType.WIZARD:
            # In real game, dealer chooses - for now, random
            return random.choice(list(Suit))
        else:
            return trump_card.suit

    @staticmethod
    def is_valid_play(
        card: Card,
        hand: List[Card],
        lead_suit: Optional[Suit]
    ) -> bool:
        """Check if playing this card is valid"""
        # Wizards and Jesters can always be played
        if card.type in [CardType.WIZARD, CardType.JESTER]:
            return True

        # If no lead suit yet, any card is valid
        if lead_suit is None:
            return True

        # If player has lead suit, must follow
        has_lead_suit = any(
            c.type == CardType.NORMAL and c.suit == lead_suit
            for c in hand
        )

        if has_lead_suit:
            return card.type == CardType.NORMAL and card.suit == lead_suit

        # If no lead suit in hand, any card is valid
        return True

    @staticmethod
    def evaluate_trick(
        trick: List[Tuple[Card, int]],
        trump_suit: Optional[Suit],
        lead_suit: Optional[Suit]
    ) -> int:
        """
        Determine winner of a trick

        Args:
            trick: List of (card, player_index) tuples
            trump_suit: Current trump suit
            lead_suit: First suit played in this trick

        Returns:
            player_index of winner
        """
        if not trick:
            return -1

        winner_idx = 0
        winning_card = trick[0][0]
        winning_player = trick[0][1]

        for i in range(1, len(trick)):
            card, player_idx = trick[i]

            # Wizard beats everything except earlier wizards
            if card.type == CardType.WIZARD:
                if winning_card.type != CardType.WIZARD:
                    winner_idx = i
                    winning_card = card
                    winning_player = player_idx
                # First wizard wins if multiple wizards

            elif winning_card.type == CardType.WIZARD:
                # Current card can't beat a wizard
                continue

            # Jester loses to everything except other jesters
            elif card.type == CardType.JESTER:
                continue

            elif winning_card.type == CardType.JESTER:
                # Any non-jester beats a jester
                winner_idx = i
                winning_card = card
                winning_player = player_idx

            # Both are normal cards
            elif card.type == CardType.NORMAL and winning_card.type == CardType.NORMAL:
                # Trump beats non-trump
                if trump_suit and card.suit == trump_suit and winning_card.suit != trump_suit:
                    winner_idx = i
                    winning_card = card
                    winning_player = player_idx

                # Higher trump beats lower trump
                elif trump_suit and card.suit == trump_suit and winning_card.suit == trump_suit:
                    if card.value > winning_card.value:
                        winner_idx = i
                        winning_card = card
                        winning_player = player_idx

                # Lead suit beats off-suit (when no trump involved)
                elif lead_suit and card.suit == lead_suit and winning_card.suit != lead_suit:
                    if winning_card.suit != trump_suit:
                        winner_idx = i
                        winning_card = card
                        winning_player = player_idx

                # Same suit - higher value wins
                elif card.suit == winning_card.suit:
                    if card.value > winning_card.value:
                        winner_idx = i
                        winning_card = card
                        winning_player = player_idx

        return winning_player

    @staticmethod
    def calculate_score(bid: int, tricks_won: int) -> int:
        """
        Calculate score for a round

        Scoring rules:
        - Correct bid: 20 + (10 × tricks won)
        - Incorrect bid: -10 × |difference|
        """
        if bid == tricks_won:
            return 20 + (10 * tricks_won)
        else:
            return -10 * abs(bid - tricks_won)

    @staticmethod
    def get_lead_suit(trick: List[Tuple[Card, int]]) -> Optional[Suit]:
        """Determine the lead suit from a trick"""
        for card, _ in trick:
            if card.type == CardType.NORMAL:
                return card.suit
        return None
