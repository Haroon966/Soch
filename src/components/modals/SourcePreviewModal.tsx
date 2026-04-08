import { useEffect, useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useSourceStore } from '../../store/sourceStore';
import { X, ExternalLink, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../../store/canvasStore';

export const SourcePreviewModal = () => {
  const { isSourcePreviewOpen, activeSourceId, closeSourcePreview } = useUiStore();
  const { sources } = useSourceStore();
  const { addNode } = useCanvasStore();
  
  const source = activeSourceId ? sources[activeSourceId] : null;
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (source && source.handle) {
      source.handle.getFile().then((file: File) => {
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
      });
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  const handleQuote = () => {
    // In a real app, grab window.getSelection().toString() inside the preview
    // For now, just generate generic evidence node
    addNode({
      id: `Evidence-${Date.now()}`,
      type: 'default',
      position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 },
      data: {
        label: 'Extracted Evidence',
        description: 'Selected quote from source...',
        sourceId: source?.id
      }
    });
    closeSourcePreview();
  };

  if (!isSourcePreviewOpen || !source) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-8 backdrop-blur-sm"
        onClick={closeSourcePreview}
      >
        <motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-4xl h-[80vh] bg-bg-base border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 bg-bg-card border-b border-border">
            <div className="flex flex-col">
              <h2 className="font-semibold text-text-primary text-lg">{source.name}</h2>
              <span className="text-xs text-text-secondary uppercase">{source.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleQuote} className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated hover:bg-border rounded text-sm transition-colors text-text-primary border border-border font-medium">
                <Quote size={14} /> Quote Evidence
              </button>
              <div className="w-px h-4 bg-border mx-1"></div>
              <button onClick={closeSourcePreview} className="p-1.5 hover:bg-bg-elevated rounded transition-colors text-text-secondary hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-[#1e1e1e] flex items-center justify-center p-4">
            {source.type === 'image' && objectUrl && (
              <img src={objectUrl} alt={source.name} className="max-w-full max-h-full object-contain shadow-lg" />
            )}
            
            {(source.type === 'pdf' || source.type === 'document' || source.type === 'data') && (
              <div className="bg-white text-black p-8 max-w-2xl w-full h-full min-h-full rounded shadow-lg prose prose-sm overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">{source.name}</h1>
                <p className="text-gray-500 italic pb-4 border-b border-gray-200">
                   Note: Rich document rendering (PDF API, Mammoth) would occur here in production. Returning mock extract view for now.
                </p>
                <p className="mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Select text here to quote as evidence...
                </p>
              </div>
            )}
            
            {source.type === 'unknown' && (
              <div className="flex flex-col items-center gap-3 text-text-secondary">
                <ExternalLink size={48} className="opacity-50" />
                <p>Preview format not supported</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
