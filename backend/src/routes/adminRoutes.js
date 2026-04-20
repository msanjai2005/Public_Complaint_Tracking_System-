const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getAllUsers,
  toggleBlockUser,
  getReports,
} = require('../controllers/adminController');

// User management
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/block', protect, adminOnly, toggleBlockUser);

// Reports
router.get('/reports/:type', protect, adminOnly, getReports);

module.exports = router;
