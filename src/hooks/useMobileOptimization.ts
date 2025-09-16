import { useState, useEffect, useCallback, useMemo } from 'react';
import useMobileDetection from './useMobileDetection';

interface MobileOptimization {
  // Performance
  enableVirtualization: boolean;
  reduceAnimations: boolean;
  optimizeImages: boolean;
  lazyLoadThreshold: number;
  
  // Touch
  enableHapticFeedback: boolean;
  touchDelay: number;
  swipeThreshold: number;
  
  // UI
  compactMode: boolean;
  largeTouchTargets: boolean;
  simplifiedUI: boolean;
  
  // Network
  aggressiveCaching: boolean;
  reducedDataUsage: boolean;
  offlineMode: boolean;
}

const useMobileOptimization = (): MobileOptimization => {
  const { isMobile, deviceType, screenSize, touchDevice } = useMobileDetection();
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  // Detectar dispositivo de baixo desempenho
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDevicePerformance = () => {
      const memory = (navigator as any).deviceMemory || 4; // GB
      const cores = navigator.hardwareConcurrency || 4;
      const connection = (navigator as any).connection;
      
      const isLowMemory = memory < 4;
      const isLowCores = cores < 4;
      const isSlowNetwork = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.saveData === true
      );

      setIsLowEndDevice(isLowMemory || isLowCores);
      setIsSlowConnection(isSlowNetwork || false);
    };

    checkDevicePerformance();
  }, []);

  // Configurações baseadas no dispositivo
  const optimization = useMemo((): MobileOptimization => {
    if (!isMobile) {
      return {
        enableVirtualization: false,
        reduceAnimations: false,
        optimizeImages: false,
        lazyLoadThreshold: 1000,
        enableHapticFeedback: false,
        touchDelay: 0,
        swipeThreshold: 50,
        compactMode: false,
        largeTouchTargets: false,
        simplifiedUI: false,
        aggressiveCaching: false,
        reducedDataUsage: false,
        offlineMode: false
      };
    }

    // Configurações para mobile
    return {
      // Performance
      enableVirtualization: isLowEndDevice || screenSize === 'xs',
      reduceAnimations: isLowEndDevice || isSlowConnection,
      optimizeImages: true,
      lazyLoadThreshold: isLowEndDevice ? 200 : 500,
      
      // Touch
      enableHapticFeedback: touchDevice && !isLowEndDevice,
      touchDelay: isLowEndDevice ? 100 : 50,
      swipeThreshold: screenSize === 'xs' ? 30 : 50,
      
      // UI
      compactMode: screenSize === 'xs' || screenSize === 'sm',
      largeTouchTargets: true,
      simplifiedUI: isLowEndDevice || isSlowConnection,
      
      // Network
      aggressiveCaching: isSlowConnection,
      reducedDataUsage: isSlowConnection,
      offlineMode: isSlowConnection
    };
  }, [isMobile, deviceType, screenSize, touchDevice, isLowEndDevice, isSlowConnection]);

  // Hook para otimizar listas grandes
  const useVirtualizedList = useCallback((items: any[], itemHeight: number = 50) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
    
    if (!optimization.enableVirtualization) {
      return { items, visibleRange: { start: 0, end: items.length } };
    }

    const containerHeight = 400; // Altura do container
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
    
    const visibleItems = items.slice(visibleRange.start, visibleRange.end);
    
    return {
      items: visibleItems,
      visibleRange,
      totalHeight: items.length * itemHeight,
      offsetY: visibleRange.start * itemHeight
    };
  }, [optimization.enableVirtualization]);

  // Hook para lazy loading de imagens
  const useLazyImage = useCallback((src: string, placeholder?: string) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
      if (!optimization.optimizeImages || !isInView) return;

      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setError(true);
      img.src = src;
    }, [src, isInView, optimization.optimizeImages]);

    return {
      src: isLoaded ? src : placeholder,
      isLoaded,
      error,
      isInView,
      setIsInView
    };
  }, [optimization.optimizeImages]);

  // Hook para debounce em mobile
  const useMobileDebounce = useCallback((callback: Function, delay: number) => {
    const debouncedCallback = useCallback(
      (...args: any[]) => {
        const timeoutId = setTimeout(() => callback(...args), delay + optimization.touchDelay);
        return () => clearTimeout(timeoutId);
      },
      [callback, delay, optimization.touchDelay]
    );

    return debouncedCallback;
  }, [optimization.touchDelay]);

  return {
    ...optimization,
    useVirtualizedList,
    useLazyImage,
    useMobileDebounce
  } as MobileOptimization & {
    useVirtualizedList: typeof useVirtualizedList;
    useLazyImage: typeof useLazyImage;
    useMobileDebounce: typeof useMobileDebounce;
  };
};

export default useMobileOptimization;


