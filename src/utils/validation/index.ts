/**
 * Unified Validation Module
 *
 * Re-exports all validation utilities organized by domain:
 * - form.ts: Form field validation (email, name, phone, date)
 * - user.ts: User object validation
 * - password.ts: Password strength validation
 * - security.ts: Security utilities (sanitization, rate limiting)
 */

// Core validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface UserValidationData {
  email: string;
  name: string;
  role: string;
  phone?: string;
  dateOfBirth?: string;
}

// Form validation exports
export {
  validateEmail,
  validateName,
  validatePhone,
  validateDateOfBirth,
  validateRole
} from './form';

// User validation exports
export { validateUser } from './user';

// Password validation exports
export { validatePasswordStrength } from './password';

// Security utilities exports
export {
  sanitizeInput,
  createRateLimiter,
  userCreationLimiter,
  emailSendLimiter
} from './security';

// Default exports for backward compatibility
export default {
  validateEmail: (email: string) => import('./form').then(m => m.validateEmail(email)),
  validateName: (name: string) => import('./form').then(m => m.validateName(name)),
  validatePhone: (phone: string) => import('./form').then(m => m.validatePhone(phone)),
  validateDateOfBirth: (dob: string) => import('./form').then(m => m.validateDateOfBirth(dob)),
  validateRole: (role: string) => import('./form').then(m => m.validateRole(role)),
  validateUser: (userData: UserValidationData) => import('./user').then(m => m.validateUser(userData)),
  validatePasswordStrength: (password: string) => import('./password').then(m => m.validatePasswordStrength(password)),
  sanitizeInput: (input: string) => import('./security').then(m => m.sanitizeInput(input)),
  createRateLimiter: (maxRequests: number, windowMs: number) => import('./security').then(m => m.createRateLimiter(maxRequests, windowMs))
};
