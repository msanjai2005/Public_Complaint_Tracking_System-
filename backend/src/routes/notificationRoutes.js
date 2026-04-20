const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Get user notifications
router.get('/', protect, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const data = await notificationService.getUserNotifications(
    req.user._id,
    parseInt(page),
    parseInt(limit)
  );
  res.json({ success: true, data });
});

// Mark single as read
router.put('/:id/read', protect, async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  res.json({ success: true, data: notification });
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.json({ success: true, message: 'All notifications marked as read' });
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  await notificationService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Notification deleted' });
});

module.exports = router;
