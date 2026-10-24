/**
 * Realtime validation utilities for Campus Shield Authentication
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
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
  message?: string;
}

/**
 * Validate email address format and verify institutional campus domain
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Email address is required' };
  }

  // Standard RFC 5322 compliant regex for practical email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Enter a valid email address (e.g. name@domain.com)' };
  }

  // Campus institutional domain checks (e.g. futminna.edu.ng or any .edu.ng / .edu domain)
  const isCampus = /\.edu(\.[a-z]{2})?$/i.test(trimmed) || /futminna/i.test(trimmed);

  return {
    isValid: true,
    message: isCampus ? 'Verified institutional email' : 'Valid email format',
    isCampus,
  };
}

/**
 * Validate Student ID format (FUTMINNA matric pattern: YYYY/X/XXXXX or university matric IDs)
 */
export function validateStudentId(studentId: string): ValidationResult {
  const trimmed = studentId.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Student ID is required' };
  }

  if (trimmed.length < 5) {
    return { isValid: false, message: 'Student ID must be at least 5 characters' };
  }

  if (trimmed.length > 25) {
    return { isValid: false, message: 'Student ID cannot exceed 25 characters' };
  }

  // Check for allowed characters (alphanumeric, forward slashes, hyphens)
  if (!/^[a-zA-Z0-9\/-]+$/.test(trimmed)) {
    return { isValid: false, message: 'Only letters, numbers, and slashes are allowed' };
  }

  // University matric pattern: e.g. 2018/1/74921MS, 2021/1/12345, 2022/2/98765CS
  const standardPattern = /^\d{4}\/\d{1,2}\/[0-9a-zA-Z]{3,8}$/;
  const isStandard = standardPattern.test(trimmed);

  // If user has slashes but wrong pattern, give helpful formatting guidance
  if (trimmed.includes('/') && !isStandard) {
    return {
      isValid: false,
      message: 'Format should match: YYYY/X/XXXX (e.g. 2018/1/74921MS)',
      isStandardFormat: false,
    };
  }

  return {
    isValid: true,
    message: isStandard ? 'Valid campus matric ID' : 'Valid student ID',
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
      message: 'Password is required',
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

  // Determine criteria satisfaction
  const requiredPassed = checks.minLength && checks.hasLetter && checks.hasNumber;

  let score: 0 | 1 | 2 | 3 = 1;
  let level: 'empty' | 'weak' | 'fair' | 'strong' = 'weak';
  let message = 'Weak: needs 8+ characters, letters & numbers';

  if (!checks.minLength) {
    message = `Too short: ${password.length}/8 characters`;
  } else if (!checks.hasLetter) {
    message = 'Must include at least one letter';
  } else if (!checks.hasNumber) {
    message = 'Must include at least one number';
  } else if (requiredPassed) {
    const isStrong = (checks.hasUpper && checks.hasLower && checks.hasSpecial) || (password.length >= 12 && checks.hasSpecial);
    if (isStrong) {
      score = 3;
      level = 'strong';
      message = 'Strong security level';
    } else {
      score = 2;
      level = 'fair';
      message = 'Fair: add symbols or mixed case for stronger security';
    }
  }

  return {
    isValid: requiredPassed,
    score,
    level,
    checks,
    message,
  };
}

/**
 * Validate password for login (simplified check)
 */
export function validateLoginPassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true };
}

/**
 * Validate Full Name
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Full name is required' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s'-.]+$/.test(trimmed)) {
    return { isValid: false, message: 'Name contains invalid characters' };
  }
  return { isValid: true, message: 'Valid name' };
}

/**
 * Validate WhatsApp/Phone Number (Nigerian international format or standard format)
 */
export function validatePhone(phone: string, required = true): ValidationResult {
  const trimmed = phone.trim();
  if (!trimmed) {
    if (!required) return { isValid: true };
    return { isValid: false, message: 'Phone number is required' };
  }

  // Strip spaces, dashes, parentheses
  const digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, '');

  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, message: 'Phone number must contain only digits' };
  }

  if (digitsOnly.length < 10) {
    return { isValid: false, message: 'Phone number is too short (min 10 digits)' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, message: 'Phone number is too long (max 15 digits)' };
  }

  // Nigerian number detection (e.g. 2348..., 08..., 07..., 09...)
  const isNigerian = digitsOnly.startsWith('234') || (digitsOnly.length === 11 && digitsOnly.startsWith('0'));

  return {
    isValid: true,
    message: isNigerian ? 'Valid Nigerian mobile format' : 'Valid phone format',
  };
}
