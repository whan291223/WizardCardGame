import { useGameStore } from '../store/gameStore';
import { useGame } from './useGame';

export const useGameActions = (gameId: string | null) => {
  const { selectedCard, playerHand } = useGameStore();
  const { submitBid, playCard, isSubmittingBid, isPlayingCard } = useGame(gameId);

  const handleSubmitBid = (bid: number) => {
    submitBid({ bid });
  };

  const handlePlayCard = () => {
    if (!selectedCard) return;

    // Find index of selected card in hand
    const cardIndex = playerHand.findIndex(c =>
      c.type === selectedCard.type &&
      c.suit === selectedCard.suit &&
      c.value === selectedCard.value
    );

    if (cardIndex === -1) return;

    playCard(
      { cardIndex },
      {
        onSuccess: () => {
          // Store will be updated by polling
        },
      }
    );
  };

  return {
    handleSubmitBid,
    handlePlayCard,
    isSubmittingBid,
    isPlayingCard,
    canPlayCard: !!selectedCard && !isPlayingCard,
  };
};
