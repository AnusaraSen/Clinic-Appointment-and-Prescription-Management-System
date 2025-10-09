import React from 'react';
import { X, User, Phone, Mail, MapPin, Clock, Calendar, Wrench, Award, Star, Users, FileText } from 'lucide-react';
import { useHideNavbar } from '../../../shared/hooks/useHideNavbar';

/**
 * Technician Details Modal
 * Shows comprehensive information about a selected technician
 */
export const TechnicianDetailsModal = ({ isOpen, onClose, technician }) => {
  useHideNavbar(isOpen);
  
  if (!isOpen || !technician) return null;

  // Get availability status styling
  const getAvailabilityStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return {
          badge: 'bg-green-100 text-green-800 border-green-200',
          text: 'Available'
        };
      case 'busy':
        return {
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Busy'
        };
      case 'on leave':
      case 'leave':
        return {
          badge: 'bg-red-100 text-red-800 border-red-200',
          text: 'On Leave'
        };
      case 'off duty':
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Off Duty'
        };
      default:
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          text: status || 'Unknown'
        };
    }
  };

  // Get shift timing display
  const getShiftDisplay = (shift) => {
    if (!shift) return 'Not scheduled';
    
    const shiftMap = {
      'morning': '6:00 AM - 2:00 PM',
      'afternoon': '2:00 PM - 10:00 PM',
      'night': '10:00 PM - 6:00 AM',
      'day': '8:00 AM - 6:00 PM'
    };
    
    return shiftMap[shift?.toLowerCase()] || shift;
  };

  const availabilityInfo = getAvailabilityStatus(technician.availabilityStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Profile Photo */}
            {technician.profilePhoto ? (
              <img
                src={technician.profilePhoto}
                alt={`${technician.firstName} ${technician.lastName}`}
                className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {technician.firstName} {technician.lastName}
              </h2>
              <p className="text-gray-600">{technician.department || 'General Maintenance'}</p>
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border mt-2 ${availabilityInfo.badge}`}>
                {availabilityInfo.text}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{technician.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{technician.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{technician.location || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">{technician.employeeId || 'Not assigned'}</span>
                  </div>
                  {technician.hireDate && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Hire Date:</span>
                      <span className="font-medium">{new Date(technician.hireDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {technician.emergencyContact && (technician.emergencyContact.name || technician.emergencyContact.phone) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Emergency Contact
                  </h3>
                  <div className="space-y-3">
                    {technician.emergencyContact.name && (
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{technician.emergencyContact.name}</span>
                      </div>
                    )}
                    {technician.emergencyContact.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{technician.emergencyContact.phone}</span>
                      </div>
                    )}
                    {technician.emergencyContact.relationship && (
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Relationship:</span>
                        <span className="font-medium">{technician.emergencyContact.relationship}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Skills and Experience */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-blue-600" />
                  Skills & Expertise
                </h3>
                {technician.skills && technician.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {technician.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No skills specified</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Experience
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">Experience Level:</span>
                    <span className="font-medium">
                      {technician.experienceLevel || technician.yearsOfExperience 
                        ? `${technician.experienceLevel || technician.yearsOfExperience} years`
                        : 'Not specified'
                      }
                    </span>
                  </div>
                  {technician.certifications && technician.certifications.length > 0 && (
                    <div>
                      <span className="text-gray-600">Certifications:</span>
                      <div className="mt-2 space-y-1">
                        {technician.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Schedule Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">Current Shift:</span>
                    <span className="font-medium">{getShiftDisplay(technician.shift)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">Working Hours:</span>
                    <span className="font-medium">{technician.workingHours || '40 hours/week'}</span>
                  </div>
                  {technician.currentAssignment && (
                    <div className="flex items-start space-x-3">
                      <span className="text-gray-600">Current Assignment:</span>
                      <span className="font-medium">{technician.currentAssignment}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              {(technician.completedTasks || technician.rating) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-blue-600" />
                    Performance
                  </h3>
                  <div className="space-y-3">
                    {technician.completedTasks && (
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-600">Completed Tasks:</span>
                        <span className="font-medium">{technician.completedTasks}</span>
                      </div>
                    )}
                    {technician.rating && (
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{technician.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(technician.rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {technician.notes && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Notes</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{technician.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};