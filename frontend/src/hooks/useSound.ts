import { useCallback } from 'react';
import { useUiStore } from '../store/uiStore';

type SoundType = 'card-play' | 'card-shuffle' | 'win' | 'lose';

export const useSound = () => {
  const { isSoundEnabled } = useUiStore();

  const playSound = useCallback(
    (soundType: SoundType) => {
      if (!isSoundEnabled) return;

      const audio = new Audio(`/sounds/${soundType}.mp3`);
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.error('Error playing sound:', error);
      });
    },
    [isSoundEnabled]
  );

  return { playSound };
};
