// Card Types
export type Suit = 'flare' | 'potted_plant' | 'star' | 'nearby' | 'none';
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 'wizard' | 'jester';

export interface Card {
  suit: Suit;
  value: CardValue;
  id: string; // Unique identifier
}

// Player Types
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  tricksWon: number;
  bid: number | null;
  score: number;
}

// Trick Types
export interface PlayedCard {
  card: Card;
  playerId: string;
}

export interface Trick {
  cards: PlayedCard[];
  leadSuit: Suit | null;
  winnerId: string | null;
}

// Game State
export type GamePhase = 'bidding' | 'playing' | 'roundEnd' | 'gameEnd';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentRound: number;
  maxRounds: number;
  trumpCard: Card | null;
  trumpSuit: Suit | null;
  currentTrick: Trick;
  completedTricks: Trick[];
  phase: GamePhase;
  deck: Card[];
}

// UI State
export interface UIState {
  selectedCardId: string | null;
  showBidDialog: boolean;
  showRoundSummary: boolean;
  animatingCard: string | null;
}
