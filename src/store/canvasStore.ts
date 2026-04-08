import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from 'reactflow';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  past: { nodes: Node[]; edges: Edge[] }[];
  future: { nodes: Node[]; edges: Edge[] }[];

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  updateNodeData: (id: string, data: any) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
  nodes: [],
  edges: [],
  past: [],
  future: [],
  pushHistory: () => {
    const { nodes, edges, past } = get();
    if (past.length > 50) past.shift();
    set({ past: [...past, { nodes, edges }], future: [] });
  },
  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, past.length - 1),
      future: [{ nodes, edges }, ...future],
      nodes: previous.nodes,
      edges: previous.edges,
    });
  },
  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, { nodes, edges }],
      future: future.slice(1),
      nodes: next.nodes,
      edges: next.edges,
    });
  },
  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => {
    get().pushHistory();
    set({ edges: addEdge(connection, get().edges) });
  },
  addNode: (node) => {
    get().pushHistory();
    set({ nodes: [...get().nodes, node] });
  },
  updateNodeData: (id, data) => {
    get().pushHistory();
    set({
      nodes: get().nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
    });
  },
}),
    {
      name: 'evidence-canvas-storage',
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);
