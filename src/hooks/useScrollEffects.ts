import { useState, useEffect } from 'react';

interface ScrollEffects {
  scrollY: number;
  scrollProgress: number;
  isScrolling: boolean;
  zoomLevel: number;
}

export const useScrollEffects = (): ScrollEffects => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Set new timeout to detect when scrolling stops
      const newTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      setScrollTimeout(newTimeout);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  // Calculate scroll progress (0 to 1)
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

  // Calculate zoom level based on scroll (subtle zoom effect)
  const zoomLevel = 1 + (scrollProgress * 0.1); // Max 10% zoom

  return {
    scrollY,
    scrollProgress,
    isScrolling,
    zoomLevel
  };
};

