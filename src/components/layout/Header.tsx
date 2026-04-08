import { useUiStore } from '../../store/uiStore';
import { useCanvasStore } from '../../store/canvasStore';
import { Sun, Moon, Download, Folders, Search } from 'lucide-react';
import { toPng } from 'html-to-image';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useUiStore();
  const { nodes, edges } = useCanvasStore();

  const handleExport = () => {
    // Basic JSON export for project data
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soch-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Trigger MD export
    const mdList = nodes.map(n => `- **${n.data.label || 'Node'}** (${n.type}): ${n.data.description || 'No description'}`).join('\n');
    const mdContent = `# EvidenceCanvas Export\n\n## Nodes\n\n${mdList}\n`;
    const mdBlob = new Blob([mdContent], { type: 'text/markdown' });
    const mdUrl = URL.createObjectURL(mdBlob);
    const mdA = document.createElement('a');
    mdA.href = mdUrl;
    mdA.download = `soch-${Date.now()}.md`;
    mdA.click();
    URL.revokeObjectURL(mdUrl);
    
    // Also trigger PNG export
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    if (reactFlowElement) {
      toPng(reactFlowElement, { backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa' })
        .then((dataUrl) => {
          const imgA = document.createElement('a');
          imgA.href = dataUrl;
          imgA.download = `soch-${Date.now()}.png`;
          imgA.click();
        });
    }
  };

  return (
    <header className="h-12 border-b border-border bg-bg-card flex items-center justify-between px-4 z-20 relative">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white font-bold text-xs">
          S
        </div>
        <h1 className="font-semibold text-text-primary tracking-tight">Soch</h1>
      </div>
      
      <div className="flex items-center gap-1.5 px-3 py-1 bg-bg-elevated border border-border rounded-md text-sm text-text-primary cursor-pointer hover:bg-border transition-colors">
        <Folders size={14} className="text-accent" />
        <span className="font-medium">Default Project</span>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={useUiStore.getState().toggleSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated hover:bg-border rounded-md text-text-secondary hover:text-text-primary transition-colors text-sm border border-border"
          title="Search (Cmd+K)"
        >
          <Search size={14} /> Search
        </button>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-bg-elevated hover:bg-border rounded-md text-text-secondary hover:text-text-primary transition-colors text-sm border border-border"
          title="Export Project"
        >
          <Download size={14} /> Export
        </button>
        <div className="w-px h-4 bg-border mx-1"></div>
        <button 
          onClick={toggleTheme} 
          className="p-1.5 hover:bg-bg-elevated rounded-md text-text-secondary transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};
