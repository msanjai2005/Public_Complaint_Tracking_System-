const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { feedbackValidation } = require('../utils/validators');
const {
  submitFeedback,
  getComplaintFeedback,
  getFeedbackStats,
  updateFeedback,
} = require('../controllers/feedbackController');

router.post('/', protect, feedbackValidation, submitFeedback);
router.get('/complaint/:complaintId', protect, getComplaintFeedback);
router.get('/stats', protect, admin, getFeedbackStats);
router.put('/:id', protect, updateFeedback);

module.exports = router;
