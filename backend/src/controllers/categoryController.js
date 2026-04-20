const { validationResult } = require('express-validator');
const Category = require('../models/Category');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.json({ success: true, data: categories });
};

/**
 * @desc    Get all categories (admin - including inactive)
 * @route   GET /api/categories/admin/all
 * @access  Admin
 */
const getAllCategories = async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, data: categories });
};

/**
 * @desc    Create category
 * @route   POST /api/categories/admin
 * @access  Admin
 */
const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, description, department, slaHours, icon } = req.body;

  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Category already exists' });
  }

  const category = await Category.create({ name, description, department, slaHours, icon });
  res.status(201).json({ success: true, message: 'Category created', data: category });
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/admin/:id
 * @access  Admin
 */
const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  res.json({ success: true, message: 'Category updated', data: category });
};

/**
 * @desc    Delete category (soft delete - deactivate)
 * @route   DELETE /api/categories/admin/:id
 * @access  Admin
 */
const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  res.json({ success: true, message: 'Category deactivated', data: category });
};

module.exports = {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
