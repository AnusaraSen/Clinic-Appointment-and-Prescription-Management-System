/**
 * Register Component
 * Patient registration form
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import '../../../styles/glassmorphism.css';

const RegisterForm = ({ onSuccess }) => {
  const { registerPatient, error, isLoading, clearError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear errors when user starts typing
    if (formError) setFormError('');
    if (error) clearError();
  };

  /**
   * Calculate password strength
   */
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 4);
  };

  /**
   * Get password strength text and color
   */
  const getPasswordStrengthInfo = () => {
    const strengthLevels = [
      { text: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-600' },
      { text: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' },
      { text: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
      { text: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' },
      { text: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' }
    ];
    
    return strengthLevels[passwordStrength] || strengthLevels[0];
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    const validation = validateForm();
    if (!validation.isValid) {
      setFormError(validation.message);
      return;
    }

    try {
      // Prepare user data
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        address: Object.keys(formData.address).some(key => formData.address[key]) 
          ? formData.address 
          : undefined
      };

      const result = await registerPatient(userData);
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result.user);
        }
      } else {
        setFormError(result.message || 'Registration failed');
      }
    } catch (err) {
      setFormError('Registration failed. Please try again.');
    }
  };

  /**
   * Form validation
   */
  const validateForm = () => {
    // Required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return { isValid: false, message: 'Please fill in all required fields' };
    }

    // Email validation
    if (!isValidEmail(formData.email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    // Password validation
    if (formData.password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      return { isValid: false, message: 'Password must contain at least one letter, one number, and one special character' };
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      return { isValid: false, message: 'Passwords do not match' };
    }

    // Phone validation (optional)
    if (formData.phone && !/^[0-9]{10,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      return { isValid: false, message: 'Please enter a valid phone number' };
    }

    return { isValid: true };
  };

  /**
   * Email validation helper
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const displayError = formError || error;
  const strengthInfo = getPasswordStrengthInfo();

  return (
    <div className="glass-wrapper glass-wrapper-wide">
      {/* Header */}
      <div className="text-center" style={{ marginBottom: '20px' }}>
        <h2 className="glass-title">Register</h2>
        <p className="glass-subtitle">Create your account to get started</p>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="glass-alert glass-alert-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit}>
        {/* Name Fields */}
        <div className="glass-form-grid">
          <div className="glass-input-field">
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name *"
              className="glass-input"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="glass-input-field">
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name *"
              className="glass-input"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="glass-input-field glass-full-width">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email Address *"
            className="glass-input"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="glass-input-field glass-full-width">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Password *"
            className="glass-input"
            value={formData.password}
            onChange={handleChange}
            style={{ paddingRight: '45px' }}
            required
            disabled={isLoading}
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="glass-password-strength" style={{ marginTop: '10px' }}>
              <div
                className="glass-password-strength-bar"
                style={{ 
                  width: `${(passwordStrength / 6) * 100}%`,
                  height: '4px',
                  borderRadius: '2px',
                  background: passwordStrength <= 2 ? 'rgba(239, 68, 68, 0.8)' : passwordStrength <= 4 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(16, 185, 129, 0.8)',
                  transition: 'all 0.3s ease'
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="glass-input-field glass-full-width">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm Password *"
            className="glass-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ paddingRight: '45px' }}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="glass-password-toggle"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.9)', display: 'flex', alignItems: 'center' }}>
              <AlertCircle className="w-3 h-3" style={{ marginRight: '4px' }} />
              Passwords do not match
            </div>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'rgba(16, 185, 129, 0.9)', display: 'flex', alignItems: 'center' }}>
              <CheckCircle className="w-3 h-3" style={{ marginRight: '4px' }} />
              Passwords match
            </div>
          )}
        </div>

        {/* Optional Fields */}
        <div className="glass-form-grid">
          <div className="glass-input-field">
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Phone Number"
              className="glass-input"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="glass-input-field">
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              className="glass-input"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Address Section */}
        <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff', marginBottom: '15px', display: 'flex', alignItems: 'center', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
            <MapPin className="w-5 h-5" style={{ marginRight: '8px' }} />
            Address (Optional)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="glass-input-field glass-full-width">
              <input
                type="text"
                name="address.street"
                placeholder="Street Address"
                className="glass-input"
                value={formData.address.street}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="glass-form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="glass-input-field">
                <input
                  type="text"
                  name="address.city"
                  placeholder="City"
                  className="glass-input"
                  value={formData.address.city}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="glass-input-field">
                <input
                  type="text"
                  name="address.state"
                  placeholder="State/Province"
                  className="glass-input"
                  value={formData.address.state}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="glass-input-field">
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="Zip Code"
                  className="glass-input"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="glass-input-field">
                <input
                  type="text"
                  name="address.country"
                  placeholder="Country"
                  className="glass-input"
                  value={formData.address.country}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="glass-button-primary"
        >
          {isLoading ? (
            <>
              <span className="glass-spinner"></span>
              <span className="ml-2">Creating account...</span>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Link to Login */}
      <div className="glass-toggle-section">
        <p>
          Already have an account?{' '}
          <Link
            to="/login"
            className="glass-link"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
