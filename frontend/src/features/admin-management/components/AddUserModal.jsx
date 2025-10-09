import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Lock, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';

/**
 * AddUserModal - Create new user accounts
 * Professional user creation form with validation and role management
 */
export const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  useHideNavbar(isOpen);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Patient',
    department: '',
    phone: '',
    specialization: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  // Available roles for selection (matching backend User model)
  const roles = [
    { value: 'Admin', label: 'Administrator', description: 'Full system access and management' },
    { value: 'Doctor', label: 'Doctor', description: 'Medical professional with patient access' },
    { value: 'Pharmacist', label: 'Pharmacist', description: 'Pharmacy and medication management' },
    { value: 'LabStaff', label: 'Lab Staff', description: 'Laboratory operations and testing' },
    { value: 'LabSupervisor', label: 'Lab Supervisor', description: 'Laboratory management and oversight' },
    { value: 'Technician', label: 'Technician', description: 'Equipment maintenance and repair' },
    { value: 'InventoryManager', label: 'Inventory Manager', description: 'Stock and supply management' },
    { value: 'Patient', label: 'Patient', description: 'Registered patient with appointment access' }
  ];

  // Don't render if modal is closed
  if (!isOpen) return null;

  /**
   * Handle input changes with validation
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Department validation for certain roles
    if (['Doctor', 'LabStaff', 'LabSupervisor', 'Technician'].includes(formData.role) && !formData.department.trim()) {
      newErrors.department = 'Department is required for this role';
    }

    return newErrors;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      console.log('🔄 Creating user with data:', {
        ...formData,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });

      // Prepare user data (exclude confirmPassword)
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        department: formData.department.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization.trim()
      };

      // Try candidate API endpoints (works with dev proxy or direct backend)
      const candidateUrls = ['/api/users', 'http://localhost:5000/api/users'];
      let response = null;
      let lastError = null;

      for (const url of candidateUrls) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
          });

          // If we got a non-404 (or any response), stop trying further
          if (response && response.status !== 404) break;
        } catch (err) {
          lastError = err;
          // Network-level error (e.g., backend not running at that host); try next
        }
      }

      if (!response) {
        throw new Error('No response from API endpoints' + (lastError ? `: ${lastError.message}` : ''));
      }

      console.log('📡 API Response status:', response.status);

      // Guard against empty/non-JSON responses (some 404 handlers return empty body)
      let result = null;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : null;
      } catch (err) {
        console.warn('⚠️ Failed to parse JSON response:', err);
        result = null;
      }
      console.log('📡 API Response data:', result);

      if (response.ok && result && result.success) {
        console.log('✅ User created successfully:', result.data);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'Staff',
          department: '',
          phone: '',
          specialization: ''
        });
        setErrors({});
        
        // Call success callback and close modal
        if (onSuccess) onSuccess(result.data);
        onClose();
      } else {
        console.error('❌ User creation failed:', result || response.statusText || response.status);

        // Build a user-friendly error list from possible server formats
        const errors = [];

        if (result) {
          // Common patterns: result.message, result.error, result.errors (Mongoose ValidationError)
          if (result.message && typeof result.message === 'string') {
            errors.push(result.message);
          }

          if (result.error) {
            if (typeof result.error === 'string') {
              errors.push(result.error);
            } else if (typeof result.error === 'object') {
              // If error.message exists inside
              if (result.error.message) errors.push(result.error.message);
            }
          }

          // Mongoose validation errors sometimes come as result.error or result.errors object
          const maybeValidation = result.error || result.errors || result;
          if (maybeValidation && typeof maybeValidation === 'object') {
            // If it has 'errors' sub-object
            if (maybeValidation.errors && typeof maybeValidation.errors === 'object') {
              Object.values(maybeValidation.errors).forEach(errObj => {
                if (errObj && errObj.message) errors.push(errObj.message);
              });
            }
          }
        }

        // Fallback to HTTP status text/code
        if (errors.length === 0) {
          const fallback = response.statusText || `Error ${response.status}`;
          errors.push(fallback);
        }

        setApiError(errors.length === 1 ? errors[0] : errors);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get role description
   */
  const getRoleDescription = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.description : '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add New User
              </h2>
              <p className="text-sm text-gray-500">
                Create a new user account for the clinic system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          User Creation Failed
                        </h3>
                        {Array.isArray(apiError) ? (
                          <ul className="mt-1 text-sm text-red-700 list-disc list-inside space-y-1">
                            {apiError.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-1 text-sm text-red-700">{apiError}</p>
                        )}
                      </div>
              </div>
            </div>
          )}

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </h3>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Role and Access Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Role and Access
            </h3>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {formData.role && (
                <p className="mt-1 text-sm text-gray-600">
                  {getRoleDescription(formData.role)}
                </p>
              )}
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Department Field */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department {['Doctor', 'Nurse', 'Technician'].includes(formData.role) && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Cardiology, Emergency, IT"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            {/* Specialization Field */}
            {formData.role === 'Technician' && (
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Electrical, Mechanical, IT Systems"
                />
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Security
            </h3>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating User...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create User
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddUserModal;