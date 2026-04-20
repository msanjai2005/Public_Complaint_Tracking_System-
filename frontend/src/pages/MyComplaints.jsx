import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import complaintService from '../services/complaintService';
import ComplaintCard from '../components/complaints/ComplaintCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [showFilters, setShowFilters] = useState(false);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: '-createdAt' };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const { data } = await complaintService.getMyComplaints(params);
      setComplaints(data.data.complaints);
      setTotalPages(data.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(); }, [page, filters]);

  const clearFilters = () => {
    setFilters({ status: '', priority: '' });
    setPage(1);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">My Complaints</h1>
            <p className="text-dark-500 text-sm mt-1">Track and manage all your filed complaints</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 !py-2 text-sm
              ${(filters.status || filters.priority) ? '!border-primary-300 !bg-primary-50 !text-primary-600' : ''}`}
          >
            <HiOutlineFilter className="w-4 h-4" />
            Filters {(filters.status || filters.priority) ? '•' : ''}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card mb-6"
          >
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="label-field">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
                  className="select-field"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under-review">Under Review</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="label-field">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => { setFilters({ ...filters, priority: e.target.value }); setPage(1); }}
                  className="select-field"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button onClick={clearFilters} className="btn-secondary !py-2.5 text-sm">Clear</button>
            </div>
          </motion.div>
        )}

        {/* List */}
        {loading ? (
          <LoadingSpinner />
        ) : complaints.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold text-dark-600">No complaints found</p>
            <p className="text-sm text-dark-400 mt-1">
              {filters.status || filters.priority
                ? 'Try adjusting your filters'
                : 'File your first complaint to get started'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint, i) => (
              <ComplaintCard key={complaint._id} complaint={complaint} index={i} />
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </motion.div>
    </div>
  );
};

export default MyComplaints;
