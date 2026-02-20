// utils/validators.js
// Utility functions for form validation

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a password meets minimum requirements
 * @param {string} password - The password to validate
 * @param {Object} options - Options for validation
 * @param {number} options.minLength - Minimum password length (default: 8)
 * @param {boolean} options.requireNumbers - Whether numbers are required (default: true)
 * @param {boolean} options.requireSpecialChars - Whether special characters are required (default: true)
 * @returns {Object} - Result with isValid and message properties
 */
export const validatePassword = (password, options = {}) => {
  const config = {
    minLength: options.minLength || 8,
    requireNumbers: options.requireNumbers !== false,
    requireSpecialChars: options.requireSpecialChars !== false
  };
  
  if (!password || password.length < config.minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${config.minLength} characters long`
    };
  }
  
  if (config.requireNumbers && !/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates an ID (assuming it's a numeric ID)
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
export const isValidId = (id) => {
  return id && id.trim() !== '' && /^\d+$/.test(id);
};

/**
 * Validates a form against a schema
 * @param {Object} form - The form data to validate
 * @param {Object} schema - The validation schema
 * @returns {Object} - Result with isValid, errors and firstError properties
 */
export const validateForm = (form, schema) => {
  const errors = {};
  let isValid = true;
  
  for (const field in schema) {
    const value = form[field];
    const rules = schema[field];
    
    // Check required rule
    if (rules.required && (!value || value === '')) {
      errors[field] = rules.requiredMessage || 'This field is required';
      isValid = false;
      continue;
    }
    
    // Skip additional validation if field is empty and not required
    if (!value && !rules.required) {
      continue;
    }
    
    // Check custom validator function
    if (rules.validator && typeof rules.validator === 'function') {
      const validatorResult = rules.validator(value, form);
      if (typeof validatorResult === 'object') {
        if (!validatorResult.isValid) {
          errors[field] = validatorResult.message;
          isValid = false;
        }
      } else if (!validatorResult) {
        errors[field] = rules.message || 'Invalid value';
        isValid = false;
      }
    }
  }
  
  return {
    isValid,
    errors,
    firstError: Object.values(errors)[0] || null
  };
};

/**
 * Example schema for teacher registration form
 */
export const teacherRegistrationSchema = {
  username: {
    required: true,
    requiredMessage: 'Username is required'
  },
  id: {
    required: true,
    requiredMessage: 'ID is required',
    validator: isValidId,
    message: 'ID must contain only numbers'
  },
  email: {
    required: true,
    requiredMessage: 'Email is required',
    validator: isValidEmail,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    requiredMessage: 'Password is required',
    validator: (value) => validatePassword(value),
  },
  subject: {
    required: false
  }
};