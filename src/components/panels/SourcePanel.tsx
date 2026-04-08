import React, { useRef } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useSourceStore } from '../../store/sourceStore';
import { useCanvasStore } from '../../store/canvasStore';
import { scanDirectory, getFileType, startPolling } from '../../services/folderWatcher';
import { getSetting, saveSetting } from '../../services/db';
import { FileImage, FileText, Link2, Database, HelpCircle, FileAudio, FolderOpen } from 'lucide-react';

const getIcon = (type: string) => {
  switch (type) {
    case 'image': return <FileImage size={16} className="text-accent" />;
    case 'pdf': case 'document': return <FileText size={16} className="text-green-500" />;
    case 'link': return <Link2 size={16} className="text-orange-500" />;
    case 'data': return <Database size={16} className="text-yellow-500" />;
    case 'media': return <FileAudio size={16} className="text-red-500" />;
    default: return <HelpCircle size={16} className="text-text-secondary" />;
  }
};

export const SourcePanel: React.FC = () => {
  const { sources, addSource, syncSources, setDirectoryHandle } = useSourceStore();
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const pollingCleanupRef = useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const restoreHandle = async () => {
      try {
        const handle = await getSetting('directoryHandle');
        if (handle) {
          const permission = await handle.queryPermission({ mode: 'read' });
          if (permission === 'granted') {
            setDirectoryHandle(handle);
            const files = await scanDirectory(handle);
            syncSources(files);
            
            if (pollingCleanupRef.current) pollingCleanupRef.current();
            pollingCleanupRef.current = startPolling(handle, (newSources) => {
               syncSources(newSources);
            });
          }
        }
      } catch (e) {
        console.error("Failed to restore directory handle", e);
      }
    };
    restoreHandle();
    
    return () => {
      if (pollingCleanupRef.current) pollingCleanupRef.current();
    };
  }, [setDirectoryHandle, syncSources]);

  const handleOpenFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker();
        setDirectoryHandle(dirHandle);
        await saveSetting('directoryHandle', dirHandle);
        const files = await scanDirectory(dirHandle);
        syncSources(files);
        
        // Auto-add to canvas
        const canvasNodes = useCanvasStore.getState().nodes;
        let x = canvasNodes.length > 0 ? 100 : Math.random() * 50 + 50;
        let y = canvasNodes.length > 0 ? 100 : Math.random() * 50 + 50;
        
        useCanvasStore.getState().pushHistory();
        
        files.forEach(file => {
          if (!canvasNodes.find(n => n.data.sourceId === file.id)) {
            useCanvasStore.getState().addNode({
              id: `SourceNode-${Date.now()}-${Math.random()}`,
              type: 'SourceNode',
              position: { x, y },
              data: { label: file.name, sourceId: file.id, sourceType: file.type }
            });
            x += 220;
            if (x > 1000) { x = 100; y += 100; }
          }
        });

        if (pollingCleanupRef.current) pollingCleanupRef.current();
        pollingCleanupRef.current = startPolling(dirHandle, (newSources) => {
           syncSources(newSources);
        });
      } else {
        fallbackInputRef.current?.click();
      }
    } catch (err) {
      console.error("User cancelled or error", err);
    }
  };

  const handleFallbackInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    filesArray.forEach(file => {
      // @ts-ignore
      const path = file.webkitRelativePath || file.name;
      addSource({
        id: path,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        lastModified: file.lastModified,
      });
    });
  };

  const sourcesList = Object.values(sources);

  return (
    <div className="w-64 bg-bg-elevated border-r border-border h-full flex flex-col shadow-lg z-10 transition-colors">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold uppercase tracking-wider text-xs text-text-secondary">Sources</h2>
        <button onClick={handleOpenFolder} className="p-1.5 hover:bg-bg-card rounded-md transition-colors" title="Open Folder">
          <FolderOpen size={16} className="text-accent hover:text-accent-hover" />
        </button>
        <input 
          type="file" 
          ref={fallbackInputRef} 
          style={{ display: 'none' }} 
          // @ts-ignore
          webkitdirectory="true" 
          onChange={handleFallbackInput} 
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {sourcesList.length === 0 ? (
          <div className="text-center text-text-secondary text-sm p-4 mt-10">
            <FolderOpen size={32} className="mx-auto mb-3 opacity-20" />
            No sources yet. Open a folder to begin.
          </div>
        ) : (
          <ul className="space-y-1">
            {sourcesList.map(source => (
              <li 
                key={source.id} 
                onClick={() => useUiStore.getState().openSourcePreview(source.id)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-bg-card cursor-pointer text-sm transition-colors border border-transparent hover:border-border"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SourceNode', sourceId: source.id }))}
              >
                {getIcon(source.type)}
                <span className="truncate flex-1 text-text-primary" title={source.name}>{source.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
