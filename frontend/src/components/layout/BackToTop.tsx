'use client';

import { useState, useEffect } from 'react';

interface BackToTopProps {
  threshold?: number;
  className?: string;
}

export default function BackToTop({ threshold = 300, className = '' }: BackToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-gray-700 border border-gray-600
        text-white shadow-lg hover:bg-gray-600 transition-all duration-200
        flex items-center justify-center ${className}`}
      aria-label="ページの先頭へ"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
