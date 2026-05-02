import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameState, RoundInfo } from '../types/game';
import { Card } from '../types/card';
import { Player } from '../types/player';

interface GameStore {
  // State
  gameState: GameState | null;
  currentPlayer: Player | null;
  playerHand: Card[];
  selectedCard: Card | null;
  roundInfo: RoundInfo | null;

  // Actions
  setGameState: (state: GameState) => void;
  setCurrentPlayer: (player: Player) => void;
  setPlayerHand: (cards: Card[]) => void;
  selectCard: (card: Card | null) => void;
  removeCardFromHand: (card: Card) => void;
  setRoundInfo: (info: RoundInfo) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        gameState: null,
        currentPlayer: null,
        playerHand: [],
        selectedCard: null,
        roundInfo: null,

        // Actions
        setGameState: (state) => set({ gameState: state }),

        setCurrentPlayer: (player) => set({ currentPlayer: player }),

        setPlayerHand: (cards) => set({ playerHand: cards }),

        selectCard: (card) => set({ selectedCard: card }),

        removeCardFromHand: (card) =>
          set((state) => ({
            playerHand: state.playerHand.filter(
              (c) =>
                !(
                  c.type === card.type &&
                  c.suit === card.suit &&
                  c.value === card.value
                )
            ),
            selectedCard: null,
          })),

        setRoundInfo: (info) => set({ roundInfo: info }),

        resetGame: () =>
          set({
            gameState: null,
            playerHand: [],
            selectedCard: null,
            roundInfo: null,
          }),
      }),
      {
        name: 'wizard-game-storage',
        partialize: (state) => ({
          currentPlayer: state.currentPlayer,
        }),
      }
    )
  )
);
