import pytest
from app.core.game_logic import WizardGameEngine
from app.models.card import Card, CardType, Suit

def test_create_deck():
    deck = WizardGameEngine.create_deck()
    assert len(deck) == 60

    wizards = [c for c in deck if c.type == CardType.WIZARD]
    jesters = [c for c in deck if c.type == CardType.JESTER]
    normal = [c for c in deck if c.type == CardType.NORMAL]

    assert len(wizards) == 4
    assert len(jesters) == 4
    assert len(normal) == 52

def test_calculate_score():
    # Correct bid
    assert WizardGameEngine.calculate_score(3, 3) == 50
    assert WizardGameEngine.calculate_score(0, 0) == 20

    # Incorrect bid
    assert WizardGameEngine.calculate_score(3, 1) == -20
    assert WizardGameEngine.calculate_score(2, 4) == -20

def test_evaluate_trick():
    # Wizard wins
    trick = [
        (Card(type=CardType.NORMAL, suit=Suit.FLARE, value=14), 0),
        (Card(type=CardType.WIZARD), 1),
    ]
    assert WizardGameEngine.evaluate_trick(trick, None, Suit.FLARE) == 1

    # Trump wins
    trick = [
        (Card(type=CardType.NORMAL, suit=Suit.FLARE, value=14), 0),
        (Card(type=CardType.NORMAL, suit=Suit.STAR, value=2), 1),
    ]
    assert WizardGameEngine.evaluate_trick(trick, Suit.STAR, Suit.FLARE) == 1
