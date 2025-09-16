import React, { forwardRef } from 'react';
import './Select.css';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    children, 
    className = '', 
    variant = 'default', 
    size = 'md', 
    error = false, 
    disabled = false,
    ...props 
  }, ref) => {
    const selectClasses = [
      'velotax-select',
      `velotax-select--${variant}`,
      `velotax-select--${size}`,
      error ? 'velotax-select--error' : '',
      disabled ? 'velotax-select--disabled' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className="velotax-select-wrapper">
        <select
          ref={ref}
          className={selectClasses}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        <div className="velotax-select-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
