import React from 'react';
import { 
  Activity, 
  Clock, 
  User, 
  FileText,
  Calendar,
  Pill
} from 'lucide-react';



export const ClinicalActivitySection = ({ activities = [], isLoading }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'prescription': return <Pill className="h-4 w-4" />;
      case 'diagnosis': return <FileText className="h-4 w-4" />;
      case 'lab_order': return <Activity className="h-4 w-4" />;
      case 'follow_up': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-600';
      case 'prescription': return 'bg-green-100 text-green-600';
      case 'diagnosis': return 'bg-purple-100 text-purple-600';
      case 'lab_order': return 'bg-orange-100 text-orange-600';
      case 'follow_up': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityBadgeColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'prescription': return 'bg-green-50 text-green-700 border-green-200';
      case 'diagnosis': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'lab_order': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'follow_up': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatActivityTime = (date) => {
    const activityDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return activityDate.toLocaleDateString();
    }
  };

  // Mock data fallback if no activities provided
  const displayActivities = activities.length > 0 ? activities : [
    {
      _id: '1',
      type: 'appointment',
      description: 'Completed consultation with Sarah Johnson',
      patient_name: 'Sarah Johnson',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      details: 'Annual physical examination completed'
    },
    {
      _id: '2',
      type: 'prescription',
      description: 'Prescribed medication for Michael Chen',
      patient_name: 'Michael Chen',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      details: 'Antibiotics for post-surgical care'
    },
    {
      _id: '3',
      type: 'lab_order',
      description: 'Ordered blood work for Emily Davis',
      patient_name: 'Emily Davis',
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
      details: 'Complete blood count and lipid panel'
    },
    {
      _id: '4',
      type: 'follow_up',
      description: 'Scheduled follow-up for John Smith',
      patient_name: 'John Smith',
      created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
      details: 'Two-week post-treatment review'
    },
    {
      _id: '5',
      type: 'diagnosis',
      description: 'Updated diagnosis for Maria Garcia',
      patient_name: 'Maria Garcia',
      created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3 hours ago
      details: 'Hypertension with additional dietary recommendations'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600">
              Latest {displayActivities.length} activities
            </p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-4 p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayActivities.map((activity, index) => (
            <div
              key={activity._id}
              className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              {/* Activity Icon */}
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        <span className="font-medium">{activity.patient_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatActivityTime(activity.created_at)}</span>
                      </div>
                    </div>

                    {activity.details && (
                      <p className="text-xs text-gray-600 mb-2">
                        {activity.details}
                      </p>
                    )}

                    {/* Activity Type Badge */}
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md border ${getActivityBadgeColor(activity.type)}`}>
                      {activity.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Connector */}
              {index < displayActivities.length - 1 && (
                <div className="absolute left-6 mt-12 w-px h-4 bg-gray-200"></div>
              )}
            </div>
          ))}

          {displayActivities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No recent activity</p>
              <p className="text-gray-400 text-sm">Activities will appear here as you work</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};