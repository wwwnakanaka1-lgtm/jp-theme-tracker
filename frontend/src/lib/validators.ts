/**
 * Input validation utilities for forms and user inputs.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate a Japanese stock code (4-digit number, optionally with .T suffix). */
export function validateStockCode(code: string): ValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return { valid: false, error: '銘柄コードを入力してください' };
  }
  const pattern = /^\d{4}(\.T)?$/;
  if (!pattern.test(trimmed)) {
    return { valid: false, error: '4桁の数字で入力してください（例: 7203）' };
  }
  return { valid: true };
}

/** Validate a price input. Must be a positive number. */
export function validatePrice(value: string): ValidationResult {
  if (!value.trim()) {
    return { valid: false, error: '価格を入力してください' };
  }
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: '有効な数値を入力してください' };
  }
  if (num <= 0) {
    return { valid: false, error: '価格は正の数で入力してください' };
  }
  if (num > 100_000_000) {
    return { valid: false, error: '価格が大きすぎます' };
  }
  return { valid: true };
}

/** Validate an email address. */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, error: 'メールアドレスを入力してください' };
  }
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(trimmed)) {
    return { valid: false, error: '有効なメールアドレスを入力してください' };
  }
  return { valid: true };
}

/** Validate a required text field. */
export function validateRequired(value: string, fieldName: string = 'この項目'): ValidationResult {
  if (!value.trim()) {
    return { valid: false, error: `${fieldName}を入力してください` };
  }
  return { valid: true };
}

/** Validate string length within bounds. */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = 'この項目',
): ValidationResult {
  const len = value.trim().length;
  if (len < min) {
    return { valid: false, error: `${fieldName}は${min}文字以上で入力してください` };
  }
  if (len > max) {
    return { valid: false, error: `${fieldName}は${max}文字以内で入力してください` };
  }
  return { valid: true };
}

/** Validate a numeric range. */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = '値',
): ValidationResult {
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName}は数値で入力してください` };
  }
  if (value < min || value > max) {
    return { valid: false, error: `${fieldName}は${min}〜${max}の範囲で入力してください` };
  }
  return { valid: true };
}

/** Compose multiple validators and return the first failure, or success. */
export function composeValidators(
  ...validators: (() => ValidationResult)[]
): ValidationResult {
  for (const validate of validators) {
    const result = validate();
    if (!result.valid) return result;
  }
  return { valid: true };
}
