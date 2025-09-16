import React from 'react';
import './Fieldset.css';

interface FieldsetProps {
  children: React.ReactNode;
  className?: string;
}

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

interface FieldProps {
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({ children, className = '' }) => {
  return (
    <div className={`velotax-field ${className}`}>
      {children}
    </div>
  );
};

export const Label: React.FC<LabelProps> = ({ children, className = '', htmlFor }) => {
  return (
    <label htmlFor={htmlFor} className={`velotax-label ${className}`}>
      {children}
    </label>
  );
};

export const Fieldset: React.FC<FieldsetProps> = ({ children, className = '' }) => {
  return (
    <fieldset className={`velotax-fieldset ${className}`}>
      {children}
    </fieldset>
  );
};



