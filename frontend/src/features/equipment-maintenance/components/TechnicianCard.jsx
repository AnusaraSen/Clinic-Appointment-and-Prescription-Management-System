import React from 'react';
import { 
  Wrench, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Edit2, 
  Trash2, 
  Award, 
  Users, 
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  User,
  AlertCircle 
} from 'lucide-react';

/**
 * Technician Card Component
 * Displays individual technician information in a card format
 */
export const TechnicianCard = ({ technician, onViewDetails, onEdit, onDelete }) => {
  // Get availability status styling
  const getAvailabilityStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          badge: 'bg-green-100 text-green-800 border-green-200',
          text: 'Available'
        };
      case 'busy':
        return {
          icon: <Clock className="h-4 w-4 text-yellow-500" />,
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Busy'
        };
      case 'on leave':
      case 'leave':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          badge: 'bg-red-100 text-red-800 border-red-200',
          text: 'On Leave'
        };
      case 'off duty':
        return {
          icon: <Clock className="h-4 w-4 text-gray-500" />,
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Off Duty'
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
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

  // Format skills for display
  const formatSkills = (skills) => {
    if (!skills || !Array.isArray(skills)) return [];
    return skills.slice(0, 3); // Show only first 3 skills
  };

  const availabilityInfo = getAvailabilityStatus(technician.availabilityStatus);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header with Photo and Basic Info */}
      <div className="flex items-start space-x-4 mb-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
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
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {technician.firstName} {technician.lastName}
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${availabilityInfo.badge}`}>
              {availabilityInfo.icon}
              <span>{availabilityInfo.text}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {technician.department || 'General Maintenance'}
          </p>
          
          <p className="text-sm text-gray-500">
            ID: {technician.employeeId || technician._id?.slice(-6) || 'N/A'}
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        {technician.email && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="truncate">{technician.email}</span>
          </div>
        )}
        
        {technician.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{technician.phone}</span>
          </div>
        )}
        
        {technician.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="truncate">{technician.location}</span>
          </div>
        )}
      </div>

      {/* Work Schedule */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            <span className="font-medium">Shift:</span> {getShiftDisplay(technician.shift)}
          </span>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Wrench className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Skills</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {formatSkills(technician.skills).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
            >
              {skill}
            </span>
          ))}
          
          {technician.skills && technician.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">
              +{technician.skills.length - 3} more
            </span>
          )}
          
          {(!technician.skills || technician.skills.length === 0) && (
            <span className="text-xs text-gray-400 italic">No skills listed</span>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div className="mb-4 space-y-2">
        {/* Experience Level */}
        {technician.experienceLevel && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Award className="h-4 w-4 text-gray-400" />
            <span>
              <span className="font-medium">Experience:</span> {technician.experienceLevel} year{technician.experienceLevel !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Hire Date */}
        {technician.hireDate && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>
              <span className="font-medium">Hired:</span> {new Date(technician.hireDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Emergency Contact */}
        {technician.emergencyContact && technician.emergencyContact.name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-gray-400" />
            <span>
              <span className="font-medium">Emergency:</span> {technician.emergencyContact.name}
              {technician.emergencyContact.relationship && ` (${technician.emergencyContact.relationship})`}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {technician.notes && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Notes:</span> {technician.notes.length > 100 ? `${technician.notes.substring(0, 100)}...` : technician.notes}
          </p>
        </div>
      )}

      {/* Current Assignment */}
      {technician.currentAssignment && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Current Assignment</span>
          </div>
          <p className="text-sm text-yellow-700 truncate">
            {technician.currentAssignment}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              console.log('View Details button clicked for:', technician.firstName, technician.lastName);
              onViewDetails && onViewDetails(technician);
            }}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
          </button>
          
          <button
            onClick={() => {
              console.log('Edit button clicked for:', technician.firstName, technician.lastName);
              onEdit && onEdit(technician);
            }}
            className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
          
          <button
            onClick={() => {
              console.log('Delete button clicked for:', technician.firstName, technician.lastName);
              onDelete && onDelete(technician);
            }}
            className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};