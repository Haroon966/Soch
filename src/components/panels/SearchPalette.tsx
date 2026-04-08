import { useState, useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useCanvasStore } from '../../store/canvasStore';
import Fuse from 'fuse.js';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactFlow } from 'reactflow';

export const SearchPalette = () => {
  const { isSearchOpen, toggleSearch } = useUiStore();
  const { nodes } = useCanvasStore();
  const [query, setQuery] = useState('');
  
  const fuse = new Fuse(nodes, {
    keys: ['data.label', 'data.description', 'data.tags'],
    threshold: 0.3,
  });

  const results = query ? fuse.search(query).map(r => r.item) : [];
  const { setCenter } = useReactFlow();

  const handleResultClick = (node: any) => {
    toggleSearch();
    setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 800 });
    useUiStore.getState().openNodeDetail(node.id);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Since toggleSearch doesn't always toggle the way we want directly without args, let's just make it toggle
        toggleSearch();
      }
      if (e.key === 'Escape' && isSearchOpen) {
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-sm pt-[20vh]" onClick={toggleSearch}>
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl h-fit max-h-[60vh] bg-bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center px-4 border-b border-border bg-bg-card">
            <Search size={20} className="text-text-secondary" />
            <input 
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search nodes, sources, tags... (Cmd+K)"
              className="w-full bg-transparent p-4 outline-none text-lg text-text-primary placeholder:text-text-secondary" 
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 bg-bg-base scrollbar-thin">
            {results.length > 0 && (
              <div className="space-y-1">
                {results.map((node: any) => (
                  <div 
                    key={node.id} 
                    onClick={() => handleResultClick(node)}
                    className="p-3 bg-bg-card hover:bg-bg-elevated rounded-md cursor-pointer border border-border transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-sm text-text-primary">{node.data.label}</div>
                      <div className="text-[10px] uppercase bg-accent text-white px-1.5 py-0.5 rounded font-bold tracking-wider">{node.type || 'Node'}</div>
                    </div>
                    {node.data.description && <div className="text-xs text-text-secondary line-clamp-1 mt-1">{node.data.description}</div>}
                    {node.data.tags && <div className="text-[10px] text-accent mt-1">{node.data.tags}</div>}
                  </div>
                ))}
              </div>
            )}
            {query && results.length === 0 && (
              <div className="p-8 text-center text-text-secondary text-sm">No results found for "{query}"</div>
            )}
            {!query && (
              <div className="p-8 pb-10 text-center text-text-secondary text-sm flex flex-col items-center gap-2 opacity-60">
                <Search size={32} />
                <span>Type to start searching across your workspace...</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
