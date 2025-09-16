import React, { useMemo } from 'react';
// import './VirtualizedTable.css';

interface VirtualizedTableProps {
  data: any[][];
  headers: string[];
  height?: number;
  itemHeight?: number;
  onRowClick?: (row: any[], index: number) => void;
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  data,
  headers,
  height = 400,
  itemHeight = 40,
  onRowClick
}) => {
  // Por enquanto, renderizar apenas as primeiras 100 linhas para performance
  const displayData = useMemo(() => data.slice(0, 100), [data]);

  return (
    <div className="virtualized-table" style={{ height: `${height}px` }}>
      <div className="virtual-header">
        {headers.map((header, index) => (
          <div key={index} className="virtual-header-cell">
            {header}
          </div>
        ))}
      </div>
      <div className="virtual-body" style={{ height: `${height - 40}px`, overflowY: 'auto' }}>
        {displayData.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`virtual-row ${rowIndex % 2 === 0 ? 'even' : 'odd'}`}
            style={{ height: `${itemHeight}px` }}
            onClick={() => onRowClick?.(row, rowIndex)}
          >
            {row.map((cell: any, cellIndex: number) => (
              <div key={cellIndex} className="virtual-cell">
                {cell || ''}
              </div>
            ))}
          </div>
        ))}
        {data.length > 100 && (
          <div className="virtual-row more-data">
            <div className="virtual-cell" style={{ width: '100%', textAlign: 'center', fontStyle: 'italic' }}>
              ... e mais {data.length - 100} linhas (use filtros para reduzir)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedTable;
