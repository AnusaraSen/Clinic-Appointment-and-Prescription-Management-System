const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        // Maintenance Requests
        'NEW_MAINTENANCE_REQUEST',
        'MAINTENANCE_REQUEST_ASSIGNED',
        'MAINTENANCE_REQUEST_STATUS_UPDATED',
        'MAINTENANCE_REQUEST_COMPLETED',
        'MAINTENANCE_REQUEST_URGENT',
        // Technician-Related
        'TECHNICIAN_ASSIGNED_TO_TASK',
        'TASK_REASSIGNED',
        'TECHNICIAN_AVAILABILITY_CHANGED',
        // Equipment Issues
        'EQUIPMENT_STATUS_CRITICAL',
        'EQUIPMENT_REQUIRES_IMMEDIATE_ATTENTION',
        'EQUIPMENT_BACK_TO_NORMAL',
        // Scheduled Maintenance
        'SCHEDULED_MAINTENANCE_DUE',
        'SCHEDULED_MAINTENANCE_OVERDUE',
        'SCHEDULED_MAINTENANCE_COMPLETED',
        'SCHEDULED_MAINTENANCE_CREATED',
        'SCHEDULED_MAINTENANCE_STATUS_UPDATED',
        // System Events
        'LOW_INVENTORY_ALERT',
        'SYSTEM_MAINTENANCE_SCHEDULED'
      ]
    },
    category: {
      type: String,
      required: true,
      enum: [
        'MAINTENANCE_REQUESTS',
        'TECHNICIAN_RELATED',
        'EQUIPMENT_ISSUES',
        'SCHEDULED_MAINTENANCE',
        'SYSTEM_EVENTS'
      ]
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['MaintenanceRequest', 'ScheduledMaintenance', 'Equipment', 'Technician', 'User', null]
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedEntity.entityType'
      }
    },
    recipients: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        role: {
          type: String,
          enum: ['Patient', 'Doctor', 'Pharmacist', 'Admin', 'LabStaff', 'InventoryManager', 'LabSupervisor', 'Technician']
        }
      }
    ],
    isRead: {
      type: Boolean,
      default: false
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
notificationSchema.index({ 'recipients.user': 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ category: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

// Virtual for checking if notification is unread
notificationSchema.virtual('isUnread').get(function () {
  return !this.isRead;
});

// Method to mark notification as read by a specific user
notificationSchema.methods.markAsReadBy = function (userId) {
  if (!this.readBy.some(rb => rb.user.toString() === userId.toString())) {
    this.readBy.push({ user: userId, readAt: new Date() });
  }
  
  // If all recipients have read it, mark as read
  const allRecipientsRead = this.recipients.every(recipient =>
    this.readBy.some(rb => rb.user.toString() === recipient.user.toString())
  );
  
  if (allRecipientsRead) {
    this.isRead = true;
  }
  
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  try {
    const notification = new this(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    'recipients.user': userId,
    'readBy.user': { $ne: userId }
  });
};

// Static method to get notifications for a user
notificationSchema.statics.getForUser = async function (userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    category = null,
    isRead = null
  } = options;

  const query = { 'recipients.user': userId };
  
  if (category) {
    query.category = category;
  }
  
  if (isRead !== null) {
    if (isRead) {
      query['readBy.user'] = userId;
    } else {
      query['readBy.user'] = { $ne: userId };
    }
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('recipients.user', 'name email role')
    .populate('readBy.user', 'name')
    .lean();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
