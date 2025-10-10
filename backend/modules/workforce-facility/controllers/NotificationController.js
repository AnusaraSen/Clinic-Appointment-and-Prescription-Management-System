const Notification = require('../models/Notification');

/**
 * @desc    Get all notifications for the authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, isRead, limit = 50, skip = 0 } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      category: category || null,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : null
    };

    const notifications = await Notification.getForUser(userId, options);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is a recipient
    const isRecipient = notification.recipients.some(
      recipient => recipient.user.toString() === userId.toString()
    );

    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to mark this notification as read'
      });
    }

    await notification.markAsReadBy(userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * @desc    Mark all notifications as read for user
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      'recipients.user': userId,
      'readBy.user': { $ne: userId }
    });

    await Promise.all(
      notifications.map(notification => notification.markAsReadBy(userId))
    );

    res.json({
      success: true,
      message: `${notifications.length} notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new notification (admin/system only)
 * @route   POST /api/notifications
 * @access  Private/Admin
 */
exports.createNotification = async (req, res) => {
  try {
    const { type, category, title, message, relatedEntity, recipients, priority, metadata } = req.body;

    const notification = await Notification.createNotification({
      type,
      category,
      title,
      message,
      relatedEntity,
      recipients,
      priority: priority || 'medium',
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is a recipient or admin
    const isRecipient = notification.recipients.some(
      recipient => recipient.user.toString() === userId.toString()
    );

    const isAdmin = req.user.role === 'admin';

    if (!isRecipient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this notification'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

module.exports = exports;
