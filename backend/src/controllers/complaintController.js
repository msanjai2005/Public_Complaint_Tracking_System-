const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const generateComplaintId = require('../utils/generateComplaintId');
const emailService = require('../utils/emailService');
const notificationService = require('../services/notificationService');

/**
 * @desc    Create new complaint
 * @route   POST /api/complaints
 * @access  Private
 */
const createComplaint = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { title, description, category, priority, location } = req.body;

  // Verify category exists
  const cat = await Category.findById(category);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  // Handle uploaded images
  const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

  // Generate complaint ID
  const complaintId = await generateComplaintId();

  const complaint = await Complaint.create({
    complaintId,
    user: req.user._id,
    category,
    title,
    description,
    priority: priority || 'medium',
    location: location ? JSON.parse(location) : {},
    images,
    department: cat.department,
  });

  await complaint.populate([
    { path: 'user', select: 'name email phone' },
    { path: 'category', select: 'name icon department' },
  ]);

  // Send notification
  emailService.sendComplaintRegistered(req.user, complaint);

  // Socket notification for admins
  const io = req.app.get('io');
  if (io) {
    io.to('admin_room').emit('newComplaint', complaint);
    await notificationService.create({
      userId: req.user._id,
      title: 'Complaint Registered',
      message: `Your complaint ${complaintId} has been registered successfully.`,
      type: 'complaint-update',
      relatedComplaint: complaint._id,
      io,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Complaint filed successfully',
    data: complaint,
  });
};

/**
 * @desc    Get logged-in user's complaints
 * @route   GET /api/complaints/my
 * @access  Private
 */
const getMyComplaints = async (req, res) => {
  const { status, priority, category, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const query = { user: req.user._id, isCancelled: false };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('category', 'name icon department')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Complaint.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      complaints,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
};

/**
 * @desc    Get specific complaint details
 * @route   GET /api/complaints/:id
 * @access  Private
 */
const getComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('category', 'name icon department slaHours')
    .populate('timeline.updatedBy', 'name role')
    .populate('comments.user', 'name avatar role')
    .populate('assignedTo', 'name email');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  // Users can only see their own complaints (admins can see all)
  if (req.user.role === 'user' && complaint.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
  }

  // Remove internal notes for non-admin users
  if (req.user.role === 'user') {
    complaint.internalNotes = undefined;
  }

  res.json({ success: true, data: complaint });
};

/**
 * @desc    Update complaint (if pending)
 * @route   PUT /api/complaints/:id
 * @access  Private
 */
const updateComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (complaint.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (complaint.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Can only edit complaints with pending status' });
  }

  const { title, description, priority, location } = req.body;
  if (title) complaint.title = title;
  if (description) complaint.description = description;
  if (priority) complaint.priority = priority;
  if (location) complaint.location = JSON.parse(location);

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(f => `/uploads/${f.filename}`);
    complaint.images = [...complaint.images, ...newImages].slice(0, 5);
  }

  await complaint.save();
  await complaint.populate([
    { path: 'category', select: 'name icon department' },
  ]);

  res.json({ success: true, message: 'Complaint updated', data: complaint });
};

/**
 * @desc    Cancel complaint (within 24 hours)
 * @route   DELETE /api/complaints/:id
 * @access  Private
 */
const cancelComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (complaint.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Check if within 24 hours
  const hoursSinceCreation = (Date.now() - complaint.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24) {
    return res.status(400).json({ success: false, message: 'Can only cancel within 24 hours of filing' });
  }

  complaint.isCancelled = true;
  complaint.status = 'rejected';
  complaint.timeline.push({
    status: 'rejected',
    comment: 'Cancelled by user',
    updatedBy: req.user._id,
  });
  await complaint.save();

  res.json({ success: true, message: 'Complaint cancelled successfully' });
};

/**
 * @desc    Add comment to complaint
 * @route   POST /api/complaints/:id/comments
 * @access  Private
 */
const addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

  // Users can only comment on their own complaints
  if (!isAdmin && complaint.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  complaint.comments.push({
    user: req.user._id,
    text: req.body.text,
    isAdmin,
  });
  await complaint.save();

  // Notify the other party
  const io = req.app.get('io');
  if (isAdmin) {
    await notificationService.create({
      userId: complaint.user,
      title: 'New Comment on Complaint',
      message: `Admin commented on your complaint ${complaint.complaintId}`,
      type: 'complaint-update',
      relatedComplaint: complaint._id,
      io,
    });
  }

  await complaint.populate('comments.user', 'name avatar role');

  res.status(201).json({
    success: true,
    message: 'Comment added',
    data: complaint.comments[complaint.comments.length - 1],
  });
};

/**
 * @desc    Get complaint timeline
 * @route   GET /api/complaints/:id/timeline
 * @access  Private
 */
const getTimeline = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .select('timeline complaintId status')
    .populate('timeline.updatedBy', 'name role');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  res.json({ success: true, data: complaint.timeline });
};

/**
 * @desc    Track complaint without auth (public)
 * @route   GET /api/complaints/track/:trackingId
 * @access  Public
 */
const trackComplaint = async (req, res) => {
  const complaint = await Complaint.findOne({ complaintId: req.params.trackingId })
    .select('complaintId title status priority createdAt timeline category department')
    .populate('category', 'name icon')
    .populate('timeline.updatedBy', 'name');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found. Check your tracking ID.' });
  }

  res.json({ success: true, data: complaint });
};

/**
 * @desc    Get user complaint stats
 * @route   GET /api/complaints/my/stats
 * @access  Private
 */
const getMyStats = async (req, res) => {
  const stats = await Complaint.aggregate([
    { $match: { user: req.user._id, isCancelled: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const breakdown = stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

  // Average resolution time for the user's resolved complaints
  const resolvedComplaints = await Complaint.find({
    user: req.user._id,
    status: 'resolved',
    resolutionTime: { $exists: true },
  }).select('resolutionTime');

  const avgResolutionTime = resolvedComplaints.length > 0
    ? resolvedComplaints.reduce((sum, c) => sum + (c.resolutionTime || 0), 0) / resolvedComplaints.length
    : 0;

  res.json({
    success: true,
    data: {
      total,
      ...breakdown,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
    },
  });
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaint,
  updateComplaint,
  cancelComplaint,
  addComment,
  getTimeline,
  trackComplaint,
  getMyStats,
};
