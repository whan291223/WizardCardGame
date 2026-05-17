import type { Card, Suit, CardValue } from '../types/game.types';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits: Suit[] = ['flare', 'potted_plant', 'star', 'nearby'];
  const values: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  // Regular cards
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({
        suit,
        value,
        id: `${suit}-${value}`
      });
    });
  });

  // Add 4 Wizards
  for (let i = 0; i < 4; i++) {
    deck.push({
      suit: 'none',
      value: 'wizard',
      id: `wizard-${i}`
    });
  }

  // Add 4 Jesters
  for (let i = 0; i < 4; i++) {
    deck.push({
      suit: 'none',
      value: 'jester',
      id: `jester-${i}`
    });
  }

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardDisplayValue(card: Card): string {
  if (card.value === 'wizard') return 'W';
  if (card.value === 'jester') return 'J';
  if (card.value === 1) return 'A';
  if (card.value === 11) return 'J';
  if (card.value === 12) return 'Q';
  if (card.value === 13) return 'K';
  return card.value.toString();
}

export function getCardColor(suit: Suit): string {
  if (suit === 'flare' || suit === 'star') return '#dc2626'; // Reddish
  if (suit === 'potted_plant' || suit === 'nearby') return '#1f2937'; // Darkish
  return '#6b7280'; // For wizards/jesters
}

export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    flare: '🔥',
    potted_plant: '🪴',
    star: '⭐',
    nearby: '📍',
    none: ''
  };
  return symbols[suit];
}
