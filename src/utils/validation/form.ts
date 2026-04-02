/**
 * Form Field Validation
 *
 * Validation rules for individual form fields:
 * - Email validation with comprehensive checks
 * - Name validation
 * - Phone validation
 * - Date of birth validation
 * - Role validation
 */

import { ValidationResult } from './index';

/**
 * Email validation with comprehensive checks
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors, warnings };
  }

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  // Length validation
  if (email.length > 254) {
    errors.push('Email address is too long (maximum 254 characters)');
  }

  // Local part validation (before @)
  const localPart = email.split('@')[0];
  if (localPart && localPart.length > 64) {
    errors.push('Email local part is too long (maximum 64 characters)');
  }

  // Domain validation
  const domain = email.split('@')[1];
  if (domain) {
    if (domain.length > 253) {
      errors.push('Email domain is too long (maximum 253 characters)');
    }

    // Check for valid domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
      errors.push('Email domain format is invalid');
    }
  }

  // Common typo detection
  const typoSuggestions: { [key: string]: string } = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  if (domain && typoSuggestions[domain.toLowerCase()]) {
    warnings.push(`Did you mean ${typoSuggestions[domain.toLowerCase()]}?`);
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Name validation
 */
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name) {
    errors.push('Name is required');
    return { isValid: false, errors, warnings };
  }

  if (name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (name.length > 100) {
    errors.push('Name is too long (maximum 100 characters)');
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(name)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  // Check for excessive spaces or special characters
  if (name.includes('  ')) {
    warnings.push('Name contains multiple consecutive spaces');
  }

  if (name.startsWith(' ') || name.endsWith(' ')) {
    warnings.push('Name has leading or trailing spaces');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Phone validation
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!phone) {
    return { isValid: true, errors, warnings }; // Phone is optional
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    errors.push('Phone number must be at least 10 digits');
  }

  if (digitsOnly.length > 15) {
    errors.push('Phone number is too long (maximum 15 digits)');
  }

  // Check for valid phone format (international or local)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(digitsOnly)) {
    errors.push('Please enter a valid phone number');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Role validation
 */
export const validateRole = (role: string): ValidationResult => {
  const errors: string[] = [];
  const validRoles = ['admin', 'seller', 'customer'];

  if (!role) {
    errors.push('Role is required');
    return { isValid: false, errors };
  }

  if (!validRoles.includes(role.toLowerCase())) {
    errors.push('Invalid role. Must be admin, seller, or customer');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Date of birth validation
 */
export const validateDateOfBirth = (dateOfBirth: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!dateOfBirth) {
    return { isValid: true, errors, warnings }; // DOB is optional
  }

  const date = new Date(dateOfBirth);
  const now = new Date();

  if (isNaN(date.getTime())) {
    errors.push('Please enter a valid date');
    return { isValid: false, errors, warnings };
  }

  // Check if date is in the future
  if (date > now) {
    errors.push('Date of birth cannot be in the future');
  }

  // Check if person is too old (over 120 years)
  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 120);
  if (date < maxAge) {
    errors.push('Date of birth seems unrealistic (over 120 years ago)');
  }

  // Check if person is too young (under 13 years for COPPA compliance)
  const minAge = new Date();
  minAge.setFullYear(minAge.getFullYear() - 13);
  if (date > minAge) {
    warnings.push('User appears to be under 13 years old. Additional parental consent may be required.');
  }

  return { isValid: errors.length === 0, errors, warnings };
};
