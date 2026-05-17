import { useState, useCallback } from 'react';
import type { GameState, Player } from '../types/game.types';
import { createDeck, shuffleDeck } from '../utils/cardUtils';
import {
  initializeRound,
  getTrumpSuit,
  determineTrickWinner,
  canPlayCard,
  calculateScore
} from '../utils/gameLogic';

export function useGameState(playerCount: number = 1) {
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
