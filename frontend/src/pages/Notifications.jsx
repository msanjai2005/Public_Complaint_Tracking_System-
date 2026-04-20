import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import adminService from '../services/adminService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatRelativeTime } from '../utils/formatters';
import { HiOutlineBell, HiOutlineCheck, HiOutlineCheckCircle, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const { data } = await adminService.getNotifications({ limit: 50 });
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await adminService.markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminService.markAllRead();
      toast.success('All marked as read');
      loadNotifications();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'complaint-update': return '📋';
      case 'assignment': return '👤';
      case 'reminder': return '⏰';
      default: return '🔔';
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="page-container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <HiOutlineBell className="w-7 h-7" /> Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-primary-500 font-medium mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary text-sm flex items-center gap-1.5">
              <HiOutlineCheckCircle className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-4">🔔</p>
            <p className="text-lg font-semibold text-dark-600">No notifications</p>
            <p className="text-sm text-dark-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`card !p-4 flex items-start gap-3 ${!notif.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}
              >
                <span className="text-xl mt-0.5">{getIcon(notif.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.isRead ? 'font-semibold text-dark-800' : 'text-dark-600'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-dark-400">{formatRelativeTime(notif.createdAt)}</span>
                    {notif.relatedComplaint && (
                      <Link
                        to={`/complaints/${notif.relatedComplaint._id || notif.relatedComplaint}`}
                        className="text-[11px] text-primary-500 hover:text-primary-600 font-medium"
                      >
                        View Complaint →
                      </Link>
                    )}
                  </div>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif._id)}
                    className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-400 hover:text-primary-600 transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Notifications;
