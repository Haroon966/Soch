export type NodeType = 'SourceNode' | 'IdeaNode' | 'QuestionNode' | 'ClaimNode' | 'EvidenceNode' | 'GroupNode' | 'LinkNode';
export type EdgeType = 'SupportEdge' | 'ContradictEdge' | 'RelatesEdge' | 'CausesEdge';

export interface SourceFile {
  id: string; // File path or unique id
  name: string;
  type: string; // 'image', 'pdf', 'document', etc.
  size: number;
  lastModified: number;
  handle?: FileSystemFileHandle | null;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  sourceFolderPath?: string;
  tags?: string[];
}
