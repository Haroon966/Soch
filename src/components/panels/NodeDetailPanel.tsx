import React, { useEffect, useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useCanvasStore } from '../../store/canvasStore';
import { X, MessageSquare, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NodeDetailPanel = () => {
  const { isNodeDetailOpen, activeNodeId, closeNodeDetail } = useUiStore();
  const { nodes, updateNodeData } = useCanvasStore();
  
  const node = nodes.find(n => n.id === activeNodeId);
  const [localData, setLocalData] = useState(node?.data || {});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (node) {
      setLocalData(node.data);
    }
  }, [node]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalData((prev: any) => ({ ...prev, [name]: value }));
    
    // Auto-save debounce effect could be here, but direct is fine for now
    if (activeNodeId) {
      updateNodeData(activeNodeId, { [name]: value });
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment = { id: Date.now(), text: newComment, timestamp: Date.now(), author: 'You' };
    const comments = localData.comments ? [...localData.comments, comment] : [comment];
    handleChange({ target: { name: 'comments', value: comments } } as any);
    setNewComment('');
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNodeDetail();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeNodeDetail]);

  return (
    <AnimatePresence>
      {isNodeDetailOpen && node && (
        <motion.div 
          initial={{ x: 320 }} 
          animate={{ x: 0 }} 
          exit={{ x: 320 }} 
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-bg-card border-l border-border shadow-2xl z-20 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-bg-elevated">
            <h3 className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              {node.type}
            </h3>
            <button onClick={closeNodeDetail} className="p-1 hover:bg-bg-card rounded-md transition-colors text-text-secondary hover:text-text-primary">
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 scrollbar-thin">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Type</label>
                <select
                  value={node.type}
                  onChange={(e) => {
                    useCanvasStore.getState().pushHistory();
                    useCanvasStore.setState(state => ({
                      nodes: state.nodes.map(n => n.id === activeNodeId ? { ...n, type: e.target.value } : n)
                    }));
                  }}
                  className="w-full bg-bg-elevated border border-border rounded px-3 py-2 text-sm text-text-primary outline-none"
                >
                  <option value="IdeaNode">Idea</option>
                  <option value="QuestionNode">Question</option>
                  <option value="ClaimNode">Claim</option>
                  <option value="EvidenceNode">Evidence</option>
                  <option value="GroupNode">Group</option>
                  <option value="LinkNode">Link</option>
                </select>
              </div>
              <div className="w-16">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Color</label>
                <input 
                  type="color" 
                  name="style.backgroundColor" 
                  value={node.style?.backgroundColor as string || '#3b82f6'} 
                  onChange={(e) => {
                    useCanvasStore.getState().pushHistory();
                    useCanvasStore.setState(state => ({
                      nodes: state.nodes.map(n => n.id === activeNodeId ? { ...n, style: { ...n.style, backgroundColor: e.target.value } } : n)
                    }));
                  }} 
                  className="w-full h-[36px] cursor-pointer rounded border border-border bg-transparent p-0" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Title</label>
              <input 
                name="label" 
                value={localData.label || ''} 
                onChange={handleChange} 
                className="w-full bg-bg-elevated border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-accent outline-none transition-colors"
                autoComplete="off"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Description</label>
              <textarea 
                name="description" 
                value={localData.description || ''} 
                onChange={handleChange} 
                className="w-full h-32 bg-bg-elevated border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-accent outline-none resize-none transition-colors"
                placeholder="Add notes, insights, or descriptions..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Tag size={12} /> Tags
              </label>
              <input 
                name="tags" 
                value={localData.tags || ''} 
                onChange={handleChange} 
                className="w-full bg-bg-elevated border border-border rounded px-3 py-2 text-sm text-text-primary focus:border-accent outline-none transition-colors"
                placeholder="comma, separated, tags"
                autoComplete="off"
              />
            </div>

            {localData.sourceId && (
              <div className="p-3 bg-bg-elevated rounded border border-border flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Linked Source</span>
                <span className="text-sm truncate font-mono text-accent">{localData.sourceId}</span>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={12} /> Comments
              </label>
              <div className="flex flex-col gap-2">
                {localData.comments?.map((c: any) => (
                  <div key={c.id} className="p-2 bg-bg-card rounded shadow-sm border border-border text-sm flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-accent text-[10px] flex items-center justify-center text-white shrink-0 mt-0.5">Y</div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-xs text-text-primary">{c.author}</span>
                        <span className="text-[10px] text-text-secondary">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="text-text-primary text-[13px] mt-0.5 whitespace-pre-wrap">{c.text}</div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                    placeholder="Add comment..."
                    className="flex-1 bg-bg-elevated border border-border rounded px-2 py-1.5 text-sm text-text-primary focus:border-accent outline-none" 
                  />
                  <button onClick={addComment} className="px-3 py-1.5 bg-bg-card hover:bg-bg-elevated border border-border rounded text-sm transition-colors font-medium">Add</button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-border mt-auto bg-bg-elevated/50 flex justify-between items-center text-[10px] text-text-secondary font-mono">
            <span>Created: {new Date(parseInt(node.id.split('-')[1]) || Date.now()).toLocaleDateString()}</span>
            <span>Modified: {new Date().toLocaleTimeString()}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
