import { useState, useEffect, useCallback } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  viewport: {
    width: number;
    height: number;
  };
}

const useMobileDetection = (): MobileDetection => {
  const [detection, setDetection] = useState<MobileDetection>(() => {
    // Valores iniciais do servidor
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenSize: 'lg',
      orientation: 'landscape',
      touchDevice: false,
      deviceType: 'desktop',
      viewport: { width: 1024, height: 768 }
    };
  });

  const updateDetection = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Detecção de dispositivo touch
    const touchDevice = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       (navigator as any).msMaxTouchPoints > 0;

    // Breakpoints responsivos
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    // Tamanho da tela
    let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    if (width < 480) screenSize = 'xs';
    else if (width < 768) screenSize = 'sm';
    else if (width < 1024) screenSize = 'md';
    else if (width < 1280) screenSize = 'lg';
    else screenSize = 'xl';

    // Orientação
    const orientation = height > width ? 'portrait' : 'landscape';

    // Tipo de dispositivo
    let deviceType: 'mobile' | 'tablet' | 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';
    else deviceType = 'desktop';

    setDetection({
      isMobile,
      isTablet,
      isDesktop,
      screenSize,
      orientation,
      touchDevice,
      deviceType,
      viewport: { width, height }
    });
  }, []);

  useEffect(() => {
    // Atualizar na montagem
    updateDetection();

    // Listener para mudanças de tamanho
    const handleResize = () => {
      updateDetection();
    };

    // Listener para mudanças de orientação
    const handleOrientationChange = () => {
      // Delay para aguardar a mudança de orientação
      setTimeout(updateDetection, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateDetection]);

  return detection;
};

export default useMobileDetection;


