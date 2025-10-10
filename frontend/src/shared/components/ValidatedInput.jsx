/**
 * ValidatedInput Component
 * Reusable input with real-time validation and visual feedback
 */
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const ValidatedInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  placeholder = '',
  disabled = false,
  className = '',
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  helpText = '',
  maxLength,
  autoComplete,
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={`
            w-full px-3 py-2 border rounded-lg
            ${showPasswordToggle || (touched && value) ? 'pr-10' : 'pr-3'}
            ${hasError 
              ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
              : isValid
              ? 'border-green-500 bg-green-50 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
        />

        {/* Validation Icons or Password Toggle */}
        {showPasswordToggle ? (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        ) : touched && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="flex items-start gap-1 mt-1 text-red-600 text-xs animate-slideDown">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

/**
 * ValidatedTextarea Component
 * Reusable textarea with real-time validation and visual feedback
 */
export const ValidatedTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  placeholder = '',
  disabled = false,
  className = '',
  rows = 4,
  maxLength,
  helpText = '',
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border rounded-lg
            ${hasError 
              ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
              : isValid
              ? 'border-green-500 bg-green-50 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
            resize-none
          `}
        />

        {/* Character Count */}
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="flex items-start gap-1 mt-1 text-red-600 text-xs animate-slideDown">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

/**
 * ValidatedSelect Component
 * Reusable select dropdown with real-time validation and visual feedback
 */
export const ValidatedSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  className = '',
  options = [],
  placeholder = 'Select...',
  helpText = '',
  children,
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg pr-10
            ${hasError 
              ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
              : isValid
              ? 'border-green-500 bg-green-50 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:ring-2 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
        >
          {/* Use children if provided, otherwise use options prop */}
          {children ? children : (
            <>
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </>
          )}
        </select>

        {/* Validation Icon */}
        {touched && value && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="flex items-start gap-1 mt-1 text-red-600 text-xs animate-slideDown">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

/**
 * PasswordStrengthMeter Component
 * Visual indicator for password strength
 */
export const PasswordStrengthMeter = ({ password, strength }) => {
  if (!password) return null;

  const getStrengthColor = () => {
    switch (strength.strength) {
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

  const getStrengthText = () => {
    switch (strength.strength) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <div className="mt-2">
      {/* Strength Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      
      {/* Strength Text and Feedback */}
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs font-medium ${
          strength.strength === 'weak' ? 'text-red-600' :
          strength.strength === 'medium' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {getStrengthText()}
        </span>
        {strength.feedback && (
          <span className="text-xs text-gray-500">{strength.feedback}</span>
        )}
      </div>
    </div>
  );
};
