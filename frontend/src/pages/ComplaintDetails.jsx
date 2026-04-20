import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import complaintService from '../services/complaintService';
import adminService from '../services/adminService';
import StatusBadge from '../components/common/StatusBadge';
import ComplaintTimeline from '../components/complaints/ComplaintTimeline';
import RatingStars from '../components/common/RatingStars';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { formatDateTime, formatResolutionTime, getPriorityColor } from '../utils/formatters';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineUser, HiOutlineChat, HiOutlinePaperAirplane } from 'react-icons/hi';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user, isAdminOrStaff } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '', resolutionSatisfaction: 'satisfied' });
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    try {
      const { data } = await complaintService.getComplaint(id);
      setComplaint(data.data);

      // Load feedback if resolved
      if (data.data.status === 'resolved') {
        try {
          const fbRes = await adminService.getComplaintFeedback(id);
          setExistingFeedback(fbRes.data.data);
        } catch (e) {}
      }
    } catch (err) {
      toast.error('Complaint not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setAddingComment(true);
    try {
      await complaintService.addComment(id, comment);
      setComment('');
      await loadComplaint();
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      await adminService.updateStatus(id, { status: newStatus, comment: statusComment });
      setStatusModal(false);
      setNewStatus('');
      setStatusComment('');
      await loadComplaint();
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleFeedback = async () => {
    if (feedback.rating === 0) return toast.error('Please select a rating');
    try {
      await adminService.submitFeedback({
        complaintId: id,
        rating: feedback.rating,
        comment: feedback.comment,
        resolutionSatisfaction: feedback.resolutionSatisfaction,
      });
      setFeedbackModal(false);
      toast.success('Feedback submitted');
      loadComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!complaint) return null;

  const priorityColor = getPriorityColor(complaint.priority);

  return (
    <div className="page-container max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-lg">
                  {complaint.complaintId}
                </span>
                <span className={`badge ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border}`}>
                  {complaint.priority?.toUpperCase()} PRIORITY
                </span>
              </div>
              <h1 className="text-2xl font-bold text-dark-900 font-display">{complaint.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={complaint.status} size="lg" />
              {isAdminOrStaff && complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
                <button
                  onClick={() => setStatusModal(true)}
                  className="btn-primary !py-2 text-sm"
                >
                  Update Status
                </button>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-dark-500">
            <span className="flex items-center gap-1">
              {complaint.category?.icon} {complaint.category?.name}
            </span>
            {complaint.location?.address && (
              <span className="flex items-center gap-1">
                <HiOutlineLocationMarker className="w-4 h-4" />
                {complaint.location.address}
              </span>
            )}
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-4 h-4" />
              {formatDateTime(complaint.createdAt)}
            </span>
            {complaint.department && (
              <span className="flex items-center gap-1">
                <HiOutlineUser className="w-4 h-4" />
                Dept: {complaint.department}
              </span>
            )}
            {complaint.resolutionTime && (
              <span className="flex items-center gap-1 text-success-600 font-medium">
                ✓ Resolved in {formatResolutionTime(complaint.resolutionTime)}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h3 className="text-sm font-bold text-dark-700 mb-3">Description</h3>
              <p className="text-dark-600 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Images */}
            {complaint.images?.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-bold text-dark-700 mb-3">Attached Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {complaint.images.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-dark-100">
                      <img src={img} alt={`Complaint image ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="card">
              <h3 className="text-sm font-bold text-dark-700 mb-4 flex items-center gap-2">
                <HiOutlineChat className="w-4 h-4" /> Comments ({complaint.comments?.length || 0})
              </h3>

              <div className="space-y-4 mb-4">
                {complaint.comments?.length === 0 && (
                  <p className="text-sm text-dark-400 text-center py-4">No comments yet</p>
                )}
                {complaint.comments?.map((c, i) => (
                  <div key={i} className={`flex gap-3 ${c.isAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${c.isAdmin ? 'bg-gradient-to-br from-primary-400 to-accent-400' : 'bg-dark-100'}`}>
                      <span className={`text-xs font-bold ${c.isAdmin ? 'text-white' : 'text-dark-500'}`}>
                        {c.user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className={`flex-1 ${c.isAdmin ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-xl text-sm max-w-[85%]
                        ${c.isAdmin ? 'bg-primary-50 text-dark-700' : 'bg-dark-50 text-dark-600'}`}>
                        {c.text}
                      </div>
                      <p className="text-[10px] text-dark-400 mt-1">
                        {c.user?.name} • {formatDateTime(c.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              {complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
                <div className="flex gap-2 pt-4 border-t border-dark-100">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="input-field flex-1 !py-2.5"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    id="comment-input"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={addingComment || !comment.trim()}
                    className="btn-primary !py-2.5 !px-4"
                    id="comment-submit"
                  >
                    <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                  </button>
                </div>
              )}
            </div>

            {/* Feedback section */}
            {complaint.status === 'resolved' && !isAdminOrStaff && (
              <div className="card bg-gradient-to-r from-success-50 to-green-50 border-success-100">
                {existingFeedback ? (
                  <div>
                    <h3 className="text-sm font-bold text-dark-700 mb-2">Your Feedback</h3>
                    <RatingStars value={existingFeedback.rating} readonly />
                    {existingFeedback.comment && (
                      <p className="text-sm text-dark-500 mt-2">"{existingFeedback.comment}"</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-dark-700 font-semibold mb-2">This complaint has been resolved!</p>
                    <p className="text-sm text-dark-500 mb-4">Please share your feedback on the resolution.</p>
                    <button onClick={() => setFeedbackModal(true)} className="btn-success text-sm">
                      Give Feedback
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="card">
              <h3 className="text-sm font-bold text-dark-700 mb-4">Resolution Timeline</h3>
              <ComplaintTimeline timeline={complaint.timeline} />
            </div>

            {/* Assigned to */}
            {complaint.assignedTo && (
              <div className="card">
                <h3 className="text-sm font-bold text-dark-700 mb-3">Assigned To</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-accent-300 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{complaint.assignedTo.name?.[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-700">{complaint.assignedTo.name}</p>
                    <p className="text-xs text-dark-400">{complaint.assignedTo.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin: Internal notes */}
            {isAdminOrStaff && complaint.internalNotes?.length > 0 && (
              <div className="card bg-yellow-50 border-yellow-100">
                <h3 className="text-sm font-bold text-dark-700 mb-3">🔒 Internal Notes</h3>
                <div className="space-y-2">
                  {complaint.internalNotes.map((note, i) => (
                    <div key={i} className="text-sm text-dark-600 p-2 bg-white/80 rounded-lg">
                      <p>{note.note}</p>
                      <p className="text-[10px] text-dark-400 mt-1">{formatDateTime(note.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Status Update Modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Status">
        <div className="space-y-4">
          <div>
            <label className="label-field">New Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="select-field">
              <option value="">Select status...</option>
              <option value="under-review">Under Review</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="label-field">Comment (optional)</label>
            <textarea
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              className="textarea-field"
              rows={3}
              placeholder="Add a note about this status change..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setStatusModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleStatusUpdate} className="btn-primary" disabled={!newStatus}>Update Status</button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal isOpen={feedbackModal} onClose={() => setFeedbackModal(false)} title="Submit Feedback">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-dark-500 mb-3">How would you rate the resolution?</p>
            <RatingStars value={feedback.rating} onChange={(r) => setFeedback({ ...feedback, rating: r })} size="lg" />
          </div>
          <div>
            <label className="label-field">Satisfaction Level</label>
            <select
              value={feedback.resolutionSatisfaction}
              onChange={(e) => setFeedback({ ...feedback, resolutionSatisfaction: e.target.value })}
              className="select-field"
            >
              <option value="very-satisfied">Very Satisfied 😄</option>
              <option value="satisfied">Satisfied 🙂</option>
              <option value="neutral">Neutral 😐</option>
              <option value="unsatisfied">Unsatisfied 😞</option>
            </select>
          </div>
          <div>
            <label className="label-field">Comment (optional)</label>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              className="textarea-field"
              rows={3}
              placeholder="Share your experience..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setFeedbackModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleFeedback} className="btn-success">Submit Feedback</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintDetails;
