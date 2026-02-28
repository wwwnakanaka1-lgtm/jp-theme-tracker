import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isApiError } from '@/types/api';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ThemeListParams,
  StockSearchParams,
  ExportParams,
  HealthStatus,
} from '@/types/api';

describe('API type guards', () => {
  it('isApiError should detect error responses', () => {
    const errorRes: ApiErrorResponse = {
      error: { code: 'NOT_FOUND', message: 'Not found' },
    };
    expect(isApiError(errorRes)).toBe(true);
  });

  it('isApiError should return false for success responses', () => {
    const successRes: ApiSuccessResponse<string> = {
      data: 'hello',
    };
    expect(isApiError(successRes)).toBe(false);
  });

  it('isApiError should handle success with meta', () => {
    const successRes: ApiSuccessResponse<number[]> = {
      data: [1, 2, 3],
      meta: { total: 3, page: 1, pageSize: 10, lastUpdated: null },
    };
    expect(isApiError(successRes)).toBe(false);
  });
});

describe('API parameter types', () => {
  it('ThemeListParams should support all fields', () => {
    const params: ThemeListParams = {
      period: '1mo',
      category: 'ai',
      minReturn: -10,
      maxReturn: 50,
      page: 1,
      pageSize: 20,
      sortBy: 'changePct',
      sortOrder: 'desc',
      search: 'AI',
    };
    expect(params.period).toBe('1mo');
    expect(params.category).toBe('ai');
    expect(params.sortOrder).toBe('desc');
  });

  it('StockSearchParams should support query and filters', () => {
    const params: StockSearchParams = {
      query: 'Toyota',
      themeId: 'ev',
      marketCapCategory: 'mega',
      minPrice: 1000,
      maxPrice: 10000,
    };
    expect(params.query).toBe('Toyota');
    expect(params.themeId).toBe('ev');
  });

  it('ExportParams should support format and type', () => {
    const params: ExportParams = {
      format: 'csv',
      type: 'themes',
      period: '3mo',
    };
    expect(params.format).toBe('csv');
    expect(params.type).toBe('themes');
  });

  it('ExportParams should support stock code arrays', () => {
    const params: ExportParams = {
      format: 'json',
      type: 'stocks',
      stockCodes: ['7203', '6758', '9984'],
    };
    expect(params.stockCodes).toHaveLength(3);
  });
});

describe('HealthStatus type', () => {
  it('should represent a healthy status', () => {
    const health: HealthStatus = {
      status: 'healthy',
      version: '2.0.0',
      uptime: 86400,
      checks: { database: true, cache: true, externalApi: true },
    };
    expect(health.status).toBe('healthy');
    expect(health.checks.database).toBe(true);
  });

  it('should represent a degraded status', () => {
    const health: HealthStatus = {
      status: 'degraded',
      version: '2.0.0',
      uptime: 3600,
      checks: { database: true, cache: false, externalApi: true },
    };
    expect(health.status).toBe('degraded');
    expect(health.checks.cache).toBe(false);
  });
});

describe('fetchThemes integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchThemes should be a function', async () => {
    const { fetchThemes } = await import('@/lib/api');
    expect(typeof fetchThemes).toBe('function');
  });

  it('fetchThemeDetail should be a function', async () => {
    const { fetchThemeDetail } = await import('@/lib/api');
    expect(typeof fetchThemeDetail).toBe('function');
  });

  it('fetchStockDetail should be a function', async () => {
    const { fetchStockDetail } = await import('@/lib/api');
    expect(typeof fetchStockDetail).toBe('function');
  });

  it('fetchNikkei225 should be a function', async () => {
    const { fetchNikkei225 } = await import('@/lib/api');
    expect(typeof fetchNikkei225).toBe('function');
  });

  it('PERIODS should be defined', async () => {
    const { PERIODS } = await import('@/lib/api');
    expect(PERIODS.length).toBeGreaterThan(0);
    expect(PERIODS[0]).toHaveProperty('value');
    expect(PERIODS[0]).toHaveProperty('label');
  });
});
