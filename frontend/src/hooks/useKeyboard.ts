import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: KeyHandler;
}

/**
 * Registers keyboard shortcuts. Supports modifier keys (Ctrl, Shift, Alt).
 * Automatically cleans up on unmount.
 */
export function useKeyboard(bindings: KeyBinding[], enabled: boolean = true): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      for (const binding of bindings) {
        const keyMatch = event.key.toLowerCase() === binding.key.toLowerCase();
        const ctrlMatch = binding.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = binding.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = binding.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          binding.handler(event);
          return;
        }
      }
    },
    [bindings, enabled],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Simple single-key shortcut hook.
 */
export function useKeyPress(key: string, handler: KeyHandler, enabled: boolean = true): void {
  useKeyboard([{ key, handler }], enabled);
}
