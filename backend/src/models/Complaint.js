const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  location: {
    address: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  images: [{
    type: String,
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'in-progress', 'resolved', 'rejected'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  department: {
    type: String,
    default: '',
  },
  timeline: [{
    status: { type: String, required: true },
    comment: { type: String, default: '' },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  internalNotes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  resolvedAt: Date,
  resolutionTime: Number, // in hours
  isCancelled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Generate complaint ID before saving
complaintSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Complaint').countDocuments();
    const year = new Date().getFullYear();
    this.complaintId = `SWC-${year}${String(count + 1).padStart(4, '0')}`;

    // Add initial timeline entry
    this.timeline.push({
      status: 'pending',
      comment: 'Complaint registered successfully',
      updatedBy: this.user,
    });
  }
  next();
});

// Index for search
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ user: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
