import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import type { EdgeProps } from 'reactflow';

export const SemanticEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getStyle = () => {
    switch (data?.semanticType) {
      case 'Supports': return { stroke: 'var(--green)', strokeWidth: 2 };
      case 'Contradicts': return { stroke: 'var(--red)', strokeWidth: 2 };
      case 'Causes': return { stroke: 'var(--orange)', strokeWidth: 2 };
      case 'Relates To': default: return { stroke: 'var(--text-secondary)', strokeWidth: 2, strokeDasharray: '5,5' };
    }
  };

  return (
    <>
      <path id={id} className="react-flow__edge-path" d={edgePath} style={getStyle()} />
      {data?.semanticType && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-0.5 rounded bg-bg-card border border-border text-[10px] uppercase tracking-wider font-semibold shadow-sm z-10"
          >
            {data.semanticType}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
