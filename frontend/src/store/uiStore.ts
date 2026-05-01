import { create } from 'zustand';

interface UiStore {
  // State
  isSoundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  showRules: boolean;
  showHistory: boolean;

  // Actions
  toggleSound: () => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setShowRules: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  // Initial state
  isSoundEnabled: true,
  animationSpeed: 'normal',
  showRules: false,
  showHistory: false,

  // Actions
  toggleSound: () =>
    set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),

  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  setShowRules: (show) => set({ showRules: show }),

  setShowHistory: (show) => set({ showHistory: show }),
}));
