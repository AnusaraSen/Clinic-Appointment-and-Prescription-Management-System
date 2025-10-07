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

export const ClinicalAppointmentsSection = ({ appointments = [], isLoading, error, onUpdateAppointment }) => {
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

  const statusMeta = {
    upcoming: { dot: 'bg-blue-500', label: 'Upcoming' },
    'in-progress': { dot: 'bg-amber-500', label: 'In Progress' },
    completed: { dot: 'bg-emerald-500', label: 'Completed' },
    cancelled: { dot: 'bg-rose-500', label: 'Cancelled' }
  };
  const getStatusColor = (status) => 'bg-gray-100 text-gray-600';

  const handleActionClick = (appointmentId, action) => {
    if (typeof onUpdateAppointment === 'function') {
      onUpdateAppointment(appointmentId, action);
    }
  };

  // Use only real appointments passed via props (already filtered server-side for today)
  const displayAppointments = appointments;

  return (
    <div className="cd-card" role="region" aria-label="Today's Appointments">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Calendar className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
            <p className="text-xs text-gray-500">{displayAppointments.length} scheduled</p>
          </div>
        </div>
        <button className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          View Calendar
        </button>
      </div>
      {error && !isLoading && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-100 text-rose-600 text-sm">
          Failed to load today's appointments: {error}
        </div>
      )}

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
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cd-fade-in"
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
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-2 ${getStatusColor(appointment.status)}`}>
                    <span className={`w-2 h-2 rounded-full ${statusMeta[appointment.status]?.dot || 'bg-gray-400'}`}></span>
                    {statusMeta[appointment.status]?.label || appointment.status}
                  </span>

                  {appointment.status === 'upcoming' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleActionClick(appointment._id, 'start')}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 border border-blue-200 rounded-md hover:bg-blue-50"
                      >
                        <Play className="h-3 w-3" />
                        Start
                      </button>
                      <button
                        onClick={() => handleActionClick(appointment._id, 'reschedule')}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 border border-amber-200 rounded-md hover:bg-amber-50"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleActionClick(appointment._id, 'cancel')}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 border border-rose-200 rounded-md hover:bg-rose-50"
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

          {displayAppointments.length === 0 && !error && (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No appointments scheduled for today</p>
              <p className="text-gray-400 text-xs">New bookings will appear here automatically.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};