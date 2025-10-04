const bcrypt = require('bcrypt');

/**
 * Password Utilities - Secure password handling! 🔐
 * 
 * Handles password hashing, validation, and security requirements
 * Requirements: 6+ chars, 1 letter, 1 number, 1 special char
 */

// Password validation regex - at least 6 chars, 1 letter, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{6,}$/;

const SALT_ROUNDS = 12; // Higher rounds = more security but slower

/**
 * Validate password format
 * @param {string} password - The password to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
const validatePasswordFormat = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter, one number, and one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'
    };
  }

  return {
    isValid: true,
    message: 'Password format is valid'
  };
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  try {
    // First validate the password format
    const validation = validatePasswordFormat(password);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('🔐 Password hashed successfully');
    return hashedPassword;
  } catch (error) {
    console.error('❌ Error hashing password:', error.message);
    throw error;
  }
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>} - True if password matches
 */
const comparePassword = async (password, hash) => {
  try {
    if (!password || !hash) {
      return false;
    }

    const isMatch = await bcrypt.compare(password, hash);
    console.log('🔐 Password comparison:', isMatch ? 'Match' : 'No match');
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing password:', error.message);
    return false;
  }
};

/**
 * Generate a temporary password for new users
 * @returns {string} - Temporary password that meets requirements
 */
const generateTempPassword = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%&*';
  
  // Ensure at least one of each required type
  let password = '';
  password += letters[Math.floor(Math.random() * letters.length)]; // 1 letter
  password += numbers[Math.floor(Math.random() * numbers.length)]; // 1 number
  password += specialChars[Math.floor(Math.random() * specialChars.length)]; // 1 special
  
  // Add random characters to make it 8 characters total
  const allChars = letters + letters.toUpperCase() + numbers + specialChars;
  for (let i = 3; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

module.exports = {
  validatePasswordFormat,
  hashPassword,
  comparePassword,
  generateTempPassword,
  PASSWORD_REGEX
};
