import { create } from 'zustand';

interface UiState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isNodeDetailOpen: boolean;
  activeNodeId: string | null;
  openNodeDetail: (nodeId: string) => void;
  closeNodeDetail: () => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  isSourcePreviewOpen: boolean;
  activeSourceId: string | null;
  openSourcePreview: (sourceId: string) => void;
  closeSourcePreview: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return { theme: newTheme };
  }),
  isNodeDetailOpen: false,
  activeNodeId: null,
  openNodeDetail: (nodeId) => set({ isNodeDetailOpen: true, activeNodeId: nodeId }),
  closeNodeDetail: () => set({ isNodeDetailOpen: false, activeNodeId: null }),
  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  isSourcePreviewOpen: false,
  activeSourceId: null,
  openSourcePreview: (sourceId) => set({ isSourcePreviewOpen: true, activeSourceId: sourceId }),
  closeSourcePreview: () => set({ isSourcePreviewOpen: false, activeSourceId: null }),
}));
