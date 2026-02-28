import { useState, useEffect, useCallback } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'none';
  isAtTop: boolean;
  isAtBottom: boolean;
}

/**
 * Tracks the current scroll position and direction.
 * Useful for sticky headers, scroll-to-top buttons, etc.
 */
export function useScrollPosition(throttleMs: number = 100): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: 'none',
    isAtTop: true,
    isAtBottom: false,
  });

  const handleScroll = useCallback(() => {
    const x = window.scrollX;
    const y = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    setPosition((prev) => ({
      x,
      y,
      direction: y > prev.y ? 'down' : y < prev.y ? 'up' : prev.direction,
      isAtTop: y <= 0,
      isAtBottom: y >= maxScroll - 1,
    }));
  }, []);

  useEffect(() => {
    let lastCall = 0;
    let timer: ReturnType<typeof setTimeout>;

    const throttled = () => {
      const now = Date.now();
      const remaining = throttleMs - (now - lastCall);

      if (remaining <= 0) {
        lastCall = now;
        handleScroll();
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          lastCall = Date.now();
          handleScroll();
        }, remaining);
      }
    };

    window.addEventListener('scroll', throttled, { passive: true });
    handleScroll(); // initial read

    return () => {
      window.removeEventListener('scroll', throttled);
      clearTimeout(timer);
    };
  }, [handleScroll, throttleMs]);

  return position;
}
