# Wizard Card Game - Frontend Guide (TypeScript + React)

## Overview
This guide covers building the frontend for a Wizard card game, starting with hot-seat single player, then adding multiplayer support.

---

## Phase 1: Project Setup

### Initialize Project
```bash
npm create vite@latest wizard-game-client -- --template react-ts
cd wizard-game-client
npm install
npm install socket.io-client  # For Phase 2
```

---

## Core Type Definitions

Create `src/types/game.types.ts`:

```typescript
// Card Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'none';
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
```

---

## Phase 1: Single Player (Hot Seat)

### Step 1: Card Utilities

Create `src/utils/cardUtils.ts`:

```typescript
import { Card, Suit, CardValue } from '../types/game.types';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
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
  if (suit === 'hearts' || suit === 'diamonds') return '#dc2626';
  if (suit === 'clubs' || suit === 'spades') return '#1f2937';
  return '#6b7280'; // For wizards/jesters
}

export function getSuitSymbol(suit: Suit): string {
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
    none: ''
  };
  return symbols[suit];
}
```

### Step 2: Game Logic

Create `src/utils/gameLogic.ts`:

```typescript
import { Card, Player, Trick, PlayedCard, Suit, GameState } from '../types/game.types';

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
    if (current.card.suit === winningCard.card.suit) {
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
  trumpSuit: Suit | null
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
  const updatedPlayers = players.map(player => ({
    ...player,
    hand: [],
    tricksWon: 0,
    bid: null
  }));

  for (let i = 0; i < cardsPerPlayer; i++) {
    updatedPlayers.forEach(player => {
      if (deckCopy.length > 0) {
        player.hand.push(deckCopy.pop()!);
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
    // Dealer chooses - for hot seat, can prompt
    return null; // Implement dealer choice
  }
  if (trumpCard.value === 'jester') return null;
  return trumpCard.suit;
}
```

### Step 3: Game State Hook

Create `src/hooks/useGameState.ts`:

```typescript
import { useState, useCallback } from 'react';
import { GameState, Player, Card, GamePhase } from '../types/game.types';
import { createDeck, shuffleDeck } from '../utils/cardUtils';
import { 
  initializeRound, 
  getTrumpSuit, 
  determineTrickWinner,
  canPlayCard,
  calculateScore,
  determineLeadSuit
} from '../utils/gameLogic';

export function useGameState(playerCount: number = 4) {
  const [gameState, setGameState] = useState<GameState>(() => 
    initializeGame(playerCount)
  );

  const placeBid = useCallback((playerId: string, bid: number) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(p =>
        p.id === playerId ? { ...p, bid } : p
      );

      // Check if all players have bid
      const allBid = updatedPlayers.every(p => p.bid !== null);
      
      return {
        ...prev,
        players: updatedPlayers,
        phase: allBid ? 'playing' : 'bidding',
        currentPlayerIndex: allBid ? 0 : (prev.currentPlayerIndex + 1) % prev.players.length
      };
    });
  }, []);

  const playCard = useCallback((playerId: string, cardId: string) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === playerId);
      if (!player) return prev;

      const card = player.hand.find(c => c.id === cardId);
      if (!card) return prev;

      // Validate card can be played
      if (!canPlayCard(card, player.hand, prev.currentTrick, prev.trumpSuit)) {
        return prev;
      }

      // Remove card from hand and add to trick
      const updatedPlayers = prev.players.map(p =>
        p.id === playerId
          ? { ...p, hand: p.hand.filter(c => c.id !== cardId) }
          : p
      );

      const updatedTrick = {
        ...prev.currentTrick,
        cards: [...prev.currentTrick.cards, { card, playerId }],
        leadSuit: prev.currentTrick.cards.length === 0 
          ? (card.value === 'jester' ? null : card.suit)
          : prev.currentTrick.leadSuit
      };

      // Check if trick is complete
      if (updatedTrick.cards.length === prev.players.length) {
        const winnerId = determineTrickWinner(updatedTrick, prev.trumpSuit);
        const winnerIndex = prev.players.findIndex(p => p.id === winnerId);

        // Award trick to winner
        const playersWithTrick = updatedPlayers.map(p =>
          p.id === winnerId ? { ...p, tricksWon: p.tricksWon + 1 } : p
        );

        // Check if round is complete
        const roundComplete = playersWithTrick[0].hand.length === 0;

        if (roundComplete) {
          // Calculate scores
          const playersWithScores = playersWithTrick.map(p => ({
            ...p,
            score: calculateScore(p)
          }));

          return {
            ...prev,
            players: playersWithScores,
            completedTricks: [...prev.completedTricks, updatedTrick],
            currentTrick: { cards: [], leadSuit: null, winnerId: null },
            phase: 'roundEnd'
          };
        }

        // Start new trick
        return {
          ...prev,
          players: playersWithTrick,
          currentTrick: { cards: [], leadSuit: null, winnerId: null },
          completedTricks: [...prev.completedTricks, updatedTrick],
          currentPlayerIndex: winnerIndex
        };
      }

      // Continue current trick
      return {
        ...prev,
        players: updatedPlayers,
        currentTrick: updatedTrick,
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
      };
    });
  }, []);

  const startNextRound = useCallback(() => {
    setGameState(prev => {
      const nextRound = prev.currentRound + 1;

      if (nextRound > prev.maxRounds) {
        return { ...prev, phase: 'gameEnd' };
      }

      const deck = shuffleDeck(createDeck());
      const { players, trumpCard } = initializeRound(prev.players, nextRound, deck);

      return {
        ...prev,
        players,
        currentRound: nextRound,
        trumpCard,
        trumpSuit: getTrumpSuit(trumpCard),
        currentTrick: { cards: [], leadSuit: null, winnerId: null },
        completedTricks: [],
        phase: 'bidding',
        currentPlayerIndex: 0,
        deck
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initializeGame(playerCount));
  }, [playerCount]);

  return {
    gameState,
    placeBid,
    playCard,
    startNextRound,
    resetGame
  };
}

function initializeGame(playerCount: number): GameState {
  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    id: `player-${i}`,
    name: `Player ${i + 1}`,
    hand: [],
    tricksWon: 0,
    bid: null,
    score: 0
  }));

  const deck = shuffleDeck(createDeck());
  const maxRounds = Math.floor(60 / playerCount); // Standard Wizard rules

  const { players: dealtPlayers, trumpCard } = initializeRound(players, 1, deck);

  return {
    players: dealtPlayers,
    currentPlayerIndex: 0,
    currentRound: 1,
    maxRounds,
    trumpCard,
    trumpSuit: getTrumpSuit(trumpCard),
    currentTrick: { cards: [], leadSuit: null, winnerId: null },
    completedTricks: [],
    phase: 'bidding',
    deck
  };
}
```

### Step 4: Card Component

Create `src/components/Card.tsx`:

```typescript
import React from 'react';
import { Card as CardType } from '../types/game.types';
import { getCardDisplayValue, getCardColor, getSuitSymbol } from '../utils/cardUtils';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  selected = false,
  disabled = false,
  small = false 
}) => {
  const isSpecial = card.value === 'wizard' || card.value === 'jester';
  const color = getCardColor(card.suit);
  const displayValue = getCardDisplayValue(card);
  const suitSymbol = getSuitSymbol(card.suit);

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        ${small ? 'w-16 h-24' : 'w-20 h-28'}
        bg-white border-2 rounded-lg shadow-md
        flex flex-col items-center justify-between p-2
        transition-all duration-200
        ${onClick && !disabled ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''}
        ${selected ? 'ring-4 ring-blue-500 -translate-y-2' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSpecial ? 'bg-gradient-to-br from-purple-100 to-blue-100' : ''}
      `}
      style={{ borderColor: color }}
    >
      <div className="text-left w-full">
        <div className={`font-bold ${small ? 'text-sm' : 'text-lg'}`} style={{ color }}>
          {displayValue}
        </div>
        {suitSymbol && (
          <div className={small ? 'text-xs' : 'text-base'} style={{ color }}>
            {suitSymbol}
          </div>
        )}
      </div>

      <div className={`${small ? 'text-2xl' : 'text-4xl'}`} style={{ color }}>
        {isSpecial ? (card.value === 'wizard' ? '🧙' : '🃏') : suitSymbol}
      </div>

      <div className="text-right w-full transform rotate-180">
        <div className={`font-bold ${small ? 'text-sm' : 'text-lg'}`} style={{ color }}>
          {displayValue}
        </div>
        {suitSymbol && (
          <div className={small ? 'text-xs' : 'text-base'} style={{ color }}>
            {suitSymbol}
          </div>
        )}
      </div>
    </div>
  );
};
```

### Step 5: Main Game Component

Create `src/components/GameBoard.tsx`:

```typescript
import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { Card } from './Card';

export const GameBoard: React.FC = () => {
  const { gameState, placeBid, playCard, startNextRound, resetGame } = useGameState(4);
  const [bidInput, setBidInput] = useState('');

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  const handleBid = () => {
    const bid = parseInt(bidInput);
    if (!isNaN(bid) && bid >= 0 && bid <= currentPlayer.hand.length) {
      placeBid(currentPlayer.id, bid);
      setBidInput('');
    }
  };

  const handlePlayCard = (cardId: string) => {
    playCard(currentPlayer.id, cardId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Wizard Card Game</h1>
          <div className="flex justify-center gap-8 text-white">
            <div>Round: {gameState.currentRound}/{gameState.maxRounds}</div>
            <div>Phase: {gameState.phase}</div>
            {gameState.trumpCard && (
              <div className="flex items-center gap-2">
                Trump: 
                <div className="inline-block scale-75">
                  <Card card={gameState.trumpCard} small />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {gameState.players.map((player, idx) => (
            <div
              key={player.id}
              className={`
                bg-white rounded-lg p-3
                ${idx === gameState.currentPlayerIndex ? 'ring-4 ring-yellow-400' : ''}
              `}
            >
              <div className="font-bold">{player.name}</div>
              <div className="text-sm text-gray-600">Score: {player.score}</div>
              <div className="text-sm text-gray-600">
                Bid: {player.bid ?? '-'} | Tricks: {player.tricksWon}
              </div>
            </div>
          ))}
        </div>

        {/* Current Trick */}
        {gameState.currentTrick.cards.length > 0 && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-white mb-4 text-center">Current Trick</h2>
            <div className="flex justify-center gap-4">
              {gameState.currentTrick.cards.map((playedCard, idx) => {
                const player = gameState.players.find(p => p.id === playedCard.playerId);
                return (
                  <div key={idx} className="text-center">
                    <Card card={playedCard.card} />
                    <div className="text-white mt-2">{player?.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bidding Phase */}
        {gameState.phase === 'bidding' && (
          <div className="bg-white rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">
              {currentPlayer.name}'s Bid (Hand size: {currentPlayer.hand.length})
            </h2>
            <div className="flex gap-4">
              <input
                type="number"
                min="0"
                max={currentPlayer.hand.length}
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value)}
                className="border-2 border-gray-300 rounded px-4 py-2"
                placeholder="Enter bid"
              />
              <button
                onClick={handleBid}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Place Bid
              </button>
            </div>
          </div>
        )}

        {/* Playing Phase - Current Player's Hand */}
        {gameState.phase === 'playing' && (
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              {currentPlayer.name}'s Turn - Select a Card
            </h2>
            <div className="flex justify-center gap-2 flex-wrap">
              {currentPlayer.hand.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handlePlayCard(card.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Round End */}
        {gameState.phase === 'roundEnd' && (
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Round {gameState.currentRound} Complete!</h2>
            <div className="mb-4">
              {gameState.players.map(player => (
                <div key={player.id} className="mb-2">
                  {player.name}: Bid {player.bid}, Won {player.tricksWon} - Score: {player.score}
                </div>
              ))}
            </div>
            <button
              onClick={startNextRound}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600"
            >
              Next Round
            </button>
          </div>
        )}

        {/* Game End */}
        {gameState.phase === 'gameEnd' && (
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <div className="mb-4">
              {[...gameState.players]
                .sort((a, b) => b.score - a.score)
                .map((player, idx) => (
                  <div key={player.id} className="text-xl mb-2">
                    {idx + 1}. {player.name}: {player.score} points
                  </div>
                ))}
            </div>
            <button
              onClick={resetGame}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600"
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Step 6: Main App

Update `src/App.tsx`:

```typescript
import { GameBoard } from './components/GameBoard';

function App() {
  return <GameBoard />;
}

export default App;
```

---

## Phase 2: Adding Multiplayer

### Step 1: Socket Connection Hook

Create `src/hooks/useSocket.ts`:

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(serverUrl: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(serverUrl);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  return { socket, connected };
}
```

### Step 2: Multiplayer Game Hook

Create `src/hooks/useMultiplayerGame.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '../types/game.types';

interface UseMultiplayerGameProps {
  socket: Socket | null;
  roomId: string;
  playerId: string;
}

export function useMultiplayerGame({ socket, roomId, playerId }: UseMultiplayerGameProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(-1);

  useEffect(() => {
    if (!socket) return;

    // Listen for game state updates
    socket.on('gameStateUpdate', (state: GameState) => {
      setGameState(state);
      const index = state.players.findIndex(p => p.id === playerId);
      setMyPlayerIndex(index);
    });

    // Join room
    socket.emit('joinRoom', { roomId, playerId });

    return () => {
      socket.off('gameStateUpdate');
    };
  }, [socket, roomId, playerId]);

  const placeBid = useCallback((bid: number) => {
    if (!socket) return;
    socket.emit('placeBid', { roomId, playerId, bid });
  }, [socket, roomId, playerId]);

  const playCard = useCallback((cardId: string) => {
    if (!socket) return;
    socket.emit('playCard', { roomId, playerId, cardId });
  }, [socket, roomId, playerId]);

  const startGame = useCallback(() => {
    if (!socket) return;
    socket.emit('startGame', { roomId });
  }, [socket, roomId]);

  return {
    gameState,
    myPlayerIndex,
    placeBid,
    playCard,
    startGame
  };
}
```

### Step 3: Lobby Component

Create `src/components/Lobby.tsx`:

```typescript
import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

interface LobbyProps {
  socket: Socket | null;
  onJoinRoom: (roomId: string, playerName: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ socket, onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(7);
    onJoinRoom(newRoomId, playerName);
  };

  const handleJoinRoom = () => {
    if (roomId && playerName) {
      onJoinRoom(roomId, playerName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Wizard Card Game</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full border-2 border-gray-300 rounded px-4 py-2"
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-6">
          <button
            onClick={handleCreateRoom}
            disabled={!playerName}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Create New Game
          </button>
        </div>

        <div className="border-t pt-6">
          <label className="block text-sm font-medium mb-2">Join Existing Game</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full border-2 border-gray-300 rounded px-4 py-2 mb-4"
            placeholder="Enter room code"
          />
          <button
            onClick={handleJoinRoom}
            disabled={!roomId || !playerName}
            className="w-full bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Join Game
          </button>
        </div>

        {!socket && (
          <div className="mt-4 text-center text-red-500">
            Connecting to server...
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## Summary

**Phase 1 (Hot Seat)**: Build the complete game logic locally
- All game rules working
- Full UI
- Pass device between players

**Phase 2 (Multiplayer)**: Add networking
- Connect to Socket.io server
- Send actions to server
- Receive state updates
- Each player sees their own view

The key insight: Your game logic stays the same! Multiplayer just moves state management from local to server.