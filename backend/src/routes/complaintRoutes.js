const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const upload = require('../middleware/upload');
const { complaintValidation, commentValidation } = require('../utils/validators');
const {
  createComplaint,
  getMyComplaints,
  getComplaint,
  updateComplaint,
  cancelComplaint,
  addComment,
  getTimeline,
  trackComplaint,
  getMyStats,
} = require('../controllers/complaintController');
const {
  getAllComplaints,
  getStats,
  updateStatus,
  assignComplaint,
  updatePriority,
  addNote,
  bulkStatusUpdate,
  exportComplaints,
} = require('../controllers/adminController');

// Public tracking route
router.get('/track/:trackingId', trackComplaint);

// User routes (authenticated)
router.post('/', protect, upload.array('images', 5), complaintValidation, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/my/stats', protect, getMyStats);
router.get('/:id', protect, getComplaint);
router.put('/:id', protect, upload.array('images', 5), updateComplaint);
router.delete('/:id', protect, cancelComplaint);
router.post('/:id/comments', protect, commentValidation, addComment);
router.get('/:id/timeline', protect, getTimeline);

// Admin routes
router.get('/admin/all', protect, admin, getAllComplaints);
router.get('/admin/stats', protect, admin, getStats);
router.put('/admin/:id/status', protect, admin, updateStatus);
router.put('/admin/:id/assign', protect, admin, assignComplaint);
router.put('/admin/:id/priority', protect, admin, updatePriority);
router.post('/admin/:id/notes', protect, admin, addNote);
router.put('/admin/bulk-status', protect, admin, bulkStatusUpdate);
router.get('/admin/export', protect, admin, exportComplaints);

module.exports = router;
