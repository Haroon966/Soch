import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SourceFile } from '../types';

interface SourceState {
  sources: Record<string, SourceFile>;
  addSource: (source: SourceFile) => void;
  syncSources: (sources: SourceFile[]) => void;
  removeSource: (id: string) => void;
  clearSources: () => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
}

export const useSourceStore = create<SourceState>()(
  persist(
    (set) => ({
  sources: {},
  addSource: (source) => set((state) => ({ sources: { ...state.sources, [source.id]: source } })),
  syncSources: (newSourcesList) => set(() => {
    const newSources: Record<string, SourceFile> = {};
    newSourcesList.forEach(s => newSources[s.id] = s);
    return { sources: newSources };
  }),
  removeSource: (id) => set((state) => {
    const newSources = { ...state.sources };
    delete newSources[id];
    return { sources: newSources };
  }),
  clearSources: () => set({ sources: {} }),
  directoryHandle: null,
  setDirectoryHandle: (handle) => set({ directoryHandle: handle }),
}),
    {
      name: 'evidence-sources-storage',
      partialize: (state) => ({ sources: state.sources }),
    }
  )
);
