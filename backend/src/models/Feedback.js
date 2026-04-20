const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Rating is required'],
  },
  comment: {
    type: String,
    default: '',
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  resolutionSatisfaction: {
    type: String,
    enum: ['very-satisfied', 'satisfied', 'neutral', 'unsatisfied'],
    default: 'neutral',
  },
}, {
  timestamps: true,
});

// One feedback per complaint per user
feedbackSchema.index({ complaint: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
