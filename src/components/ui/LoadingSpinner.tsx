import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false
}) => {
  const spinnerClass = `loading-spinner loading-spinner--${size} loading-spinner--${color}`;
  const containerClass = fullScreen ? 'loading-container loading-container--fullscreen' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className={spinnerClass}>
        <div className="loading-spinner__circle"></div>
        <div className="loading-spinner__circle"></div>
        <div className="loading-spinner__circle"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;