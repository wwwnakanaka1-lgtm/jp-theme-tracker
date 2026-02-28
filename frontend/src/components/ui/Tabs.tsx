'use client';

import { useState, useCallback } from 'react';

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

const baseTabClass = 'px-4 py-2 text-sm font-medium transition-colors focus:outline-none';

const variants = {
  underline: {
    container: 'flex border-b border-gray-700 gap-1',
    active: 'text-blue-400 border-b-2 border-blue-400',
    inactive: 'text-gray-400 hover:text-gray-200',
    disabled: 'text-gray-600 cursor-not-allowed',
  },
  pill: {
    container: 'flex bg-gray-800 rounded-lg p-1 gap-1',
    active: 'bg-gray-700 text-white rounded-md',
    inactive: 'text-gray-400 hover:text-gray-200 rounded-md',
    disabled: 'text-gray-600 cursor-not-allowed',
  },
};

export default function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActive,
  onChange,
  variant = 'underline',
  className = '',
}: TabsProps) {
  const [internalActive, setInternalActive] = useState(defaultTab || tabs[0]?.id || '');
  const activeTab = controlledActive ?? internalActive;
  const style = variants[variant];

  const handleClick = useCallback(
    (tabId: string) => {
      if (controlledActive === undefined) {
        setInternalActive(tabId);
      }
      onChange?.(tabId);
    },
    [controlledActive, onChange],
  );

  return (
    <div className={`${style.container} ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          disabled={tab.disabled}
          onClick={() => handleClick(tab.id)}
          className={`${baseTabClass} ${
            tab.disabled
              ? style.disabled
              : activeTab === tab.id
                ? style.active
                : style.inactive
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
