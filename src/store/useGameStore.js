import { create } from 'zustand';

export const useGameStore = create((set) => ({
  // Game State
  gameState: 'loading', // loading, menu, lobby, gacha, shop
  setGameState: (state) => set({ gameState: state }),

  // Player Stats
  gems: 5000,
  addGems: (amount) => set((state) => ({ gems: state.gems + amount })),
  spendGems: (amount) => set((state) => ({ gems: Math.max(0, state.gems - amount) })),

  // Collection
  ownedCharacters: [],
  addCharacter: (char) => set((state) => ({ 
    ownedCharacters: [...state.ownedCharacters, char] 
  })),

  // UI State
  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
}));
