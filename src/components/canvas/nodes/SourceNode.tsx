import { Handle, Position } from 'reactflow';
import { FileImage, FileText, Link2, Database, HelpCircle, FileAudio } from 'lucide-react';

const getIcon = (type: string) => {
  switch (type) {
    case 'image': return <FileImage size={24} className="text-accent" />;
    case 'pdf': case 'document': return <FileText size={24} className="text-green-500" />;
    case 'link': return <Link2 size={24} className="text-orange-500" />;
    case 'data': return <Database size={24} className="text-yellow-500" />;
    case 'media': return <FileAudio size={24} className="text-red-500" />;
    default: return <HelpCircle size={24} className="text-text-secondary" />;
  }
};

export const SourceNode = ({ data, isConnectable }: any) => {
  return (
    <div className="react-flow__node px-4 py-3 shadow-md rounded-md bg-bg-card border-border border min-w-[180px] flex flex-col gap-2">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 !bg-accent border-bg-card" />
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getIcon(data.sourceType)}
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-semibold text-text-primary truncate" title={data.label}>{data.label}</div>
          <div className="text-[10px] text-text-secondary uppercase mt-0.5 tracking-wider">{data.sourceType || 'Unknown'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 !bg-accent border-bg-card" />
    </div>
  );
};
