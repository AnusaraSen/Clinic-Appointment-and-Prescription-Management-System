import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';
import { ValidatedInput, ValidatedSelect, PasswordStrengthMeter } from '../../../shared/components/ValidatedInput';
import { validators, calculatePasswordStrength } from '../../../shared/utils/formValidation';

export const EditUserModal = ({ isOpen, onClose, user, onUpdate }) => {
  useHideNavbar(isOpen);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    gender: '',
    dob: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ strength: 'none', score: 0, feedback: '' });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        age: user.age || '',
        gender: user.gender || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        role: user.role || '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Calculate password strength on change
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Real-time validation ONLY if field has been touched and has error
    if (touched[name] && errors[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate the field
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case 'name':
        error = validators.name(value, 'Name');
        break;
      case 'email':
        error = validators.email(value);
        break;
      case 'phone':
        error = validators.phoneOptional(value);
        break;
      case 'password':
        // Password is optional in edit mode, but if provided, must be valid
        if (value) {
          error = validators.password(value);
        }
        break;
      case 'confirmPassword':
        // Only validate if password was entered
        if (formData.password && value) {
          error = validators.passwordConfirm(value, formData.password);
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate all fields
    const nameError = validators.name(formData.name, 'Name');
    if (nameError) newErrors.name = nameError;

    const emailError = validators.email(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Phone is optional
    if (formData.phone) {
      const phoneError = validators.phoneOptional(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    // Password validation only if password is provided (optional in edit mode)
    if (formData.password) {
      const passwordError = validators.password(formData.password);
      if (passwordError) newErrors.password = passwordError;

      const confirmPasswordError = validators.passwordConfirm(formData.confirmPassword, formData.password);
      if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    }

    // Age validation
    if (formData.age) {
      const ageError = validators.numberRange(formData.age, 1, 150, 'Age');
      if (ageError) newErrors.age = ageError;
    }

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
        role: formData.role
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await onUpdate(user.id || user._id, updateData);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ submit: 'Failed to update user. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const roleOptions = [
    'Admin',
    'Doctor',
    'LabStaff',
    'LabSupervisor',
    'Technician',
    'Pharmacist',
    'InventoryManager',
    'Patient'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto admin-form">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <p className="text-sm text-gray-500">Update user information and settings</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
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

            {/* Email */}
            <ValidatedInput
              label="Email"
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

            {/* Phone */}
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
              helpText="Optional"
              autoComplete="tel"
            />

            {/* Role */}
            <ValidatedSelect
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.role}
              touched={touched.role}
              required
              options={roleOptions.map(role => ({ value: role, label: role }))}
              placeholder="Select a role"
            />

            {/* Age */}
            <ValidatedInput
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.age}
              touched={touched.age}
              placeholder="Enter age"
              helpText="Optional (1-150)"
            />

            {/* Gender */}
            <ValidatedSelect
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              error={errors.gender}
              touched={touched.gender}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
              placeholder="Select gender"
              helpText="Optional"
            />

            {/* Date of Birth */}
            <div className="md:col-span-2">
              <ValidatedInput
                label="Date of Birth"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.dob}
                touched={touched.dob}
                helpText="Optional"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <ValidatedInput
                label="Address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={handleFieldBlur}
                error={errors.address}
                touched={touched.address}
                placeholder="Enter address"
                helpText="Optional"
              />
            </div>

            {/* Password Section */}
            <div className="md:col-span-2">
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <ValidatedInput
                      label="New Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      error={errors.password}
                      touched={touched.password}
                      placeholder="Enter new password"
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      helpText="Leave blank to keep current password"
                      autoComplete="new-password"
                    />
                    {formData.password && (
                      <PasswordStrengthMeter password={formData.password} strength={passwordStrength} />
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <ValidatedInput
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      error={errors.confirmPassword}
                      touched={touched.confirmPassword}
                      placeholder="Confirm new password"
                      showPasswordToggle
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave password fields empty to keep the current password unchanged.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};