import { useState, useEffect, useRef, type RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Observes when an element enters or exits the viewport.
 * Useful for lazy loading, infinite scroll, and scroll-triggered animations.
 */
export function useIntersectionObserver<T extends HTMLElement>(
  options?: UseIntersectionObserverOptions,
): { ref: RefObject<T | null>; isIntersecting: boolean; entry: IntersectionObserverEntry | null } {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false } = options || {};
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setIsIntersecting(observerEntry.isIntersecting);
        setEntry(observerEntry);

        if (triggerOnce && observerEntry.isIntersecting) {
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isIntersecting, entry };
}
