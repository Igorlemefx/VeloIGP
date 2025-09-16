import React from 'react';
import './PremiumCard.css';

interface PremiumCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  size = 'md',
  hover = true,
  className = '',
  onClick
}) => {
  const baseClasses = 'veloigp-card';
  const variantClass = `veloigp-card--${variant}`;
  const sizeClass = `veloigp-card--${size}`;
  const hoverClass = hover ? 'veloigp-card--hover' : '';
  const clickableClass = onClick ? 'veloigp-card--clickable' : '';

  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    hoverClass,
    clickableClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {(title || subtitle || icon) && (
        <div className="veloigp-card__header">
          {icon && (
            <div className="veloigp-card__icon">
              {icon}
            </div>
          )}
          <div className="veloigp-card__title-section">
            {title && (
              <h3 className="veloigp-card__title">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="veloigp-card__subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="veloigp-card__content">
        {children}
      </div>
      
      <div className="veloigp-card__glow"></div>
    </div>
  );
};

export default PremiumCard;
