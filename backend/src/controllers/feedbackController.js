const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');

/**
 * @desc    Submit feedback for resolved complaint
 * @route   POST /api/feedback
 * @access  Private
 */
const submitFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { complaintId, rating, comment, resolutionSatisfaction } = req.body;

  // Verify complaint is resolved and belongs to user
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (complaint.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (complaint.status !== 'resolved') {
    return res.status(400).json({ success: false, message: 'Can only provide feedback for resolved complaints' });
  }

  // Check if already submitted
  const existing = await Feedback.findOne({ complaint: complaintId, user: req.user._id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Feedback already submitted for this complaint' });
  }

  const feedback = await Feedback.create({
    complaint: complaintId,
    user: req.user._id,
    rating,
    comment,
    resolutionSatisfaction,
  });

  res.status(201).json({ success: true, message: 'Feedback submitted', data: feedback });
};

/**
 * @desc    Get feedback for a complaint
 * @route   GET /api/feedback/complaint/:complaintId
 * @access  Private
 */
const getComplaintFeedback = async (req, res) => {
  const feedback = await Feedback.findOne({ complaint: req.params.complaintId })
    .populate('user', 'name avatar');

  res.json({ success: true, data: feedback });
};

/**
 * @desc    Get feedback statistics
 * @route   GET /api/feedback/stats
 * @access  Admin
 */
const getFeedbackStats = async (req, res) => {
  const stats = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
        satisfactionBreakdown: { $push: '$resolutionSatisfaction' },
        ratingDistribution: { $push: '$rating' },
      },
    },
  ]);

  if (stats.length === 0) {
    return res.json({
      success: true,
      data: { avgRating: 0, totalFeedback: 0, distribution: {}, satisfaction: {} },
    });
  }

  const { avgRating, totalFeedback, satisfactionBreakdown, ratingDistribution } = stats[0];

  // Count rating distribution
  const distribution = {};
  ratingDistribution.forEach(r => {
    distribution[r] = (distribution[r] || 0) + 1;
  });

  // Count satisfaction distribution
  const satisfaction = {};
  satisfactionBreakdown.forEach(s => {
    if (s) satisfaction[s] = (satisfaction[s] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      avgRating: Math.round(avgRating * 10) / 10,
      totalFeedback,
      distribution,
      satisfaction,
    },
  });
};

/**
 * @desc    Update feedback
 * @route   PUT /api/feedback/:id
 * @access  Private
 */
const updateFeedback = async (req, res) => {
  const feedback = await Feedback.findOne({ _id: req.params.id, user: req.user._id });

  if (!feedback) {
    return res.status(404).json({ success: false, message: 'Feedback not found' });
  }

  const { rating, comment, resolutionSatisfaction } = req.body;
  if (rating) feedback.rating = rating;
  if (comment !== undefined) feedback.comment = comment;
  if (resolutionSatisfaction) feedback.resolutionSatisfaction = resolutionSatisfaction;

  await feedback.save();
  res.json({ success: true, message: 'Feedback updated', data: feedback });
};

module.exports = {
  submitFeedback,
  getComplaintFeedback,
  getFeedbackStats,
  updateFeedback,
};
