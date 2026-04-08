import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      theme: 'dark',
      isNodeDetailOpen: false,
      activeNodeId: null,
      isSearchOpen: false,
      isSourcePreviewOpen: false,
      activeSourceId: null
    });
  });

  it('should toggle theme', () => {
    const store = useUiStore.getState();
    expect(store.theme).toBe('dark');
    
    store.toggleTheme();
    expect(useUiStore.getState().theme).toBe('light');

    useUiStore.getState().toggleTheme();
    expect(useUiStore.getState().theme).toBe('dark');
  });

  it('should open and close node detail', () => {
    const store = useUiStore.getState();
    expect(store.isNodeDetailOpen).toBe(false);

    store.openNodeDetail('node-1');
    expect(useUiStore.getState().isNodeDetailOpen).toBe(true);
    expect(useUiStore.getState().activeNodeId).toBe('node-1');

    useUiStore.getState().closeNodeDetail();
    expect(useUiStore.getState().isNodeDetailOpen).toBe(false);
    expect(useUiStore.getState().activeNodeId).toBe(null);
  });
});
