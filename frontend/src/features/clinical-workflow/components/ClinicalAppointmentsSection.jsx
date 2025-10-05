import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  MoreVertical,
  Play,
  RotateCcw,
  X
} from 'lucide-react';

/**
 * 🩺 Clinical Appointments Section - Today's Appointments Overview
 * 
 * Features:
 * ✅ Today's appointment list
 * ✅ Quick actions (Start, Reschedule, Cancel)
 * ✅ Patient information display
 * ✅ Status management
 * ✅ Professional styling matching admin dashboard
 */

export const ClinicalAppointmentsSection = ({ appointments = [], isLoading, onUpdateAppointment }) => {
  const [expandedAppointment, setExpandedAppointment] = useState(null);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleActionClick = (appointmentId, action) => {
    if (typeof onUpdateAppointment === 'function') {
      onUpdateAppointment(appointmentId, action);
    }
  };

  // Mock data fallback if no appointments provided
  const displayAppointments = appointments.length > 0 ? appointments : [
    {
      _id: '1',
      patient_name: 'Sarah Johnson',
      appointment_time: '09:00',
      appointment_type: 'Regular Checkup',
      status: 'upcoming',
      phone: '+1 234-567-8901',
      notes: 'Annual physical examination'
    },
    {
      _id: '2',
      patient_name: 'Michael Chen',
      appointment_time: '10:30',
      appointment_type: 'Follow-up',
      status: 'completed',
      phone: '+1 234-567-8902',
      notes: 'Post-surgery follow-up'
    },
    {
      _id: '3',
      patient_name: 'Emily Davis',
      appointment_time: '14:00',
      appointment_type: 'Consultation',
      status: 'upcoming',
      phone: '+1 234-567-8903',
      notes: 'New patient consultation'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
            <p className="text-sm text-gray-600">
              {displayAppointments.length} appointments scheduled
            </p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          View Calendar
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Time */}
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-bold text-gray-900">
                      {formatTime(appointment.appointment_time)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.appointment_type}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {getInitials(appointment.patient_name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patient_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {appointment.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{appointment.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>

                  {appointment.status === 'upcoming' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleActionClick(appointment._id, 'start')}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        Start
                      </button>
                      <button
                        onClick={() => handleActionClick(appointment._id, 'reschedule')}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleActionClick(appointment._id, 'cancel')}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {appointment.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="text-lg">✅</span>
                    </div>
                  )}

                  {appointment.status === 'cancelled' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <span className="text-lg">❌</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          ))}

          {displayAppointments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
              <p className="text-gray-400 text-sm">Your schedule is clear!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};