import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should export useDebounce function', async () => {
    const mod = await import('@/hooks/useDebounce');
    expect(typeof mod.useDebounce).toBe('function');
  });

  it('should export useDebouncedCallback function', async () => {
    const mod = await import('@/hooks/useDebounce');
    expect(typeof mod.useDebouncedCallback).toBe('function');
  });
});

describe('useLocalStorage', () => {
  it('should export useLocalStorage function', async () => {
    const mod = await import('@/hooks/useLocalStorage');
    expect(typeof mod.useLocalStorage).toBe('function');
  });
});

describe('useMediaQuery', () => {
  it('should export useMediaQuery function', async () => {
    const mod = await import('@/hooks/useMediaQuery');
    expect(typeof mod.useMediaQuery).toBe('function');
  });

  it('should export useBreakpoint function', async () => {
    const mod = await import('@/hooks/useMediaQuery');
    expect(typeof mod.useBreakpoint).toBe('function');
  });
});

describe('usePagination', () => {
  it('should export usePagination function', async () => {
    const mod = await import('@/hooks/usePagination');
    expect(typeof mod.usePagination).toBe('function');
  });
});

describe('useWebSocket', () => {
  it('should export useWebSocket function', async () => {
    const mod = await import('@/hooks/useWebSocket');
    expect(typeof mod.useWebSocket).toBe('function');
  });
});

describe('useThemeData', () => {
  it('should export useThemeData function', async () => {
    const mod = await import('@/hooks/useThemeData');
    expect(typeof mod.useThemeData).toBe('function');
  });

  it('should export useStockData function', async () => {
    const mod = await import('@/hooks/useThemeData');
    expect(typeof mod.useStockData).toBe('function');
  });
});
