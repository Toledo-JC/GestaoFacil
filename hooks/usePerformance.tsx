import { useEffect, useRef } from 'react';

export interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  componentName: string;
}

export function usePerformance(componentName: string) {
  const mountTime = useRef<number>(0);
  const renderTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = Date.now();
    
    return () => {
      const lifetime = Date.now() - mountTime.current;
      
      if (__DEV__) {
        console.log(`[Performance] ${componentName} lifetime: ${lifetime}ms`);
      }

      // Log to analytics
      // analyticsService.logPerformance({
      //   componentName,
      //   renderTime: renderTime.current,
      //   mountTime: lifetime,
      // });
    };
  }, [componentName]);

  const measureRender = () => {
    const start = Date.now();
    
    return () => {
      renderTime.current = Date.now() - start;
      
      if (__DEV__ && renderTime.current > 16) {
        console.warn(`[Performance] ${componentName} slow render: ${renderTime.current}ms`);
      }
    };
  };

  return { measureRender };
}
