import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Lightbulb, HelpCircle, AlertCircle, Quote, Link as LinkIcon, Folder } from 'lucide-react';

const NodeWrapper = ({ children, isConnectable, className = "" }: any) => (
  <div className={`px-4 py-3 shadow-md rounded-md min-w-[150px] max-w-[280px] bg-bg-card border ${className}`}>
    <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 !bg-accent border-bg-card" />
    {children}
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 !bg-accent border-bg-card" />
  </div>
);

export const IdeaNode = ({ data, isConnectable }: NodeProps) => (
  <NodeWrapper isConnectable={isConnectable} className="border-yellow-500/50 hover:border-yellow-500 !bg-[#fffce0] dark:!bg-[#2d2812]">
    <div className="flex items-center gap-2 mb-1 text-yellow-700 dark:text-yellow-400">
      <Lightbulb size={14} />
      <span className="text-[10px] uppercase tracking-wider font-bold">Idea</span>
    </div>
    <div className="text-xs font-medium text-black dark:text-yellow-100">{data.label}</div>
    {data.description && <div className="mt-1 text-[11px] text-yellow-800/70 dark:text-yellow-200/70 whitespace-pre-wrap">{data.description}</div>}
  </NodeWrapper>
);

export const QuestionNode = ({ data, isConnectable }: NodeProps) => (
  <NodeWrapper isConnectable={isConnectable} className="border-blue-500/50 hover:border-blue-500">
    <div className="flex items-center gap-2 mb-1 text-blue-500">
      <HelpCircle size={14} />
      <span className="text-[10px] uppercase tracking-wider font-bold">Question</span>
    </div>
    <div className="text-xs font-medium text-text-primary">{data.label}</div>
  </NodeWrapper>
);

export const ClaimNode = ({ data, isConnectable }: NodeProps) => (
  <NodeWrapper isConnectable={isConnectable} className="border-text-primary hover:border-accent">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 text-text-primary">
        <AlertCircle size={14} />
        <span className="text-[10px] uppercase tracking-wider font-bold">Claim</span>
      </div>
      <div className="px-1.5 py-0.5 rounded text-[9px] bg-bg-elevated font-bold" title="Evidence Count">
        {data.evidenceCount || 0}
      </div>
    </div>
    <div className="text-sm font-bold text-text-primary">{data.label}</div>
  </NodeWrapper>
);

export const EvidenceNode = ({ data, isConnectable }: NodeProps) => (
  <NodeWrapper isConnectable={isConnectable} className="border-green-500/50 hover:border-green-500">
    <div className="flex items-center gap-2 mb-1 text-green-500">
      <Quote size={14} />
      <span className="text-[10px] uppercase tracking-wider font-bold">Evidence</span>
    </div>
    <div className="text-xs italic text-text-secondary border-l-2 border-border pl-2 my-2">"{data.description}"</div>
    {data.sourceId && (
      <div className="mt-2 text-[9px] px-1.5 py-1 bg-bg-elevated rounded border border-border truncate font-mono text-text-primary">
        Src: {data.sourceId}
      </div>
    )}
  </NodeWrapper>
);

export const LinkNode = ({ data, isConnectable }: NodeProps) => (
  <NodeWrapper isConnectable={isConnectable} className="border-border hover:border-accent">
    <div className="flex items-center gap-2 mb-1 text-text-secondary">
      <LinkIcon size={14} />
      <span className="text-[10px] uppercase tracking-wider font-bold">Link</span>
    </div>
    <div className="text-xs font-medium text-accent hover:underline cursor-pointer truncate" onClick={() => window.open(data.url, '_blank')}>{data.label}</div>
  </NodeWrapper>
);

export const GroupNode = ({ data }: NodeProps) => (
  <div className="rounded-xl border border-dashed border-border bg-bg-elevated/20 p-2 min-w-[300px] min-h-[300px] relative transition-colors hover:bg-bg-elevated/40">
    <div className="absolute top-2 left-3 bg-bg-base px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold text-text-secondary border border-border">
      <Folder size={12} className="inline mr-1" /> {data.label || 'Group'}
    </div>
  </div>
);
