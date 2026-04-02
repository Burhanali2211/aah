/**
 * User Validation
 *
 * Comprehensive user object validation combining multiple field validations
 */

import { ValidationResult, UserValidationData } from './index';
import {
  validateEmail,
  validateName,
  validateRole,
  validatePhone,
  validateDateOfBirth
} from './form';

/**
 * Comprehensive user validation
 * Validates all fields of a user object and collects errors/warnings
 */
export const validateUser = (userData: UserValidationData): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate each field
  const emailResult = validateEmail(userData.email);
  const nameResult = validateName(userData.name);
  const roleResult = validateRole(userData.role);
  const phoneResult = validatePhone(userData.phone || '');
  const dobResult = validateDateOfBirth(userData.dateOfBirth || '');

  // Collect all errors and warnings
  allErrors.push(...emailResult.errors);
  allErrors.push(...nameResult.errors);
  allErrors.push(...roleResult.errors);
  allErrors.push(...phoneResult.errors);
  allErrors.push(...dobResult.errors);

  allWarnings.push(...(emailResult.warnings || []));
  allWarnings.push(...(nameResult.warnings || []));
  allWarnings.push(...(phoneResult.warnings || []));
  allWarnings.push(...(dobResult.warnings || []));

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};
