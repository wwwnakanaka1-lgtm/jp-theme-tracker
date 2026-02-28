import { describe, it, expect } from 'vitest';
import {
  formatYen,
  formatPercent,
  formatJPUnit,
  formatNumber,
  formatVolume,
  formatMarketCap,
  formatStockCode,
} from '@/lib/formatters';
import {
  validateStockCode,
  validatePrice,
  validateEmail,
  validateRequired,
  validateLength,
  validateRange,
  composeValidators,
} from '@/lib/validators';
import {
  cacheSet,
  cacheGet,
  cacheHas,
  cacheDelete,
  cacheClear,
  cacheSize,
  buildCacheKey,
} from '@/lib/cache';

describe('formatters', () => {
  it('formatYen should format number as yen', () => {
    expect(formatYen(1500)).toBe('¥1,500');
    expect(formatYen(0)).toBe('¥0');
  });

  it('formatPercent should include sign prefix', () => {
    expect(formatPercent(1.234)).toBe('+1.23%');
    expect(formatPercent(-0.5)).toBe('-0.50%');
    expect(formatPercent(0)).toBe('+0.00%');
  });

  it('formatJPUnit should use Japanese units', () => {
    expect(formatJPUnit(1_500_000_000_000)).toBe('1.5兆');
    expect(formatJPUnit(300_000_000)).toBe('3.0億');
    expect(formatJPUnit(50_000)).toBe('5.0万');
    expect(formatJPUnit(999)).toBe('999');
  });

  it('formatNumber should format with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(3.14159, 2)).toBe('3.14');
  });

  it('formatVolume should abbreviate large volumes', () => {
    expect(formatVolume(2_500_000)).toContain('M');
    expect(formatVolume(50_000)).toContain('K');
    expect(formatVolume(500)).toBe('500株');
  });

  it('formatMarketCap should combine yen and JP units', () => {
    expect(formatMarketCap(1_000_000_000_000)).toBe('¥1.0兆');
    expect(formatMarketCap(500_000_000)).toBe('¥5.0億');
  });

  it('formatStockCode should strip .T suffix', () => {
    expect(formatStockCode('7203.T')).toBe('7203');
    expect(formatStockCode('7203')).toBe('7203');
  });
});

describe('validators', () => {
  it('validateStockCode should accept valid 4-digit codes', () => {
    expect(validateStockCode('7203').valid).toBe(true);
    expect(validateStockCode('7203.T').valid).toBe(true);
    expect(validateStockCode('abc').valid).toBe(false);
    expect(validateStockCode('').valid).toBe(false);
    expect(validateStockCode('12345').valid).toBe(false);
  });

  it('validatePrice should accept positive numbers', () => {
    expect(validatePrice('1500').valid).toBe(true);
    expect(validatePrice('0').valid).toBe(false);
    expect(validatePrice('-10').valid).toBe(false);
    expect(validatePrice('abc').valid).toBe(false);
    expect(validatePrice('').valid).toBe(false);
  });

  it('validateEmail should validate email format', () => {
    expect(validateEmail('test@example.com').valid).toBe(true);
    expect(validateEmail('invalid').valid).toBe(false);
    expect(validateEmail('').valid).toBe(false);
  });

  it('validateRequired should fail on empty strings', () => {
    expect(validateRequired('hello').valid).toBe(true);
    expect(validateRequired('').valid).toBe(false);
    expect(validateRequired('  ').valid).toBe(false);
  });

  it('validateLength should check min and max', () => {
    expect(validateLength('abc', 2, 5).valid).toBe(true);
    expect(validateLength('a', 2, 5).valid).toBe(false);
    expect(validateLength('abcdef', 2, 5).valid).toBe(false);
  });

  it('validateRange should check numeric bounds', () => {
    expect(validateRange(5, 1, 10).valid).toBe(true);
    expect(validateRange(0, 1, 10).valid).toBe(false);
    expect(validateRange(11, 1, 10).valid).toBe(false);
  });

  it('composeValidators should return first failure', () => {
    const result = composeValidators(
      () => ({ valid: true }),
      () => ({ valid: false, error: 'failed' }),
      () => ({ valid: true }),
    );
    expect(result.valid).toBe(false);
    expect(result.error).toBe('failed');
  });
});

describe('cache', () => {
  it('should set and get values', () => {
    cacheClear();
    cacheSet('test-key', { data: 42 });
    expect(cacheGet('test-key')).toEqual({ data: 42 });
  });

  it('should return undefined for missing keys', () => {
    cacheClear();
    expect(cacheGet('nonexistent')).toBeUndefined();
  });

  it('should check existence with cacheHas', () => {
    cacheClear();
    cacheSet('exists', true);
    expect(cacheHas('exists')).toBe(true);
    expect(cacheHas('nope')).toBe(false);
  });

  it('should delete entries', () => {
    cacheClear();
    cacheSet('del-me', 'value');
    expect(cacheDelete('del-me')).toBe(true);
    expect(cacheGet('del-me')).toBeUndefined();
  });

  it('should track cache size', () => {
    cacheClear();
    expect(cacheSize()).toBe(0);
    cacheSet('a', 1);
    cacheSet('b', 2);
    expect(cacheSize()).toBe(2);
  });

  it('buildCacheKey should produce deterministic keys', () => {
    const key1 = buildCacheKey('themes', { period: '1mo', page: 1 });
    const key2 = buildCacheKey('themes', { page: 1, period: '1mo' });
    expect(key1).toBe(key2);
  });
});
