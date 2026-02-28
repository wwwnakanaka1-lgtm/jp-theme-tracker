'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const sizes = {
  sm: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
  md: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
};

export default function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}: SwitchProps) {
  const s = sizes[size];

  return (
    <label
      className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {(label || description) && (
        <div className="flex-1">
          {label && <span className="text-white font-medium text-sm">{label}</span>}
          {description && <p className="text-gray-400 text-xs mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`${s.track} relative inline-flex items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${checked ? 'bg-blue-600' : 'bg-gray-600'}`}
      >
        <span
          className={`${s.thumb} inline-block bg-white rounded-full transform transition-transform
            ${checked ? s.translate : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  );
}
