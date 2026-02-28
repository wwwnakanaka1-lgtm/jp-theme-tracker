'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (itemId: string) => void;
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  onSelect,
  align = 'left',
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;
    onSelect(item.id);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <div onClick={() => setIsOpen((p) => !p)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-[180px] bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1
            ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => handleSelect(item)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors
                ${item.disabled ? 'text-gray-600 cursor-not-allowed' : ''}
                ${item.danger && !item.disabled ? 'text-red-400 hover:bg-red-900/30' : ''}
                ${!item.danger && !item.disabled ? 'text-gray-200 hover:bg-gray-700' : ''}`}
            >
              {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
