import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamation, HiOutlineStar, HiOutlineUserGroup, HiOutlineTrendingUp, HiArrowRight } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await adminService.getStats();
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const statCards = [
    { label: 'Total Complaints', value: stats?.totalComplaints || 0, icon: HiOutlineClipboardList, gradient: 'from-primary-500 to-primary-600' },
    { label: 'Pending', value: (stats?.statusBreakdown?.pending || 0) + (stats?.statusBreakdown?.['under-review'] || 0), icon: HiOutlineClock, gradient: 'from-warning-400 to-warning-500' },
    { label: 'Resolved', value: stats?.statusBreakdown?.resolved || 0, icon: HiOutlineCheckCircle, gradient: 'from-success-500 to-success-600' },
    { label: 'Overdue', value: stats?.overdueCount || 0, icon: HiOutlineExclamation, gradient: 'from-danger-400 to-danger-500' },
  ];

  const statusData = Object.entries(stats?.statusBreakdown || {}).map(([name, value]) => ({
    name: name.replace('-', ' ').replace(/^\w/, c => c.toUpperCase()),
    value,
  }));

  const categoryData = (stats?.categoryBreakdown || []).map(cat => ({
    name: cat._id,
    count: cat.count,
  }));

  const priorityData = Object.entries(stats?.priorityBreakdown || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="text-dark-500 text-sm mt-1">Overview of complaint management system</p>
          </div>
          <Link to="/admin/complaints" className="btn-primary flex items-center gap-2 text-sm">
            All Complaints <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="stat-card"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-800">{card.value}</p>
                <p className="text-xs text-dark-400 font-medium">{card.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Metrics row */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <HiOutlineClock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-dark-500">Avg Resolution Time</p>
                <p className="text-lg font-bold text-dark-800">{stats?.avgResolutionTime || 0} hours</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <HiOutlineStar className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-dark-500">Avg Satisfaction</p>
                <p className="text-lg font-bold text-dark-800">{stats?.avgRating || 0} / 5.0</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <HiOutlineTrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-dark-500">Total Feedback</p>
                <p className="text-lg font-bold text-dark-800">{stats?.totalFeedback || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="card">
            <h3 className="text-sm font-bold text-dark-700 mb-4">Status Distribution</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-dark-400">No data</div>
            )}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-dark-500">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h3 className="text-sm font-bold text-dark-700 mb-4">By Category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-dark-400">No data</div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { to: '/admin/complaints', label: 'Manage Complaints', icon: '📋', desc: 'View and manage all complaints' },
            { to: '/admin/users', label: 'User Management', icon: '👥', desc: 'Manage registered users' },
            { to: '/admin/categories', label: 'Categories', icon: '📂', desc: 'Manage complaint categories' },
          ].map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className="card group hover:border-primary-200 flex items-center gap-4"
            >
              <span className="text-3xl">{link.icon}</span>
              <div>
                <p className="font-bold text-dark-700 group-hover:text-primary-600 transition-colors">{link.label}</p>
                <p className="text-xs text-dark-400">{link.desc}</p>
              </div>
              <HiArrowRight className="w-5 h-5 text-dark-300 ml-auto group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
