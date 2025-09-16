// @ts-nocheck
import React, { Suspense, lazy } from 'react';
import SmartLoading from '../ui/SmartLoading';

// Lazy loading dos componentes de gráficos
const PerformanceCharts = lazy(() => import('../charts/PerformanceCharts'));
const InteractiveCharts = lazy(() => import('../charts/InteractiveCharts'));

interface LazyChartsProps {
  data: any;
  headers: string[];
  type: string;
}

const LazyCharts: React.FC<LazyChartsProps> = ({ data, headers, type }) => {
  return (
    <Suspense 
      fallback={
        <SmartLoading
          isLoading={true}
          progress={50}
          message="Carregando gráficos..."
          showProgress={true}
        />
      }
    >
      {type === 'performance' ? (
        <PerformanceCharts data={data} />
      ) : (
        <InteractiveCharts 
          data={data} 
          headers={headers} 
          type={type} 
        />
      )}
    </Suspense>
  );
};

export default LazyCharts;



