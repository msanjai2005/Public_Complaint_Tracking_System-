const Complaint = require('../models/Complaint');
const Feedback = require('../models/Feedback');

class ReportService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [totalComplaints, statusStats, priorityStats, categoryStats] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        { $unwind: '$categoryInfo' },
        { $group: { _id: '$categoryInfo.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Calculate average resolution time
    const resolvedComplaints = await Complaint.find({
      status: 'resolved',
      resolutionTime: { $exists: true },
    }).select('resolutionTime');

    const avgResolutionTime = resolvedComplaints.length > 0
      ? resolvedComplaints.reduce((sum, c) => sum + (c.resolutionTime || 0), 0) / resolvedComplaints.length
      : 0;

    // Overdue complaints (pending/in-progress for more than 48 hours)
    const overdueDate = new Date();
    overdueDate.setHours(overdueDate.getHours() - 48);
    const overdueCount = await Complaint.countDocuments({
      status: { $in: ['pending', 'under-review', 'in-progress'] },
      createdAt: { $lt: overdueDate },
    });

    // Average feedback rating
    const ratingStats = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalFeedback: { $sum: 1 } } },
    ]);

    return {
      totalComplaints,
      statusBreakdown: statusStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      priorityBreakdown: priorityStats.reduce((acc, p) => ({ ...acc, [p._id]: p.count }), {}),
      categoryBreakdown: categoryStats,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      overdueCount,
      avgRating: ratingStats[0]?.avgRating ? Math.round(ratingStats[0].avgRating * 10) / 10 : 0,
      totalFeedback: ratingStats[0]?.totalFeedback || 0,
    };
  }

  /**
   * Get complaints by date range
   */
  async getComplaintsByDateRange(startDate, endDate) {
    return Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get department performance
   */
  async getDepartmentPerformance() {
    return Complaint.aggregate([
      { $match: { department: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgResolutionTime: { $avg: '$resolutionTime' },
        },
      },
      {
        $addFields: {
          resolutionRate: {
            $multiply: [{ $divide: ['$resolved', '$total'] }, 100],
          },
        },
      },
      { $sort: { resolutionRate: -1 } },
    ]);
  }

  /**
   * Get monthly trends
   */
  async getMonthlyTrends(months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return Complaint.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  }
}

module.exports = new ReportService();
