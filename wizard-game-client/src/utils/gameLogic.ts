import type { Card, Player, Trick, Suit } from '../types/game.types';

export function determineLeadSuit(trick: Trick): Suit | null {
  // First non-jester card determines lead suit
  for (const playedCard of trick.cards) {
    if (playedCard.card.value !== 'jester') {
      return playedCard.card.suit;
    }
  }
  return null;
}

export function determineTrickWinner(
  trick: Trick,
  trumpSuit: Suit | null
): string | null {
  if (trick.cards.length === 0) return null;

  let winningCard = trick.cards[0];

  for (let i = 1; i < trick.cards.length; i++) {
    const current = trick.cards[i];

    // Wizard always wins
    if (current.card.value === 'wizard') {
      winningCard = current;
      continue;
    }

    // Wizard beats everything
    if (winningCard.card.value === 'wizard') continue;

    // Jester always loses
    if (current.card.value === 'jester') continue;
    if (winningCard.card.value === 'jester') {
      winningCard = current;
      continue;
    }

    // Trump suit beats non-trump
    if (trumpSuit) {
      const currentIsTrump = current.card.suit === trumpSuit;
      const winningIsTrump = winningCard.card.suit === trumpSuit;

      if (currentIsTrump && !winningIsTrump) {
        winningCard = current;
        continue;
      }
      if (!currentIsTrump && winningIsTrump) continue;

      // Both trump or both not trump - higher value wins
      if (currentIsTrump && winningIsTrump) {
        if (getCardNumericValue(current.card) > getCardNumericValue(winningCard.card)) {
          winningCard = current;
        }
        continue;
      }
    }

    // Follow suit - higher value wins
    const leadSuit = determineLeadSuit(trick);
    if (current.card.suit === leadSuit && winningCard.card.suit !== leadSuit) {
        winningCard = current;
    } else if (current.card.suit === winningCard.card.suit) {
      if (getCardNumericValue(current.card) > getCardNumericValue(winningCard.card)) {
        winningCard = current;
      }
    }
  }

  return winningCard.playerId;
}

function getCardNumericValue(card: Card): number {
  if (card.value === 'wizard') return 100;
  if (card.value === 'jester') return 0;
  return card.value as number;
}

export function canPlayCard(
  card: Card,
  hand: Card[],
  trick: Trick,
  _trumpSuit: Suit | null
): boolean {
  // First card of trick can be anything
  if (trick.cards.length === 0) return true;

  // Wizard and Jester can always be played
  if (card.value === 'wizard' || card.value === 'jester') return true;

  const leadSuit = determineLeadSuit(trick);

  // No lead suit yet (all jesters) - can play anything
  if (!leadSuit) return true;

  // If card matches lead suit, can play
  if (card.suit === leadSuit) return true;

  // Check if player has any cards of lead suit
  const hasLeadSuit = hand.some(c =>
    c.suit === leadSuit && c.value !== 'wizard' && c.value !== 'jester'
  );

  // If player doesn't have lead suit, can play anything
  return !hasLeadSuit;
}

export function calculateScore(player: Player): number {
  if (player.bid === null) return player.score;

  const tricksWon = player.tricksWon;
  const bid = player.bid;

  if (tricksWon === bid) {
    // Made bid exactly
    return player.score + 20 + (10 * bid);
  } else {
    // Missed bid
    const diff = Math.abs(tricksWon - bid);
    return player.score - (10 * diff);
  }
}

export function initializeRound(
  players: Player[],
  roundNumber: number,
  deck: Card[]
): { players: Player[], trumpCard: Card | null, remainingDeck: Card[] } {
  const cardsPerPlayer = roundNumber;
  let deckCopy = [...deck];

  // Deal cards
  const updatedPlayers: Player[] = players.map(player => ({
    ...player,
    hand: [],
    tricksWon: 0,
    bid: null
  }));

  for (let i = 0; i < cardsPerPlayer; i++) {
    updatedPlayers.forEach(player => {
      if (deckCopy.length > 0) {
        const card = deckCopy.pop();
        if (card) {
          player.hand.push(card);
        }
      }
    });
  }

  // Trump card (if cards remain)
  const trumpCard = deckCopy.length > 0 ? deckCopy.pop()! : null;

  return {
    players: updatedPlayers,
    trumpCard,
    remainingDeck: deckCopy
  };
}

export function getTrumpSuit(trumpCard: Card | null): Suit | null {
  if (!trumpCard) return null;
  if (trumpCard.value === 'wizard') {
    // In actual game dealer chooses, for single player let's just use none or first suit
    return null;
  }
  if (trumpCard.value === 'jester') return null;
  return trumpCard.suit;
}
