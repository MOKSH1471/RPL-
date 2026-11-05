/**
 * Password Policy Enforcement Utility
 * Requires:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character
 */

const COMMON_DISALLOWED_PASSWORDS = new Set([
  'admin@rpl2026',
  'scorer@rpl2026',
  'password123',
  'password1234',
  'admin123456',
  '12345678',
  'qwerty1234',
]);

export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }

  const clean = password.trim();

  if (clean.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (COMMON_DISALLOWED_PASSWORDS.has(clean.toLowerCase())) {
    return { valid: false, message: 'This password is too common or a default. Please choose a unique, secure password.' };
  }

  if (!/[A-Z]/.test(clean)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }

  if (!/[a-z]/.test(clean)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }

  if (!/[0-9]/.test(clean)) {
    return { valid: false, message: 'Password must contain at least one number (0-9).' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(clean)) {
    return { valid: false, message: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
  }

  return { valid: true };
}

