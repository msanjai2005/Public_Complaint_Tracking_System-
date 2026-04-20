import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { HiOutlineDocumentReport, HiOutlineCalendar } from 'react-icons/hi';

const AdminReports = () => {
  const [reportType, setReportType] = useState('weekly');
  const [reportData, setReportData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [report, dept, feedback] = await Promise.all([
          adminService.getReport(reportType),
          adminService.getReport('department'),
          adminService.getFeedbackStats(),
        ]);
        setReportData(report.data.data);
        setDepartmentData(dept.data.data);
        setFeedbackStats(feedback.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, [reportType]);

  if (loading) return <LoadingSpinner fullScreen />;

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: 'none',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '13px',
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <HiOutlineDocumentReport className="w-7 h-7" /> Reports & Analytics
            </h1>
          </div>
          <div className="flex gap-1 bg-dark-100 rounded-xl p-1">
            {['daily', 'weekly', 'monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize
                  ${reportType === type ? 'bg-white text-dark-800 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints over time */}
        <div className="card mb-6">
          <h3 className="text-sm font-bold text-dark-700 mb-4">
            <HiOutlineCalendar className="inline w-4 h-4 mr-1" /> 
            Complaints Over Time ({reportType})
          </h3>
          {reportData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="count" name="Total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-400">No data for this period</div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Department Performance */}
          <div className="card">
            <h3 className="text-sm font-bold text-dark-700 mb-4">Department Performance</h3>
            {departmentData.length > 0 ? (
              <div className="space-y-3">
                {departmentData.map((dept, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-dark-700">{dept._id}</span>
                        <span className="text-xs text-dark-400">
                          {dept.resolved}/{dept.total} resolved
                        </span>
                      </div>
                      <div className="w-full bg-dark-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.round(dept.resolutionRate || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-dark-700 w-12 text-right">
                      {Math.round(dept.resolutionRate || 0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400 text-sm text-center py-8">No department data</p>
            )}
          </div>

          {/* Feedback Stats */}
          <div className="card">
            <h3 className="text-sm font-bold text-dark-700 mb-4">Feedback Overview</h3>
            {feedbackStats ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                  <p className="text-3xl font-bold text-dark-800">{feedbackStats.avgRating || 0}</p>
                  <p className="text-sm text-dark-500">Average Rating (out of 5)</p>
                  <p className="text-xs text-dark-400 mt-1">{feedbackStats.totalFeedback || 0} total feedback</p>
                </div>

                {/* Rating distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = feedbackStats.distribution?.[star] || 0;
                    const pct = feedbackStats.totalFeedback ? Math.round((count / feedbackStats.totalFeedback) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-8 text-dark-500 font-medium">{star}★</span>
                        <div className="flex-1 bg-dark-100 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="w-8 text-right text-dark-400 text-xs">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-dark-400 text-sm text-center py-8">No feedback data</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminReports;
