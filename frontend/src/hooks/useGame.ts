import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useGameStore } from '../store/gameStore';

export const useGame = (gameId: string | null) => {
  const queryClient = useQueryClient();
  const { setGameState, currentPlayer, setPlayerHand } = useGameStore();

  // Fetch game state
  const { data: gameState, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => apiService.getGame(gameId!, currentPlayer?.id),
    enabled: !!gameId,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Side effect to update store when data changes
  useEffect(() => {
    if (gameState) {
      setGameState(gameState);
      if ((gameState as any).hand) {
        setPlayerHand((gameState as any).hand);
      }
    }
  }, [gameState, setGameState, setPlayerHand]);

  // Submit bid mutation
  const submitBid = useMutation({
    mutationFn: ({ bid }: { bid: number }) =>
      apiService.submitBid(gameId!, currentPlayer!.id, bid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
  });

  // Play card mutation
  const playCard = useMutation({
    mutationFn: ({ cardIndex }: { cardIndex: number }) =>
      apiService.playCard(gameId!, currentPlayer!.id, cardIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
  });

  return {
    gameState,
    isLoading,
    error,
    submitBid: submitBid.mutate,
    playCard: playCard.mutate,
    isSubmittingBid: submitBid.isPending,
    isPlayingCard: playCard.isPending,
  };
};
