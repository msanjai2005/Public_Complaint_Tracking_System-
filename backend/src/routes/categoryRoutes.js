const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { categoryValidation } = require('../utils/validators');
const {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Public
router.get('/', getCategories);

// Admin
router.get('/admin/all', protect, adminOnly, getAllCategories);
router.post('/admin', protect, adminOnly, categoryValidation, createCategory);
router.put('/admin/:id', protect, adminOnly, updateCategory);
router.delete('/admin/:id', protect, adminOnly, deleteCategory);

module.exports = router;
