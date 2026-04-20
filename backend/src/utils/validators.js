const { body, param, query } = require('express-validator');

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const complaintValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description must be 20-2000 characters'),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('location.address').optional().trim(),
];

const commentValidation = [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters'),
];

const feedbackValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  body('resolutionSatisfaction').optional().isIn(['very-satisfied', 'satisfied', 'neutral', 'unsatisfied']),
];

const categoryValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Category name must be 2-50 characters'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('slaHours').optional().isInt({ min: 1 }).withMessage('SLA must be at least 1 hour'),
];

module.exports = {
  registerValidation,
  loginValidation,
  complaintValidation,
  commentValidation,
  feedbackValidation,
  categoryValidation,
};
