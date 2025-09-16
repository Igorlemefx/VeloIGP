import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  outline?: boolean;
  className?: string;
}

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  anchor?: 'bottom start' | 'bottom end' | 'top start' | 'top end';
}

interface DropdownItemProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

interface DropdownLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownDividerProps {
  className?: string;
}

const DropdownContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {}
});

export const Dropdown: React.FC<DropdownProps> = ({ children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className={`velotax-dropdown ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownButton: React.FC<DropdownButtonProps> = ({ 
  children, 
  as: Component = 'button',
  outline = false,
  className = '',
  ...props 
}) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownContext);

  const buttonClasses = [
    'velotax-dropdown-button',
    outline ? 'velotax-dropdown-button--outline' : '',
    isOpen ? 'velotax-dropdown-button--open' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component
      className={buttonClasses}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="true"
      {...props}
    >
      {children}
    </Component>
  );
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  children, 
  className = '',
  anchor = 'bottom start'
}) => {
  const { isOpen } = React.useContext(DropdownContext);

  const menuClasses = [
    'velotax-dropdown-menu',
    `velotax-dropdown-menu--${anchor.replace(' ', '-')}`,
    isOpen ? 'velotax-dropdown-menu--open' : '',
    className
  ].filter(Boolean).join(' ');

  if (!isOpen) return null;

  return (
    <div className={menuClasses}>
      {children}
    </div>
  );
};

export const DropdownItem: React.FC<DropdownItemProps> = ({ 
  children, 
  href,
  onClick,
  className = ''
}) => {
  const { setIsOpen } = React.useContext(DropdownContext);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setIsOpen(false);
  };

  const itemClasses = [
    'velotax-dropdown-item',
    className
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <a href={href} className={itemClasses} onClick={handleClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={itemClasses} onClick={handleClick}>
      {children}
    </button>
  );
};

export const DropdownLabel: React.FC<DropdownLabelProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <span className={`velotax-dropdown-label ${className}`}>
      {children}
    </span>
  );
};

export const DropdownDivider: React.FC<DropdownDividerProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`velotax-dropdown-divider ${className}`} />
  );
};
