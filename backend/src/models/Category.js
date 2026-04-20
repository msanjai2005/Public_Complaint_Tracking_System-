const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
  },
  slaHours: {
    type: Number,
    default: 48,
    min: [1, 'SLA must be at least 1 hour'],
  },
  icon: {
    type: String,
    default: '📋',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Category', categorySchema);
