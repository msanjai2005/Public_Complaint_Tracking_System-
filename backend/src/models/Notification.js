const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
  },
  type: {
    type: String,
    enum: ['complaint-update', 'assignment', 'reminder', 'system'],
    default: 'system',
  },
  relatedComplaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
