import React, { useState, useRef, useEffect } from 'react';
import useMobileOptimization from '../../hooks/useMobileOptimization';
import './LazyImage.css';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VtPC90ZXh0Pjwvc3ZnPg==',
  className = '',
  onLoad,
  onError,
  threshold = 200
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { lazyLoadThreshold, optimizeImages } = useMobileOptimization();

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!optimizeImages) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: `${lazyLoadThreshold}px`
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoadThreshold, optimizeImages]);

  // Carregar imagem quando estiver em view
  useEffect(() => {
    if (!isInView || !optimizeImages) return;

    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;
  }, [isInView, src, onLoad, onError, optimizeImages]);

  const imageSrc = optimizeImages && !isLoaded ? placeholder : src;
  const showPlaceholder = optimizeImages && !isLoaded && !hasError;

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className} ${showPlaceholder ? 'lazy-image--loading' : ''} ${isLoaded ? 'lazy-image--loaded' : ''}`}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`lazy-image ${isLoaded ? 'lazy-image--visible' : ''}`}
        loading={optimizeImages ? 'lazy' : 'eager'}
        decoding="async"
      />
      
      {showPlaceholder && (
        <div className="lazy-image-placeholder">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="lazy-image-error">
          <i className="fas fa-image"></i>
          <span>Erro ao carregar</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;


