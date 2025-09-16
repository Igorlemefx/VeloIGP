import React from 'react';
import './VeloigpCard.css';

interface VeloigpCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

const VeloigpCard: React.FC<VeloigpCardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  onClick,
  disabled = false
}) => {
  const cardClasses = [
    'velotax-card',
    `velotax-card--${variant}`,
    `velotax-card--${size}`,
    disabled ? 'velotax-card--disabled' : '',
    onClick ? 'velotax-card--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default VeloigpCard;



