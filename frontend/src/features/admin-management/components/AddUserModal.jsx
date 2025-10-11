import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Lock, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';
import { ValidatedInput, ValidatedSelect, PasswordStrengthMeter } from '../../../shared/components/ValidatedInput';
import { validators, calculatePasswordStrength, debounce } from '../../../shared/utils/formValidation';

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
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'none', score: 0, feedback: '' });

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
   * Handle input changes with real-time validation (after field is touched)
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate password strength on change
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Real-time validation ONLY if field has been touched and has error
    if (touched[name] && errors[name]) {
      validateField(name, value);
    }

    setApiError('');
  };

  /**
   * Handle field blur - validate when user leaves field
   */
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate the field
    validateField(name, value);
  };

  /**
   * Validate individual field
   */
  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case 'name':
        error = validators.name(value, 'Full name');
        break;
      case 'email':
        error = validators.email(value);
        break;
      case 'password':
        error = validators.password(value);
        break;
      case 'confirmPassword':
        error = validators.passwordConfirm(value, formData.password);
        break;
      case 'phone':
        error = validators.phoneOptional(value);
        break;
      case 'department':
        if (formData.role !== 'Patient' && !value.trim()) {
          error = 'Department is required for staff members';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  /**
   * Validate entire form before submission
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    const nameError = validators.name(formData.name, 'Full name');
    if (nameError) newErrors.name = nameError;

    const emailError = validators.email(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validators.password(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validators.passwordConfirm(formData.confirmPassword, formData.password);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Department validation for staff roles
    if (formData.role !== 'Patient' && !formData.department.trim()) {
      newErrors.department = 'Department is required for staff members';
    }

    // Phone validation (optional)
    if (formData.phone) {
      const phoneError = validators.phoneOptional(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

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
            <ValidatedInput
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.name}
              touched={touched.name}
              required
              placeholder="Enter full name"
              autoComplete="name"
            />

            {/* Email Field */}
            <ValidatedInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.email}
              touched={touched.email}
              required
              placeholder="user@example.com"
              autoComplete="email"
            />

            {/* Phone Field */}
            <ValidatedInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.phone}
              touched={touched.phone}
              placeholder="(555) 123-4567"
              helpText="Optional - 10 digit phone number"
              autoComplete="tel"
            />
          </div>

          {/* Role and Access Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Role and Access
            </h3>

            {/* Role Selection */}
            <ValidatedSelect
              label="User Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.role}
              touched={touched.role}
              required
              options={roles}
              helpText={formData.role ? getRoleDescription(formData.role) : ''}
            />

            {/* Department Field */}
            <ValidatedInput
              label="Department"
              name="department"
              type="text"
              value={formData.department}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.department}
              touched={touched.department}
              required={formData.role !== 'Patient'}
              placeholder="e.g., Cardiology, Emergency, IT"
              helpText={formData.role === 'Patient' ? 'Optional for patients' : 'Required for staff members'}
            />

            {/* Specialization Field */}
            {formData.role === 'Technician' && (
              <ValidatedInput
                label="Specialization"
                name="specialization"
                type="text"
                value={formData.specialization}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.specialization}
                touched={touched.specialization}
                placeholder="e.g., Electrical, Mechanical, IT Systems"
                helpText="Technical specialty area"
              />
            )}
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Security
            </h3>

            {/* Password Field with Strength Meter */}
            <div>
              <ValidatedInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.password}
                touched={touched.password}
                required
                placeholder="Enter password (min 8 characters)"
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                autoComplete="new-password"
              />
              <PasswordStrengthMeter password={formData.password} strength={passwordStrength} />
            </div>

            {/* Confirm Password Field */}
            <ValidatedInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              required
              placeholder="Re-enter password"
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              autoComplete="new-password"
            />
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