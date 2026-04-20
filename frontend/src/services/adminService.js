import api from './api';

export const adminService = {
  // Complaints
  getAllComplaints: (params) => api.get('/complaints/admin/all', { params }),
  getStats: () => api.get('/complaints/admin/stats'),
  updateStatus: (id, data) => api.put(`/complaints/admin/${id}/status`, data),
  assignComplaint: (id, data) => api.put(`/complaints/admin/${id}/assign`, data),
  updatePriority: (id, data) => api.put(`/complaints/admin/${id}/priority`, data),
  addNote: (id, note) => api.post(`/complaints/admin/${id}/notes`, { note }),
  bulkStatusUpdate: (data) => api.put('/complaints/admin/bulk-status', data),
  exportComplaints: (params) => api.get('/complaints/admin/export', {
    params,
    responseType: 'blob',
  }),

  // Users
  getAllUsers: (params) => api.get('/admin/users', { params }),
  toggleBlockUser: (id) => api.put(`/admin/users/${id}/block`),

  // Categories
  getAllCategories: () => api.get('/categories/admin/all'),
  createCategory: (data) => api.post('/categories/admin', data),
  updateCategory: (id, data) => api.put(`/categories/admin/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/admin/${id}`),

  // Reports
  getReport: (type) => api.get(`/admin/reports/${type}`),

  // Feedback
  getFeedbackStats: () => api.get('/feedback/stats'),

  // Notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),

  // Feedback for complaint
  submitFeedback: (data) => api.post('/feedback', data),
  getComplaintFeedback: (complaintId) => api.get(`/feedback/complaint/${complaintId}`),
};

export default adminService;
