const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create a notification and emit via socket
   */
  async create({ userId, title, message, type = 'system', relatedComplaint = null, io = null }) {
    try {
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        relatedComplaint,
      });

      // Emit via socket if available
      if (io) {
        io.to(`user_${userId}`).emit('notification', {
          ...notification.toObject(),
          isNew: true,
        });
      }

      return notification;
    } catch (error) {
      console.error('Notification creation error:', error.message);
      return null;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedComplaint', 'complaintId title status');
    
    const total = await Notification.countDocuments({ user: userId });
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    return { notifications, total, unreadCount, page, pages: Math.ceil(total / limit) };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    return Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
  }

  /**
   * Delete notification
   */
  async delete(notificationId, userId) {
    return Notification.findOneAndDelete({ _id: notificationId, user: userId });
  }
}

module.exports = new NotificationService();
