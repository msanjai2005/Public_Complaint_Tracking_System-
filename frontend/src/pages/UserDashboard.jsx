import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import complaintService from '../services/complaintService';
import ComplaintCard from '../components/complaints/ComplaintCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiOutlinePlusCircle, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineEye } from 'react-icons/hi';
import { formatResolutionTime } from '../utils/formatters';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          complaintService.getMyStats(),
          complaintService.getMyComplaints({ limit: 5, sort: '-createdAt' }),
        ]);
        setStats(statsRes.data.data);
        setRecentComplaints(complaintsRes.data.data.complaints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const statCards = [
    { label: 'Total', value: stats?.total || 0, icon: HiOutlineExclamation, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50' },
    { label: 'Pending', value: (stats?.pending || 0) + (stats?.['under-review'] || 0), icon: HiOutlineClock, color: 'from-warning-400 to-warning-500', bg: 'bg-warning-50' },
    { label: 'In Progress', value: stats?.['in-progress'] || 0, icon: HiOutlineEye, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    { label: 'Resolved', value: stats?.resolved || 0, icon: HiOutlineCheckCircle, color: 'from-success-500 to-success-600', bg: 'bg-success-50' },
  ];

  return (
    <div className="page-container">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="section-title mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-dark-500">Here's an overview of your complaints and their status.</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-800">{stat.value}</p>
              <p className="text-xs text-dark-400 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Avg resolution time */}
      {stats?.avgResolutionTime > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mb-8 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <HiOutlineClock className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Average Resolution Time</p>
              <p className="text-lg font-bold text-dark-800">{formatResolutionTime(stats.avgResolutionTime)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Link
          to="/complaints/new"
          className="flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/50 hover:bg-primary-50 transition-all group"
        >
          <HiOutlinePlusCircle className="w-8 h-8 text-primary-400 group-hover:text-primary-500 transition-colors" />
          <div>
            <p className="font-bold text-primary-600 text-lg">File a New Complaint</p>
            <p className="text-sm text-primary-400">Report a civic issue in your area</p>
          </div>
        </Link>
      </motion.div>

      {/* Recent complaints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-800 font-display">Recent Complaints</h2>
          <Link to="/complaints/my" className="text-sm text-primary-500 hover:text-primary-600 font-semibold">
            View All →
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-dark-500 font-medium">No complaints filed yet</p>
            <p className="text-sm text-dark-400 mt-1">File your first complaint to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint, i) => (
              <ComplaintCard key={complaint._id} complaint={complaint} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserDashboard;
