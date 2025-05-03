'use client';

import { useState, useRef, useEffect } from 'react';
import { Badge } from './badge';
import { X } from 'lucide-react';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface SimpleMultiSelectProps {
  id?: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  allowCustomValues?: boolean;
}

export function SimpleMultiSelect({
  id,
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  allowCustomValues = false
}: SimpleMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selected.includes(option.value)
  );

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle selection of an option
  const handleSelect = (value: string) => {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
    setSearchTerm('');
    inputRef.current?.focus();
  };

  // Handle removal of a selected option
  const handleRemove = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  // Handle key press in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter key adds custom value if allowed
    if (e.key === 'Enter' && searchTerm.trim() && allowCustomValues) {
      e.preventDefault();
      handleSelect(searchTerm.trim());
    }

    // Escape key closes dropdown
    if (e.key === 'Escape') {
      setIsOpen(false);
    }

    // Backspace removes last selected item if input is empty
    if (e.key === 'Backspace' && !searchTerm && selected.length > 0) {
      handleRemove(selected[selected.length - 1]);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative"
    >
      {/* Input area with selected items */}
      <div 
        className="w-full min-h-[38px] flex flex-wrap gap-1 p-2 border rounded-md bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {/* Selected items as badges */}
        {selected.map(value => (
          <Badge key={value} className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {options.find(opt => opt.value === value)?.label || value}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(value);
              }}
              className="hover:text-red-500"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}

        {/* Input for searching/adding */}
        <input
          id={id}
          ref={inputRef}
          className="flex-grow outline-none min-w-[50px] bg-transparent"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length ? '' : placeholder}
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800 border rounded-md shadow-lg">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-gray-500 text-sm">
              {allowCustomValues && searchTerm.trim() 
                ? "Press Enter to add this value" 
                : "No options available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}