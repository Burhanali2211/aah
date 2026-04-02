/**
 * Password Validation
 *
 * Password strength validation with character variety checks
 * and detection of common weak patterns
 */

import { ValidationResult } from './index';

/**
 * Password strength validation
 * Checks length, character variety, and common patterns
 */
export const validatePasswordStrength = (password: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, warnings };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password is too long (maximum 128 characters)');
  }

  // Check for character variety
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasLowercase) {
    warnings.push('Password should include lowercase letters');
  }

  if (!hasUppercase) {
    warnings.push('Password should include uppercase letters');
  }

  if (!hasNumbers) {
    warnings.push('Password should include numbers');
  }

  if (!hasSpecialChars) {
    warnings.push('Password should include special characters');
  }

  // Check for common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      warnings.push('Password contains common patterns that are easy to guess');
      break;
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};
