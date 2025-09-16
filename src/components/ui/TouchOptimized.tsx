import React, { useState, useRef, useEffect } from 'react';
import './TouchOptimized.css';

interface TouchOptimizedProps {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  hapticFeedback?: boolean;
  disabled?: boolean;
}

const TouchOptimized: React.FC<TouchOptimizedProps> = ({
  children,
  className = '',
  onTap,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  hapticFeedback = true,
  disabled = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Haptic feedback
  const triggerHaptic = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Detectar swipe
  const detectSwipe = (start: { x: number; y: number; time: number }, end: { x: number; y: number; time: number }) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const deltaTime = end.time - start.time;
    
    // Mínimo de 30px de movimento e máximo de 300ms
    if (deltaTime > 300 || (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30)) {
      return null;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      // Swipe horizontal
      return deltaX > 0 ? 'right' : 'left';
    } else {
      // Swipe vertical
      return deltaY > 0 ? 'down' : 'up';
    }
  };

  // Handlers de touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    const startPos = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    setTouchStart(startPos);
    setIsPressed(true);
    triggerHaptic();

    // Long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        onLongPress();
        triggerHaptic();
      }, 500);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStart) return;

    const touch = e.changedTouches[0];
    const endPos = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Limpar long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Detectar swipe
    if (!isLongPressing) {
      const swipe = detectSwipe(touchStart, endPos);
      
      if (swipe) {
        switch (swipe) {
          case 'left':
            onSwipeLeft?.();
            break;
          case 'right':
            onSwipeRight?.();
            break;
          case 'up':
            onSwipeUp?.();
            break;
          case 'down':
            onSwipeDown?.();
            break;
        }
        triggerHaptic();
      } else if (onTap) {
        // Tap simples
        onTap();
        triggerHaptic();
      }
    }

    setIsPressed(false);
    setIsLongPressing(false);
    setTouchStart(null);
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsPressed(false);
    setIsLongPressing(false);
    setTouchStart(null);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={`touch-optimized ${className} ${isPressed ? 'touch-optimized--pressed' : ''} ${disabled ? 'touch-optimized--disabled' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {children}
    </div>
  );
};

export default TouchOptimized;


