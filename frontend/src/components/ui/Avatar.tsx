'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(/[\s\-_]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const fallbackColors = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
];

function getColorFromName(name: string): string {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return fallbackColors[hash % fallbackColors.length];
}

export default function Avatar({ src, alt, name = '', size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !src || imgError;
  const initials = getInitials(name || alt || '?');
  const bgColor = getColorFromName(name || alt || 'default');

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden
        ${sizeClasses[size]} ${showFallback ? bgColor : ''} ${className}`}
    >
      {showFallback ? (
        <span className="font-semibold text-white select-none">{initials}</span>
      ) : (
        <img
          src={src!}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
