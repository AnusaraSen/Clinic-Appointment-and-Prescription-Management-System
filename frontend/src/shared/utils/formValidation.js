/**
 * Form Validation Utilities
 * Reusable validators and helpers for real-time form validation
 */

/**
 * Debounce function - delays execution until user stops typing
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Field-level validators
 * Each returns null if valid, or error message string if invalid
 */
export const validators = {
  // Required field validator
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validator
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  // Phone validator (10 digits)
  phone: (value) => {
    if (!value) return 'Phone number is required';
    const phoneDigits = value.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return 'Phone number must be 10 digits';
    }
    return null;
  },

  // Phone optional (can be empty, but if provided must be valid)
  phoneOptional: (value) => {
    if (!value) return null;
    const phoneDigits = value.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return 'Phone number must be 10 digits';
    }
    return null;
  },

  // Password validator
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number';
    }
    return null;
  },

  // Password confirmation validator
  passwordConfirm: (value, password) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) {
      return 'Passwords do not match';
    }
    return null;
  },

  // Name validator (2-50 characters, letters and spaces only)
  name: (value, fieldName = 'Name') => {
    if (!value) return `${fieldName} is required`;
    if (value.length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (value.length > 50) {
      return `${fieldName} must not exceed 50 characters`;
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return `${fieldName} can only contain letters and spaces`;
    }
    return null;
  },

  // Serial number validator (alphanumeric, dashes, 5-30 chars)
  serialNumber: (value) => {
    if (!value) return 'Serial number is required';
    if (!/^[A-Z0-9-]+$/.test(value)) {
      return 'Serial number can only contain uppercase letters, numbers, and dashes';
    }
    if (value.length < 5 || value.length > 30) {
      return 'Serial number must be between 5-30 characters';
    }
    return null;
  },

  // Model number validator (alphanumeric, dashes, 3-30 chars)
  modelNumber: (value) => {
    if (!value) return 'Model number is required';
    if (!/^[A-Za-z0-9-]+$/.test(value)) {
      return 'Model number can only contain letters, numbers, and dashes';
    }
    if (value.length < 3 || value.length > 30) {
      return 'Model number must be between 3-30 characters';
    }
    return null;
  },

  // Date validator (not in future)
  pastDate: (value, fieldName = 'Date') => {
    if (!value) return `${fieldName} is required`;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      return `${fieldName} cannot be in the future`;
    }
    return null;
  },

  // Date validator (not in past)
  futureDate: (value, fieldName = 'Date') => {
    if (!value) return `${fieldName} is required`;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return `${fieldName} cannot be in the past`;
    }
    return null;
  },

  // Number range validator
  numberRange: (value, min, max, fieldName = 'Value') => {
    if (!value && value !== 0) return `${fieldName} is required`;
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a number`;
    }
    if (num < min || num > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  },

  // Positive number validator
  positiveNumber: (value, fieldName = 'Value') => {
    if (!value && value !== 0) return `${fieldName} is required`;
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a number`;
    }
    if (num < 0) {
      return `${fieldName} must be positive`;
    }
    return null;
  },

  // URL validator
  url: (value) => {
    if (!value) return null; // Optional field
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  // Employee ID validator (format: EMP-XXXX)
  employeeId: (value) => {
    if (!value) return 'Employee ID is required';
    if (!/^EMP-\d{4}$/.test(value)) {
      return 'Employee ID must be in format: EMP-XXXX';
    }
    return null;
  },

  // Text length validator
  textLength: (value, min, max, fieldName = 'Field') => {
    if (!value) return `${fieldName} is required`;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    if (value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },
};

/**
 * Password strength calculator
 * @param {string} password - Password to check
 * @returns {Object} - { strength: 'weak'|'medium'|'strong', score: 0-100, feedback: string }
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return { strength: 'none', score: 0, feedback: '' };
  }

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= 8) score += 20;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 10;

  // Complexity checks
  if (/[a-z]/.test(password)) score += 20;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score += 20;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
  else feedback.push('Add special characters');

  // Determine strength
  let strength = 'weak';
  if (score >= 80) strength = 'strong';
  else if (score >= 50) strength = 'medium';

  return {
    strength,
    score,
    feedback: feedback.join(', '),
  };
};

/**
 * Get color class for password strength
 * @param {string} strength - 'weak', 'medium', 'strong'
 * @returns {string} - Tailwind color class
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

/**
 * Format phone number as (XXX) XXX-XXXX
 * @param {string} value - Raw phone input
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (value) => {
  const phoneDigits = value.replace(/\D/g, '');
  if (phoneDigits.length === 0) return '';
  if (phoneDigits.length <= 3) return phoneDigits;
  if (phoneDigits.length <= 6) {
    return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`;
  }
  return `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
};

/**
 * Cross-field validation helper
 * @param {Object} formData - All form data
 * @param {Array} rules - Array of { fields: [field1, field2], validator: fn, message: string }
 * @returns {Object} - Errors object
 */
export const validateCrossFields = (formData, rules) => {
  const errors = {};
  rules.forEach(({ fields, validator, message }) => {
    const values = fields.map(field => formData[field]);
    if (!validator(...values)) {
      fields.forEach(field => {
        errors[field] = message;
      });
    }
  });
  return errors;
};

/**
 * Validate entire form
 * @param {Object} formData - Form data to validate
 * @param {Object} validationRules - { fieldName: validator | [validators] }
 * @returns {Object} - Errors object
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    
    // Handle array of validators
    if (Array.isArray(rules)) {
      for (const validator of rules) {
        const error = validator(value);
        if (error) {
          errors[fieldName] = error;
          break; // Stop at first error
        }
      }
    } else {
      // Single validator
      const error = rules(value);
      if (error) {
        errors[fieldName] = error;
      }
    }
  });
  
  return errors;
};
