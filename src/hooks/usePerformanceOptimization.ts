import { useEffect, useCallback, useMemo, useState, useRef } from 'react';

interface PerformanceOptimizationOptions {
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  enableMemoization?: boolean;
  enableDebouncing?: boolean;
  debounceDelay?: number;
}

export const usePerformanceOptimization = (options: PerformanceOptimizationOptions = {}) => {
  const {
    enableVirtualization = true,
    enableLazyLoading = true,
    enableMemoization = true,
    enableDebouncing = true,
    debounceDelay = 300
  } = options;

  // Debounce function
  const useDebounce = useCallback((callback: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(null, args), delay);
    };
  }, []);

  // Memoization helper
  const useMemoizedValue = useCallback((factory: () => any, deps: any[]) => {
    if (!enableMemoization) {
      return factory();
    }
    return useMemo(factory, deps);
  }, [enableMemoization]);

  // Lazy loading helper
  const useLazyLoad = useCallback((threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
      if (!enableLazyLoading || hasLoaded) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasLoaded(true);
            observer.disconnect();
          }
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, [threshold, hasLoaded]);

    return { ref, isVisible, hasLoaded };
  }, [enableLazyLoading]);

  // Virtualization helper
  const useVirtualization = useCallback((items: any[], itemHeight: number, containerHeight: number) => {
    if (!enableVirtualization) {
      return { visibleItems: items, startIndex: 0, endIndex: items.length - 1 };
    }

    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount);
    
    const visibleItems = items.slice(startIndex, endIndex + 1);
    
    return {
      visibleItems,
      startIndex,
      endIndex,
      setScrollTop,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [enableVirtualization]);

  // Performance monitoring
  const usePerformanceMonitor = useCallback(() => {
    useEffect(() => {
      if (typeof window === 'undefined') return;

      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', (entry as any).processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            console.log('CLS:', (entry as any).value);
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      return () => observer.disconnect();
    }, []);
  }, []);

  // Memory optimization
  const useMemoryOptimization = useCallback(() => {
    useEffect(() => {
      if (typeof window === 'undefined') return;

      // Monitor memory usage
      const checkMemory = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          console.log('Memory usage:', {
            used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
            total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
          });
        }
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }, []);
  }, []);

  // Image optimization
  const useImageOptimization = useCallback((src: string, options: { lazy?: boolean; quality?: number } = {}) => {
    const { lazy = true, quality = 80 } = options;
    
    const optimizedSrc = useMemo(() => {
      // Add quality parameter for image optimization
      if (src.includes('?')) {
        return `${src}&q=${quality}`;
      }
      return `${src}?q=${quality}`;
    }, [src, quality]);

    return {
      src: optimizedSrc,
      loading: lazy ? 'lazy' : 'eager',
      decoding: 'async'
    };
  }, []);

  // Bundle optimization
  const useBundleOptimization = useCallback(() => {
    useEffect(() => {
      // Preload critical resources
      const preloadCriticalResources = () => {
        const criticalResources = [
          '/fonts/Poppins-Regular.ttf',
          '/fonts/Poppins-Medium.ttf',
          '/fonts/Poppins-Bold.ttf'
        ];

        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource;
          link.as = 'font';
          link.type = 'font/ttf';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });
      };

      preloadCriticalResources();
    }, []);
  }, []);

  return {
    useDebounce,
    useMemoizedValue,
    useLazyLoad,
    useVirtualization,
    usePerformanceMonitor,
    useMemoryOptimization,
    useImageOptimization,
    useBundleOptimization
  };
};

export default usePerformanceOptimization;
