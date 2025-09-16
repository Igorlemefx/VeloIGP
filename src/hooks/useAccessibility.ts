// Hook para funcionalidades de acessibilidade
import { useEffect, useState } from 'react';

export interface AccessibilityConfig {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export const useAccessibility = () => {
  const [config, setConfig] = useState<AccessibilityConfig>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false
  });

  useEffect(() => {
    // Detectar preferências do sistema
    const mediaQueries = {
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
    };

    // Detectar screen reader
    const isScreenReader = window.speechSynthesis !== undefined;

    // Detectar navegação por teclado
    const isKeyboardNavigation = document.addEventListener !== undefined;

    setConfig({
      highContrast: mediaQueries.highContrast.matches,
      largeText: false, // Será controlado pelo usuário
      reducedMotion: mediaQueries.reducedMotion.matches,
      screenReader: isScreenReader,
      keyboardNavigation: isKeyboardNavigation
    });

    // Aplicar estilos baseados nas preferências
    applyAccessibilityStyles({
      highContrast: mediaQueries.highContrast.matches,
      largeText: false,
      reducedMotion: mediaQueries.reducedMotion.matches,
      screenReader: isScreenReader,
      keyboardNavigation: isKeyboardNavigation
    });

    // Listeners para mudanças nas preferências
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, highContrast: e.matches }));
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQueries.highContrast.addEventListener('change', handleHighContrastChange);
    mediaQueries.reducedMotion.addEventListener('change', handleReducedMotionChange);

    return () => {
      mediaQueries.highContrast.removeEventListener('change', handleHighContrastChange);
      mediaQueries.reducedMotion.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const updateConfig = (newConfig: Partial<AccessibilityConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    applyAccessibilityStyles(updatedConfig);
    
    // Salvar no localStorage
    localStorage.setItem('veloigp-accessibility', JSON.stringify(updatedConfig));
  };

  const applyAccessibilityStyles = (accessibilityConfig: AccessibilityConfig) => {
    const root = document.documentElement;
    
    // Alto contraste
    if (accessibilityConfig.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Texto grande
    if (accessibilityConfig.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Movimento reduzido
    if (accessibilityConfig.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Screen reader
    if (accessibilityConfig.screenReader) {
      root.classList.add('screen-reader');
    } else {
      root.classList.remove('screen-reader');
    }
  };

  const announceToScreenReader = (message: string) => {
    if (config.screenReader) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      announceToScreenReader(`Foco em ${element.textContent || element.getAttribute('aria-label') || 'elemento'}`);
    }
  };

  return {
    config,
    updateConfig,
    announceToScreenReader,
    focusElement
  };
};

export default useAccessibility;



