import pytest
from app.core import game_logic

def test_create_deck():
    deck = game_logic.create_deck()
    assert len(deck) == 60
    wizards = [c for c in deck if c.card_type == game_logic.CardType.WIZARD]
    jesters = [c for c in deck if c.card_type == game_logic.CardType.JESTER]
    assert len(wizards) == 4
    assert len(jesters) == 4

def test_calculate_score():
    # Correct bid
    assert game_logic.calculate_score(2, 2) == 40 # 20 + 2*10
    assert game_logic.calculate_score(0, 0) == 20 # 20 + 0*10

    # Incorrect bid
    assert game_logic.calculate_score(2, 1) == -10 # -|2-1| * 10
    assert game_logic.calculate_score(1, 3) == -20 # -|1-3| * 10

def test_evaluate_trick():
    suit_flare = game_logic.Suit.FLARE
    suit_star = game_logic.Suit.STAR

    # Wizard wins
    cards = [
        (1, game_logic.Card(game_logic.CardType.NORMAL, suit_flare, 10)),
        (2, game_logic.Card(game_logic.CardType.WIZARD)),
        (3, game_logic.Card(game_logic.CardType.NORMAL, suit_flare, 13))
    ]
    assert game_logic.evaluate_trick(cards, suit_star, suit_flare) == 1

    # Trump wins
    cards = [
        (1, game_logic.Card(game_logic.CardType.NORMAL, suit_flare, 10)),
        (2, game_logic.Card(game_logic.CardType.NORMAL, suit_star, 2)),
        (3, game_logic.Card(game_logic.CardType.NORMAL, suit_flare, 13))
    ]
    assert game_logic.evaluate_trick(cards, suit_star, suit_flare) == 1

    # Lead suit wins
    cards = [
        (1, game_logic.Card(game_logic.CardType.NORMAL, suit_flare, 10)),
        (2, game_logic.Card(game_logic.CardType.NORMAL, suit_flare, 2)),
        (3, game_logic.Card(game_logic.CardType.NORMAL, suit_flare, 13))
    ]
    assert game_logic.evaluate_trick(cards, None, suit_flare) == 2

    # All jesters, first wins
    cards = [
        (1, game_logic.Card(game_logic.CardType.JESTER)),
        (2, game_logic.Card(game_logic.CardType.JESTER)),
        (3, game_logic.Card(game_logic.CardType.JESTER))
    ]
    assert game_logic.evaluate_trick(cards, suit_star, suit_flare) == 0
