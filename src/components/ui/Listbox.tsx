import React, { useState, useRef, useEffect } from 'react';
import './Listbox.css';

interface ListboxProps {
  children: React.ReactNode;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

interface ListboxOptionProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  disabled?: boolean;
}

interface ListboxLabelProps {
  children: React.ReactNode;
  className?: string;
}

const ListboxContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  onValueChange?: (value: string) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
  selectedValue: '',
  setSelectedValue: () => {},
  onValueChange: undefined
});

export const Listbox: React.FC<ListboxProps> = ({ 
  children, 
  name,
  defaultValue = '',
  value,
  onChange,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue);
  const listboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listboxRef.current && !listboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <ListboxContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      selectedValue, 
      setSelectedValue: handleValueChange,
      onValueChange: onChange
    }}>
      <div ref={listboxRef} className={`velotax-listbox ${className}`}>
        <input type="hidden" name={name} value={selectedValue} />
        {children}
      </div>
    </ListboxContext.Provider>
  );
};

export const ListboxButton: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const { isOpen, setIsOpen } = React.useContext(ListboxContext);

  return (
    <button
      type="button"
      className={`velotax-listbox-button ${isOpen ? 'velotax-listbox-button--open' : ''} ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {children}
    </button>
  );
};

export const ListboxOptions: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const { isOpen } = React.useContext(ListboxContext);

  if (!isOpen) return null;

  return (
    <div className={`velotax-listbox-options ${className}`}>
      {children}
    </div>
  );
};

export const ListboxOption: React.FC<ListboxOptionProps> = ({ 
  children, 
  value,
  className = '',
  disabled = false
}) => {
  const { selectedValue, setSelectedValue } = React.useContext(ListboxContext);

  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      className={`velotax-listbox-option ${isSelected ? 'velotax-listbox-option--selected' : ''} ${disabled ? 'velotax-listbox-option--disabled' : ''} ${className}`}
      onClick={() => !disabled && setSelectedValue(value)}
      disabled={disabled}
      role="option"
      aria-selected={isSelected}
    >
      {children}
    </button>
  );
};

export const ListboxLabel: React.FC<ListboxLabelProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <span className={`velotax-listbox-label ${className}`}>
      {children}
    </span>
  );
};



