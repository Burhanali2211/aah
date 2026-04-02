/**
 * Validation Utilities (Deprecated)
 *
 * For backward compatibility, this file now re-exports from the reorganized validation module.
 * New code should import directly from './validation' folder
 *
 * The validation utilities have been split into domain-specific files:
 * - validation/form.ts: Form field validation (email, name, phone, date, role)
 * - validation/user.ts: Comprehensive user object validation
 * - validation/password.ts: Password strength validation
 * - validation/security.ts: Input sanitization and rate limiting
 */

// Re-export everything from the new validation module
export type { ValidationResult, UserValidationData } from './validation/index';

export {
  // Form validation
  validateEmail,
  validateName,
  validatePhone,
  validateDateOfBirth,
  validateRole,
  // User validation
  validateUser,
  // Password validation
  validatePasswordStrength,
  // Security utilities
  sanitizeInput,
  createRateLimiter,
  userCreationLimiter,
  emailSendLimiter
} from './validation/index';
