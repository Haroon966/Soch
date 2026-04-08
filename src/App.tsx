import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { SourcePanel } from './components/panels/SourcePanel';
import { CanvasView } from './components/canvas/CanvasView';
import { NodeDetailPanel } from './components/panels/NodeDetailPanel';
import { SourcePreviewModal } from './components/modals/SourcePreviewModal';
import { SearchPalette } from './components/panels/SearchPalette';

import { ReactFlowProvider } from 'reactflow';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-base text-text-primary">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <SourcePanel />
        <ReactFlowProvider>
          <main className="flex-1 relative overflow-hidden">
            <CanvasView />
            <NodeDetailPanel />
          </main>
          <SourcePreviewModal />
          <SearchPalette />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default App;
