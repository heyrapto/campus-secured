/**
 * Realtime validation utilities for Campus Shield Authentication
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  isCampus?: boolean;
  isStandardFormat?: boolean;
}

export interface PasswordChecks {
  minLength: boolean;    // At least 8 characters
  hasLetter: boolean;    // At least one letter (a-z or A-Z)
  hasNumber: boolean;    // At least one digit (0-9)
  hasSpecial: boolean;   // At least one symbol (!@#$%^&*...)
  hasUpper: boolean;     // At least one uppercase letter
  hasLower: boolean;     // At least one lowercase letter
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: 0 | 1 | 2 | 3; // 0: empty, 1: weak, 2: fair, 3: strong
  level: 'empty' | 'weak' | 'fair' | 'strong';
  checks: PasswordChecks;
  error?: string;
}

/**
 * Validate email address format and verify institutional campus domain
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required' };
  }

  // Standard RFC 5322 compliant regex for practical email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Enter a valid email address (e.g. name@domain.com)' };
  }

  // Campus institutional domain checks (e.g. futminna.edu.ng or any .edu.ng / .edu domain)
  const isCampus = /\.edu(\.[a-z]{2})?$/i.test(trimmed) || /futminna/i.test(trimmed);

  return {
    isValid: true,
    isCampus,
  };
}

/**
 * Validate Student ID format (FUTMINNA matric pattern: YYYY/X/XXXXX or university matric IDs)
 */
export function validateStudentId(studentId: string): ValidationResult {
  const trimmed = studentId.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Student ID is required' };
  }

  if (trimmed.length < 5) {
    return { isValid: false, error: 'Student ID must be at least 5 characters' };
  }

  if (trimmed.length > 25) {
    return { isValid: false, error: 'Student ID cannot exceed 25 characters' };
  }

  // Check for allowed characters (alphanumeric, forward slashes, hyphens)
  if (!/^[a-zA-Z0-9\/-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Only letters, numbers, and slashes are allowed' };
  }

  // University matric pattern: e.g. 2018/1/74921MS, 2021/1/12345, 2022/2/98765CS
  const standardPattern = /^\d{4}\/\d{1,2}\/[0-9a-zA-Z]{3,8}$/;
  const isStandard = standardPattern.test(trimmed);

  // If user has slashes but wrong pattern, give helpful formatting guidance
  if (trimmed.includes('/') && !isStandard) {
    return {
      isValid: false,
      error: 'Format should match: YYYY/X/XXXX (e.g. 2018/1/74921MS)',
      isStandardFormat: false,
    };
  }

  return {
    isValid: true,
    isStandardFormat: isStandard,
  };
}

/**
 * Real-time password evaluation for registration (length, complexity, strength score)
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      level: 'empty',
      checks: {
        minLength: false,
        hasLetter: false,
        hasNumber: false,
        hasSpecial: false,
        hasUpper: false,
        hasLower: false,
      },
      error: 'Password is required',
    };
  }

  const checks: PasswordChecks = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
  };

  const requiredPassed = checks.minLength && checks.hasLetter && checks.hasNumber;

  let score: 0 | 1 | 2 | 3 = 1;
  let level: 'empty' | 'weak' | 'fair' | 'strong' = 'weak';
  let error: string | undefined;

  if (!checks.minLength) {
    error = `Password must be at least 8 characters (${password.length}/8)`;
  } else if (!checks.hasLetter) {
    error = 'Password must include at least one letter';
  } else if (!checks.hasNumber) {
    error = 'Password must include at least one number';
  } else if (requiredPassed) {
    const isStrong = (checks.hasUpper && checks.hasLower && checks.hasSpecial) || (password.length >= 12 && checks.hasSpecial);
    if (isStrong) {
      score = 3;
      level = 'strong';
    } else {
      score = 2;
      level = 'fair';
    }
  }

  return {
    isValid: requiredPassed,
    score,
    level,
    checks,
    error,
  };
}

/**
 * Validate password for login (simplified check)
 */
export function validateLoginPassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  return { isValid: true };
}

/**
 * Validate Full Name
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s'-.]+$/.test(trimmed)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }
  return { isValid: true };
}

/**
 * Validate WhatsApp/Phone Number (Nigerian international format or standard format)
 */
export function validatePhone(phone: string, required = true): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    if (!required) return { isValid: true };
    return { isValid: false, error: 'Phone number is required' };
  }

  // Strip spaces, dashes, parentheses
  const digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, '');

  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, error: 'Phone number must contain only digits' };
  }

  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number is too short (min 10 digits)' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long (max 15 digits)' };
  }

  return { isValid: true };
}
