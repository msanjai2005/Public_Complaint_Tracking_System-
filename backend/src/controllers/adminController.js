const Complaint = require('../models/Complaint');
const User = require('../models/User');
const reportService = require('../services/reportService');
const notificationService = require('../services/notificationService');
const emailService = require('../utils/emailService');

/**
 * @desc    Get all complaints (admin)
 * @route   GET /api/complaints/admin/all
 * @access  Admin/Staff
 */
const getAllComplaints = async (req, res) => {
  const {
    status, priority, category, department, search,
    page = 1, limit = 10, sort = '-createdAt',
    startDate, endDate,
  } = req.query;

  const query = { isCancelled: false };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (department) query.department = department;
  if (startDate && endDate) {
    query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (search) {
    query.$or = [
      { complaintId: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('user', 'name email phone')
      .populate('category', 'name icon department')
      .populate('assignedTo', 'name email')
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
 * @desc    Get admin dashboard stats
 * @route   GET /api/complaints/admin/stats
 * @access  Admin/Staff
 */
const getStats = async (req, res) => {
  const stats = await reportService.getDashboardStats();
  res.json({ success: true, data: stats });
};

/**
 * @desc    Update complaint status
 * @route   PUT /api/complaints/admin/:id/status
 * @access  Admin/Staff
 */
const updateStatus = async (req, res) => {
  const { status, comment } = req.body;
  const validStatuses = ['pending', 'under-review', 'in-progress', 'resolved', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const complaint = await Complaint.findById(req.params.id).populate('user', 'name email');
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const oldStatus = complaint.status;
  complaint.status = status;

  // Add timeline entry
  complaint.timeline.push({
    status,
    comment: comment || `Status changed from ${oldStatus} to ${status}`,
    updatedBy: req.user._id,
  });

  // If resolved, calculate resolution time
  if (status === 'resolved' && !complaint.resolvedAt) {
    complaint.resolvedAt = new Date();
    complaint.resolutionTime = Math.round(
      (complaint.resolvedAt - complaint.createdAt) / (1000 * 60 * 60)
    );
  }

  await complaint.save();

  // Send email notification
  emailService.sendStatusUpdate(complaint.user, complaint, status);

  // Socket notification
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${complaint.user._id}`).emit('statusUpdate', {
      complaintId: complaint.complaintId,
      status,
      _id: complaint._id,
    });

    await notificationService.create({
      userId: complaint.user._id,
      title: 'Complaint Status Updated',
      message: `Your complaint ${complaint.complaintId} status changed to ${status.replace('-', ' ').toUpperCase()}`,
      type: 'complaint-update',
      relatedComplaint: complaint._id,
      io,
    });
  }

  res.json({ success: true, message: 'Status updated', data: complaint });
};

/**
 * @desc    Assign complaint to staff/department
 * @route   PUT /api/complaints/admin/:id/assign
 * @access  Admin
 */
const assignComplaint = async (req, res) => {
  const { assignedTo, department } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (assignedTo) {
    const staff = await User.findById(assignedTo);
    if (!staff || (staff.role !== 'staff' && staff.role !== 'admin')) {
      return res.status(400).json({ success: false, message: 'Invalid staff member' });
    }
    complaint.assignedTo = assignedTo;

    // Notify staff
    const io = req.app.get('io');
    await notificationService.create({
      userId: assignedTo,
      title: 'New Complaint Assigned',
      message: `Complaint ${complaint.complaintId} has been assigned to you.`,
      type: 'assignment',
      relatedComplaint: complaint._id,
      io,
    });
  }

  if (department) {
    complaint.department = department;
  }

  complaint.timeline.push({
    status: complaint.status,
    comment: `Assigned to ${department || 'staff'}`,
    updatedBy: req.user._id,
  });

  await complaint.save();
  await complaint.populate('assignedTo', 'name email');

  res.json({ success: true, message: 'Complaint assigned', data: complaint });
};

/**
 * @desc    Update complaint priority
 * @route   PUT /api/complaints/admin/:id/priority
 * @access  Admin/Staff
 */
const updatePriority = async (req, res) => {
  const { priority } = req.body;
  if (!['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ success: false, message: 'Invalid priority' });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.priority = priority;
  complaint.timeline.push({
    status: complaint.status,
    comment: `Priority changed to ${priority}`,
    updatedBy: req.user._id,
  });
  await complaint.save();

  res.json({ success: true, message: 'Priority updated', data: complaint });
};

/**
 * @desc    Add internal admin note
 * @route   POST /api/complaints/admin/:id/notes
 * @access  Admin/Staff
 */
const addNote = async (req, res) => {
  const { note } = req.body;
  if (!note || note.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Note content is required' });
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.internalNotes.push({
    admin: req.user._id,
    note: note.trim(),
  });
  await complaint.save();

  res.json({ success: true, message: 'Note added', data: complaint.internalNotes });
};

/**
 * @desc    Bulk status update
 * @route   PUT /api/complaints/admin/bulk-status
 * @access  Admin
 */
const bulkStatusUpdate = async (req, res) => {
  const { complaintIds, status, comment } = req.body;

  if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Complaint IDs required' });
  }

  const validStatuses = ['pending', 'under-review', 'in-progress', 'resolved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const updateResult = await Complaint.updateMany(
    { _id: { $in: complaintIds } },
    {
      $set: { status },
      $push: {
        timeline: {
          status,
          comment: comment || `Bulk status update to ${status}`,
          updatedBy: req.user._id,
          timestamp: new Date(),
        },
      },
    }
  );

  res.json({
    success: true,
    message: `${updateResult.modifiedCount} complaints updated`,
    data: { modifiedCount: updateResult.modifiedCount },
  });
};

/**
 * @desc    Export complaints to CSV
 * @route   GET /api/complaints/admin/export
 * @access  Admin
 */
const exportComplaints = async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const query = {};
  if (status) query.status = status;
  if (startDate && endDate) {
    query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const complaints = await Complaint.find(query)
    .populate('user', 'name email phone')
    .populate('category', 'name department')
    .sort('-createdAt');

  // Generate CSV
  const headers = 'Complaint ID,Title,Category,Department,Status,Priority,User,Email,Phone,Location,Created,Resolved\n';
  const rows = complaints.map(c => {
    return [
      c.complaintId,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category?.name || '',
      c.department || '',
      c.status,
      c.priority,
      c.user?.name || '',
      c.user?.email || '',
      c.user?.phone || '',
      `"${(c.location?.address || '').replace(/"/g, '""')}"`,
      c.createdAt.toISOString(),
      c.resolvedAt ? c.resolvedAt.toISOString() : '',
    ].join(',');
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=complaints_export.csv');
  res.send(headers + rows);
};

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
};

/**
 * @desc    Block/unblock user
 * @route   PUT /api/admin/users/:id/block
 * @access  Admin
 */
const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot block admin users' });
  }

  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    data: user,
  });
};

/**
 * @desc    Get dashboard reports
 * @route   GET /api/admin/reports/:type
 * @access  Admin
 */
const getReports = async (req, res) => {
  const { type } = req.params;

  let data;
  switch (type) {
    case 'daily': {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      data = await reportService.getComplaintsByDateRange(today, tomorrow);
      break;
    }
    case 'weekly': {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      data = await reportService.getComplaintsByDateRange(start, new Date());
      break;
    }
    case 'monthly': {
      data = await reportService.getMonthlyTrends(6);
      break;
    }
    case 'department': {
      data = await reportService.getDepartmentPerformance();
      break;
    }
    default:
      return res.status(400).json({ success: false, message: 'Invalid report type' });
  }

  res.json({ success: true, data });
};

module.exports = {
  getAllComplaints,
  getStats,
  updateStatus,
  assignComplaint,
  updatePriority,
  addNote,
  bulkStatusUpdate,
  exportComplaints,
  getAllUsers,
  toggleBlockUser,
  getReports,
};
