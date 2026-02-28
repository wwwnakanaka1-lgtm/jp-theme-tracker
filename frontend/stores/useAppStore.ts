import { create } from 'zustand';

interface AppState {
  selectedPeriod: string;
  isMenuOpen: boolean;
  setSelectedPeriod: (period: string) => void;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedPeriod: '1d',
  isMenuOpen: false,
  setSelectedPeriod: (period: string) => set({ selectedPeriod: period }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
}));
