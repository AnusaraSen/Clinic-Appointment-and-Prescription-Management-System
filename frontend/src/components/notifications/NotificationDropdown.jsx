import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Users, 
  Calendar,
  Bell,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ 
  notifications, 
  loading, 
  unreadCount,
  onMarkAsRead, 
  onMarkAllAsRead,
  onRefresh,
  onClose 
}) => {
  
  // Get icon based on notification category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MAINTENANCE_REQUESTS':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      case 'TECHNICIAN_RELATED':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'EQUIPMENT_ISSUES':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'SCHEDULED_MAINTENANCE':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'SYSTEM_EVENTS':
        return <Bell className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-4 border-green-500 bg-green-50';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  // Check if notification is read by current user
  const isNotificationRead = (notification) => {
    // If notification has isRead true, it's read
    // Or check if current user is in readBy array
    return notification.isRead || (notification.readBy && notification.readBy.length > 0);
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-1">When you get notifications, they'll show up here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const isRead = isNotificationRead(notification);
              
              return (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !isRead ? 'bg-blue-50' : ''
                  } ${getPriorityColor(notification.priority)}`}
                  onClick={() => !isRead && onMarkAsRead(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getCategoryIcon(notification.category)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!isRead && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className={`text-sm mt-1 ${!isRead ? 'text-gray-700' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                        
                        {notification.priority === 'urgent' && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Urgent
                          </span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            High
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onRefresh}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
