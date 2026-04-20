import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import adminService from '../services/adminService';
import ComplaintCard from '../components/complaints/ComplaintCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import toast from 'react-hot-toast';
import { HiOutlineFilter, HiOutlineSearch, HiOutlineDownload, HiOutlineRefresh } from 'react-icons/hi';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', department: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: '-createdAt' };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.department) params.department = filters.department;

      const { data } = await adminService.getAllComplaints(params);
      setComplaints(data.data.complaints);
      setTotalPages(data.data.pages);
      setTotal(data.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(); }, [page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadComplaints();
  };

  const handleExport = async () => {
    try {
      const res = await adminService.exportComplaints({ ...filters });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'complaints_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export downloaded');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleBulkUpdate = async () => {
    if (!selectedIds.length || !bulkStatus) return;
    try {
      await adminService.bulkStatusUpdate({ complaintIds: selectedIds, status: bulkStatus });
      toast.success(`${selectedIds.length} complaints updated`);
      setSelectedIds([]);
      setBulkStatus('');
      loadComplaints();
    } catch (err) {
      toast.error('Bulk update failed');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">All Complaints</h1>
            <p className="text-dark-500 text-sm mt-1">{total} total complaints</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadComplaints} className="btn-secondary !py-2 text-sm flex items-center gap-1.5">
              <HiOutlineRefresh className="w-4 h-4" /> Refresh
            </button>
            <button onClick={handleExport} className="btn-secondary !py-2 text-sm flex items-center gap-1.5">
              <HiOutlineDownload className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary !py-2 text-sm flex items-center gap-1.5
                ${(filters.status || filters.priority) ? '!border-primary-300 !bg-primary-50 !text-primary-600' : ''}`}
            >
              <HiOutlineFilter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search by ID, title, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-10 !py-2.5"
              />
            </div>
            <button type="submit" className="btn-primary !py-2.5 text-sm">Search</button>
          </form>

          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-dark-100">
              <div className="flex-1 min-w-[140px]">
                <label className="label-field">Status</label>
                <select value={filters.status} onChange={(e) => { setFilters({...filters, status: e.target.value}); setPage(1); }} className="select-field !py-2">
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="under-review">Under Review</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="label-field">Priority</label>
                <select value={filters.priority} onChange={(e) => { setFilters({...filters, priority: e.target.value}); setPage(1); }} className="select-field !py-2">
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button onClick={() => { setFilters({ status: '', priority: '', department: '' }); setSearch(''); setPage(1); }} className="btn-secondary !py-2 text-sm self-end">
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card mb-4 bg-primary-50 border-primary-200 flex items-center gap-4">
            <span className="text-sm font-semibold text-primary-700">{selectedIds.length} selected</span>
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="select-field !py-2 !w-auto text-sm">
              <option value="">Select status...</option>
              <option value="under-review">Under Review</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={handleBulkUpdate} disabled={!bulkStatus} className="btn-primary !py-2 text-sm">Apply</button>
            <button onClick={() => setSelectedIds([])} className="btn-secondary !py-2 text-sm">Cancel</button>
          </motion.div>
        )}

        {/* List */}
        {loading ? (
          <LoadingSpinner />
        ) : complaints.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold text-dark-600">No complaints found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint, i) => (
              <div key={complaint._id} className="flex gap-3 items-start">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(complaint._id)}
                  onChange={() => toggleSelect(complaint._id)}
                  className="mt-6 w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <ComplaintCard complaint={complaint} index={i} showUser />
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </motion.div>
    </div>
  );
};

export default AdminComplaints;
