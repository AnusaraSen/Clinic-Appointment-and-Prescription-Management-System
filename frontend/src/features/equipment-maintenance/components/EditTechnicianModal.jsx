import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Clock, Wrench, Save } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';
import { ValidatedInput, ValidatedTextarea, ValidatedSelect } from '../../../shared/components/ValidatedInput';
import { validators } from '../../../shared/utils/formValidation';

/**
 * Edit Technician Modal
 * Modal for editing existing technician records
 */
export const EditTechnicianModal = ({ isOpen, onClose, onSuccess, technician }) => {
  useHideNavbar(isOpen);
  console.log('🎯 EditTechnicianModal render - isOpen:', isOpen, 'technician:', technician);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    location: '',
    shift: '',
    availabilityStatus: 'available',
    skills: [],
    experienceLevel: '',
    hireDate: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Populate form data when technician prop changes
  useEffect(() => {
    if (technician && isOpen) {
      setFormData({
        firstName: technician.firstName || '',
        lastName: technician.lastName || '',
        email: technician.email || '',
        phone: technician.phone || '',
        employeeId: technician.technician_id || technician.employeeId || '',
        department: technician.department || '',
        location: technician.location || '',
        shift: technician.shift || '',
        availabilityStatus: technician.availabilityStatus || technician.availability ? 'available' : 'unavailable',
        skills: Array.isArray(technician.skills) ? technician.skills : [],
        experienceLevel: technician.experienceLevel || '',
        hireDate: technician.hireDate ? technician.hireDate.split('T')[0] : '',
        emergencyContact: {
          name: technician.emergencyContact?.name || '',
          phone: technician.emergencyContact?.phone || '',
          relationship: technician.emergencyContact?.relationship || ''
        },
        notes: technician.notes || ''
      });
    }
  }, [technician, isOpen]);

  // Handle input changes
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
      case 'firstName':
      case 'lastName':
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
      case 'department':
        error = validators.required(value, 'Department');
        break;
      case 'location':
        if (value && value.length > 200) {
          error = 'Location must be less than 200 characters';
        }
        break;
      case 'experienceLevel':
        if (value && !['Junior', 'Mid-Level', 'Senior', 'Expert'].includes(value)) {
          error = 'Invalid experience level';
        }
        break;
      case 'hireDate':
        if (value) {
          error = validators.pastDate(value);
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
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle Enter key for skills
  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const allTouched = {};

    // Validate all fields
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'employeeId', 
      'department', 'location', 'experienceLevel', 'hireDate', 'emergencyContact.name', 
      'emergencyContact.phone', 'notes'];
    
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for API
      const technicianData = {
        ...formData,
        technician_id: formData.employeeId, // Map employeeId to technician_id for backend
        phone: formData.phone.replace(/\D/g, ''), // Remove all non-digits from phone
        updatedAt: new Date().toISOString()
      };
      
      // Clean emergency contact phone number as well
      if (technicianData.emergencyContact && technicianData.emergencyContact.phone) {
        technicianData.emergencyContact.phone = technicianData.emergencyContact.phone.replace(/\D/g, '');
      }
      
      // Remove employeeId from the data since we're sending technician_id instead
      delete technicianData.employeeId;

      console.log('Updating technician with data:', JSON.stringify(technicianData, null, 2));

      const response = await fetch(`http://localhost:5000/api/technicians/${technician._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(technicianData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Detailed error from server:', errorData);
        console.error('Validation details:', errorData.details);
        
        // Show detailed validation errors if available
        if (errorData.details) {
          const validationMessages = Object.values(errorData.details).map(err => err.message).join(', ');
          throw new Error(`Validation error: ${validationMessages}`);
        }
        
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Technician updated successfully:', result);

      // Call success callback
      if (onSuccess) {
        onSuccess(result.data);
      }

    } catch (error) {
      console.error('Error updating technician:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Technician</h2>
              <p className="text-sm text-gray-600">Update technician information</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., 555-123-4567"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <p className="text-sm text-gray-500 mt-1">Enter 10-15 digits (formatting will be removed automatically)</p>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Employment Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="e.g., T123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Format: T followed by 3 digits (e.g., T123)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option key="dept-placeholder" value="">Select Department</option>
                  <option key="dept-maintenance" value="Maintenance">Maintenance</option>
                  <option key="dept-it" value="IT">IT</option>
                  <option key="dept-hvac" value="HVAC">HVAC</option>
                  <option key="dept-electric" value="Electrical">Electrical</option>
                  <option key="dept-plumbing" value="Plumbing">Plumbing</option>
                  <option key="dept-security" value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Building, Floor 2"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift
                </label>
                <div className="relative">
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option key="shift-placeholder" value="">Select Shift</option>
                    <option key="shift-morning" value="morning">Morning (6:00 AM - 2:00 PM)</option>
                    <option key="shift-afternoon" value="afternoon">Afternoon (2:00 PM - 10:00 PM)</option>
                    <option key="shift-night" value="night">Night (10:00 PM - 6:00 AM)</option>
                    <option key="shift-day" value="day">Day (8:00 AM - 6:00 PM)</option>
                  </select>
                  <Clock className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability Status
                </label>
                <select
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option key="avail-available" value="available">Available</option>
                  <option key="avail-busy" value="busy">Busy</option>
                  <option key="avail-onleave" value="on leave">On Leave</option>
                  <option key="avail-offduty" value="off duty">Off Duty</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Skills & Expertise
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Skills
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="e.g., HVAC repair, Electrical work"
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Wrench className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Skills Display */}
              {formData.skills.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Added Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center space-x-2 border border-blue-200"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Additional Details</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level (years)
                  </label>
                  <input
                    type="number"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes about the technician..."
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Emergency Contact</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Updating...' : 'Update Technician'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};