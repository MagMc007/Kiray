/**
 * Ethiopian phone number validation and normalization utilities.
 * Enforces digit count according to Ethiopian telecom standards:
 * Standard format: +251 followed by 9 digits (total 12 digits), e.g. +251966204556.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
}

export function validateEthiopianPhone(
  value: string | undefined | null,
  options: { required?: boolean; fieldName?: string } = {}
): PhoneValidationResult {
  const { required = false, fieldName = 'Phone number' } = options;
  const trimmed = value ? value.trim() : '';

  if (!trimmed) {
    if (required) {
      return {
        isValid: false,
        normalized: '',
        error: `${fieldName} is required.`,
      };
    }
    return { isValid: true, normalized: '' };
  }

  // Extract all digit characters
  const digitsOnly = trimmed.replace(/\D/g, '');

  // Case 1: Prefixed with country code 251 (e.g. +251966204556 or 251966204556)
  if (digitsOnly.startsWith('251')) {
    const localDigits = digitsOnly.slice(3);
    if (localDigits.length !== 9) {
      return {
        isValid: false,
        normalized: trimmed,
        error: `${fieldName} must have exactly 9 digits after +251 (found ${localDigits.length}). Format: +251966204556`,
      };
    }
    return { isValid: true, normalized: `+251${localDigits}` };
  }

  // Case 2: Local format starting with 0 (e.g. 0966204556 or 0712345678)
  if (digitsOnly.startsWith('0')) {
    const localDigits = digitsOnly.slice(1);
    if (localDigits.length !== 9) {
      return {
        isValid: false,
        normalized: trimmed,
        error: `${fieldName} must have 10 digits when starting with 0 (found ${digitsOnly.length}). Format: +251966204556`,
      };
    }
    return { isValid: true, normalized: `+251${localDigits}` };
  }

  // Case 3: 9 local digits without leading 0 or +251 (e.g. 966204556)
  if (digitsOnly.length === 9) {
    return { isValid: true, normalized: `+251${digitsOnly}` };
  }

  // Otherwise: invalid digit count
  return {
    isValid: false,
    normalized: trimmed,
    error: `${fieldName} must have 9 digits after +251 (total 12 digits, e.g. +251966204556). Found ${digitsOnly.length} digits.`,
  };
}
