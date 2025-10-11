import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Clock, Wrench, Save, AlertCircle } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '../../../shared/components/ValidatedInput';
import { validators } from '../../../shared/utils/formValidation';

/**
 * Add Technician Modal
 * Modal for creating new technician records
 */
export const AddTechnicianModal = ({ isOpen, onClose, onSuccess }) => {
  useHideNavbar(isOpen);
  console.log('🎯 AddTechnicianModal render - isOpen:', isOpen);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    jobTitle: '',
    department: '',
    address: '',
    dateOfBirth: '',
    skills: [],
    supervisorId: '',
    emergencyContact: {
      name: '',
      phone: '',
    },
    notes: '',
    additionalInfo: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Re-validate field if it was touched and had error
    if (touched[name] && errors[name]) {
      validateField(name, value);
    }
  };

  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        error = validators.name(value);
        break;
      case 'email':
        error = validators.email(value);
        break;
      case 'phone':
        error = validators.phone(value);
        break;
      case 'employeeId':
        error = validators.employeeId(value);
        break;
      case 'jobTitle':
        error = validators.required(value, 'Job title');
        break;
      case 'department':
        error = validators.required(value, 'Department');
        break;
      case 'address':
        if (value && value.length > 500) {
          error = 'Address must be less than 500 characters';
        }
        break;
      case 'dateOfBirth':
        if (value) {
          error = validators.pastDate(value);
        }
        break;
      case 'supervisorId':
        if (value && !validators.employeeId(value)) {
          error = 'Invalid supervisor ID format';
        }
        break;
      case 'emergencyContact.name':
        if (value) {
          error = validators.name(value);
        }
        break;
      case 'emergencyContact.phone':
        if (value) {
          error = validators.phone(value);
        }
        break;
      case 'notes':
        error = validators.textLength(value, 0, 1000, 'Notes');
        break;
      case 'additionalInfo':
        error = validators.textLength(value, 0, 1000, 'Additional info');
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const generateEmployeeId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({
      ...prev,
      employeeId: `EMP${timestamp}${random}`
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const allTouched = {};

    // Validate all required fields
    const fieldsToValidate = ['name', 'email', 'phone', 'employeeId', 'jobTitle', 'department',
      'address', 'dateOfBirth', 'supervisorId', 'emergencyContact.name', 'emergencyContact.phone', 
      'notes', 'additionalInfo'];
    
    fieldsToValidate.forEach(field => {
      allTouched[field] = true;
      const value = field.includes('.') 
        ? formData[field.split('.')[0]][field.split('.')[1]]
        : formData[field];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    setTouched(allTouched);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/workforce-facility/lab-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            dateOfBirth: formData.dateOfBirth,
          },
          workInfo: {
            employeeId: formData.employeeId,
            jobTitle: formData.jobTitle,
            department: formData.department,
            skills: formData.skills,
            supervisorId: formData.supervisorId,
          },
          emergencyContact: formData.emergencyContact,
          additionalInfo: {
            notes: formData.notes,
            details: formData.additionalInfo
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.error) {
          const errorData = data.error;
          const validationMessages = Object.values(errorData.details).map(err => err.message).join(', ');
          setError(validationMessages || 'An error occurred while creating the technician');
        } else {
          setError('An error occurred while creating the technician');
        }
        return;
      }

      console.log('✅ Technician created successfully:', data);
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      handleClose();
    } catch (error) {
      console.error('❌ Error creating technician:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      jobTitle: '',
      department: '',
      address: '',
      dateOfBirth: '',
      skills: [],
      supervisorId: '',
      emergencyContact: { name: '', phone: '' },
      notes: '',
      additionalInfo: ''
    });
    setNewSkill('');
    setError('');
    setLoading(false);
    onClose();
  };

  if (!isOpen) {
    console.log('❌ AddTechnicianModal not open, returning null');
    return null;
  }

  console.log('✅ AddTechnicianModal should be visible now!');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Technician</h2>
                <p className="text-sm text-gray-600 mt-1">Create a new technician profile for the system</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200 disabled:opacity-50 group"
            >
              <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <form id="technician-form" onSubmit={handleSubmit} className="px-8 py-6">
            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 shadow-sm">
                <div className="p-1 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>

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
                />

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
                  placeholder="email@example.com"
                  autoComplete="email"
                />

                <ValidatedInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={errors.phone}
                  touched={touched.phone}
                  required
                  placeholder="+1 (555) 123-4567"
                  autoComplete="tel"
                />

                <ValidatedTextarea
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={errors.address}
                  touched={touched.address}
                  rows={2}
                  placeholder="Enter full address"
                  helpText="Optional"
                />
              </div>

              {/* Work Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Work Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <div className="flex space-x-2">
                    <ValidatedInput
                      name="employeeId"
                      type="text"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      error={errors.employeeId}
                      touched={touched.employeeId}
                      disabled
                      placeholder="Click Generate to create ID"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={generateEmployeeId}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <ValidatedInput
                  label="Job Title"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={errors.jobTitle}
                  touched={touched.jobTitle}
                  required
                  placeholder="e.g., Lab Technician, Maintenance Engineer"
                />

                <ValidatedSelect
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={errors.department}
                  touched={touched.department}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="lab">Laboratory</option>
                  <option value="radiology">Radiology</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="general">General</option>
                </ValidatedSelect>

                <ValidatedTextarea
                  label="Additional Information"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={errors.additionalInfo}
                  touched={touched.additionalInfo}
                  rows={3}
                  placeholder="Any additional information about the technician..."
                  helpText="Optional"
                  maxLength={1000}
                  showCharCount
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Creating...' : 'Create Technician'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};