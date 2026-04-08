import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant, Panel, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvasStore } from '../../store/canvasStore';
import { useSourceStore } from '../../store/sourceStore';
import { useUiStore } from '../../store/uiStore';
import { SourceNode } from './nodes/SourceNode';
import { IdeaNode, QuestionNode, ClaimNode, EvidenceNode, GroupNode, LinkNode } from './nodes/CustomNodes';
import { SemanticEdge } from './edges/SemanticEdge';
import { getLayoutedElements } from '../../services/layout';
import { Settings } from 'lucide-react';

const nodeTypes = {
  SourceNode, IdeaNode, QuestionNode, ClaimNode, EvidenceNode, GroupNode, LinkNode
};

const edgeTypes = {
  SemanticEdge
};

const FlowInstance = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useCanvasStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { sources } = useSourceStore();
  const { openNodeDetail } = useUiStore();
  const { project, setNodes, getNodes } = useReactFlow();

  const [pendingConnection, setPendingConnection] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    openNodeDetail(node.id);
  }, [openNodeDetail]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/json');
      if (!rawData || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      try {
        const { type, sourceId } = JSON.parse(rawData);
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const source = sourceId ? sources[sourceId] : null;
        const newNode = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: { 
            label: source ? source.name : `New ${type.replace('Node','')}`, 
            sourceId,
            sourceType: source ? source.type : 'unknown'
          },
        };
        addNode(newNode);
      } catch (e) {
        console.error("Invalid drop format");
      }
    },
    [addNode, project, sources]
  );

  const onPaneDoubleClick = useCallback((event: React.MouseEvent) => {
    if (!reactFlowWrapper.current) return;
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    addNode({ id: `IdeaNode-${Date.now()}`, type: 'IdeaNode', position, data: { label: 'New Idea' } });
  }, [project, addNode]);

  const handleConnect = useCallback((connection: any) => {
    setPendingConnection(connection);
  }, []);

  const confirmConnection = (semanticType: string) => {
    if (pendingConnection) {
      onConnect({ ...pendingConnection, type: 'SemanticEdge', data: { semanticType } });
      setPendingConnection(null);
    }
  };

  const applyLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes(layouted.nodes);
  }, [nodes, edges, setNodes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { useCanvasStore.getState().undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') { useCanvasStore.getState().redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        const selectedNodes = getNodes().filter(n => n.selected);
        selectedNodes.forEach(node => {
          addNode({ ...node, id: `${node.type}-${Date.now()}`, position: { x: node.position.x + 50, y: node.position.y + 50 }, selected: false });
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [getNodes, addNode]);

  const displayNodes = nodes.map(n => ({
    ...n,
    style: filterType === 'all' || n.type === filterType ? { ...n.style, opacity: 1 } : { ...n.style, opacity: 0.2 },
  }));

  return (
    <div className="w-full h-full relative flex flex-col" ref={reactFlowWrapper} onDragOver={onDragOver} onDrop={onDrop}>
      
      {/* Filter Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="px-2 py-1 bg-bg-elevated border border-border rounded shadow-sm text-xs font-semibold uppercase tracking-wider outline-none text-text-secondary"
        >
          <option value="all">All Types</option>
          <option value="SourceNode">Sources</option>
          <option value="IdeaNode">Ideas</option>
          <option value="ClaimNode">Claims</option>
          <option value="EvidenceNode">Evidence</option>
        </select>
      </div>

      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onPaneClick={(e) => { if (e.detail === 2) onPaneDoubleClick(e); }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={(n: any) => n.style?.background || 'var(--bg-elevated)'} 
          maskColor="var(--bg-base)" 
          className="dark:bg-bg-card"
        />
        <Panel position="top-center" className="bg-bg-elevated shadow-md border border-border p-2 rounded flex gap-2 overflow-x-auto flex-wrap">
          <button onClick={() => addNode({ id: `IdeaNode-${Date.now()}`, type: 'IdeaNode', position: {x: 100, y: 100}, data: { label: 'New Idea' }})} className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 rounded text-sm transition-colors font-medium">Idea</button>
          <button onClick={() => addNode({ id: `QuestionNode-${Date.now()}`, type: 'QuestionNode', position: {x: 150, y: 100}, data: { label: 'New Question' }})} className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 rounded text-sm transition-colors font-medium">Question</button>
          <button onClick={() => addNode({ id: `ClaimNode-${Date.now()}`, type: 'ClaimNode', position: {x: 200, y: 100}, data: { label: 'New Claim' }})} className="px-3 py-1 bg-bg-card hover:bg-border rounded text-sm transition-colors text-text-primary border border-border font-medium">Claim</button>
          <button onClick={() => addNode({ id: `GroupNode-${Date.now()}`, type: 'GroupNode', position: {x: 250, y: 100}, style: {width: 400, height: 400}, data: { label: 'New Group' }})} className="px-3 py-1 bg-bg-elevated hover:bg-border rounded text-sm transition-colors text-text-primary border border-border font-medium text-text-secondary">Group Container</button>
          <div className="w-px h-6 bg-border mx-1 my-auto"></div>
          <button onClick={applyLayout} className="px-3 py-1 bg-bg-card hover:bg-border rounded text-sm transition-colors text-text-primary border border-border flex items-center gap-1.5 font-medium"><Settings size={14} /> Auto Layout</button>
        </Panel>
      </ReactFlow>

      {pendingConnection && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPendingConnection(null)}>
          <div className="bg-bg-card border border-border p-4 rounded-xl shadow-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Connection Meaning</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => confirmConnection('Supports')} className="px-3 py-2.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 font-medium text-left flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Supports
              </button>
              <button onClick={() => confirmConnection('Contradicts')} className="px-3 py-2.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 font-medium text-left flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500"></div> Contradicts
              </button>
              <button onClick={() => confirmConnection('Causes')} className="px-3 py-2.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/20 font-medium text-left flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-orange-500"></div> Causes
              </button>
              <button onClick={() => confirmConnection('Relates To')} className="px-3 py-2.5 bg-bg-elevated text-text-primary border border-border rounded-lg hover:bg-border font-medium text-left flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-text-secondary"></div> Relates To (Neutral)
              </button>
            </div>
            <div className="mt-4 pt-3 border-t border-border text-center">
              <button onClick={() => setPendingConnection(null)} className="text-text-secondary text-sm hover:text-text-primary font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CanvasView = () => (
  // ReactFlowProvider is now in App.tsx!
  <FlowInstance />
);
