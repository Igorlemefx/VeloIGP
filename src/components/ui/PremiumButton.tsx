import React from 'react';
import { VeloigpDesignSystem } from '../../design-system/VeloigpDesignSystem';
import './PremiumButton.css';

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  onClick,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'veloigp-button';
  const variantClass = `veloigp-button--${variant}`;
  const sizeClass = `veloigp-button--${size}`;
  const stateClass = disabled ? 'veloigp-button--disabled' : '';
  const loadingClass = loading ? 'veloigp-button--loading' : '';

  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    stateClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="veloigp-button__spinner">
          <div className="spinner"></div>
        </div>
      )}
      
      {!loading && icon && (
        <span className="veloigp-button__icon">
          {icon}
        </span>
      )}
      
      <span className="veloigp-button__content">
        {children}
      </span>
      
      {!loading && (
        <div className="veloigp-button__ripple"></div>
      )}
    </button>
  );
};

export default PremiumButton;
