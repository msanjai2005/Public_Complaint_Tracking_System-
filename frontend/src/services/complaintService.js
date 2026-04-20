import api from './api';

export const complaintService = {
  // User endpoints
  create: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyComplaints: (params) => api.get('/complaints/my', { params }),
  getMyStats: () => api.get('/complaints/my/stats'),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  updateComplaint: (id, formData) => api.put(`/complaints/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  cancelComplaint: (id) => api.delete(`/complaints/${id}`),
  addComment: (id, text) => api.post(`/complaints/${id}/comments`, { text }),
  getTimeline: (id) => api.get(`/complaints/${id}/timeline`),

  // Public tracking
  track: (trackingId) => api.get(`/complaints/track/${trackingId}`),

  // Categories
  getCategories: () => api.get('/categories'),
};

export default complaintService;
