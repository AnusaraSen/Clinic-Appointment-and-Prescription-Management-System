/**
 * Login Component - Glassmorphism Design
 * User authentication form with real-time validation
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, CheckCircle, X } from 'lucide-react';
import '../../../styles/glassmorphism.css';

const LoginForm = ({ onSuccess }) => {
  const { login, error, isLoading, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false
  });

  /**
   * Real-time field validation
   */
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!isValidEmail(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  /**
   * Handle input changes with real-time validation
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation if field has been touched
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
    
    // Clear form errors when user starts typing
    if (formError) setFormError('');
    if (error) clearError();
  };

  /**
   * Handle field blur for validation
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      const result = await login(formData);
      
      if (result.success) {
        // Login successful
        if (onSuccess) {
          onSuccess(result.user);
        }
      } else {
        setFormError(result.message || 'Login failed');
      }
    } catch (err) {
      setFormError('Login failed. Please try again.');
    }
  };

  /**
   * Email validation helper
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Demo login helper
   */
  const handleDemoLogin = async (userType) => {
    const demoCredentials = {
      admin: { email: 'nimal.admin@example.com', password: '4TLRT!hD' },
      patient: { email: 'johndoe@example.com', password: 'TempPass123!' },
      doctor: { email: 'sarah.perera@example.com', password: 'Uj&07w@q' }
    };

    const credentials = demoCredentials[userType];
    if (credentials) {
      setFormData(credentials);
      // Auto-submit after setting credentials
      setTimeout(() => {
        login(credentials).then(result => {
          if (result.success && onSuccess) {
            onSuccess(result.user);
          }
        });
      }, 100);
    }
  };

  const displayError = formError || error;

  return (
    <div className="glass-wrapper" style={{ maxWidth: '400px', padding: '40px 35px' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="glass-title" style={{ fontSize: '2rem', marginBottom: '30px' }}>Login</h2>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="glass-alert glass-alert-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="glass-input-field">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className="glass-input"
            placeholder="Enter your email"
            disabled={isLoading}
            style={{ paddingLeft: '0' }}
          />
          {touchedFields.email && fieldErrors.email && (
            <span className="glass-error-message">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.email}
            </span>
          )}
        </div>

        {/* Password Input */}
        <div className="glass-input-field">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className="glass-input"
            placeholder="Enter your password"
            disabled={isLoading}
            style={{ paddingLeft: '0', paddingRight: '35px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="glass-password-toggle"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          {touchedFields.password && fieldErrors.password && (
            <span className="glass-error-message">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.password}
            </span>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="glass-remember">
          <label className="glass-checkbox-label">
            <input type="checkbox" className="glass-checkbox" id="remember" />
            <span>Remember me</span>
          </label>
          <a href="#" className="glass-link">Forgot password?</a>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="glass-button-primary"
        >
          {isLoading ? (
            <>
              <span className="glass-spinner"></span>
              <span className="ml-2">Signing in...</span>
            </>
          ) : (
            'Log In'
          )}
        </button>
      </form>

      {/* Link to Register */}
      <div className="glass-toggle-section">
        <p>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="glass-link"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
