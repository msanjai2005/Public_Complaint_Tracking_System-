import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatRelativeTime, getPriorityColor, truncateText } from '../../utils/formatters';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineChat } from 'react-icons/hi';

const ComplaintCard = ({ complaint, index = 0, showUser = false }) => {
  const priorityColor = getPriorityColor(complaint.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={showUser ? `/admin/complaints/${complaint._id}` : `/complaints/${complaint._id}`}
        className="block card hover:border-primary-200 group"
        id={`complaint-card-${complaint.complaintId}`}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-md">
                {complaint.complaintId}
              </span>
              <span className={`badge ${priorityColor.bg} ${priorityColor.text} border ${priorityColor.border} text-[10px]`}>
                {complaint.priority?.toUpperCase()}
              </span>
            </div>
            <h3 className="text-base font-semibold text-dark-800 group-hover:text-primary-600 transition-colors truncate">
              {complaint.title}
            </h3>
          </div>
          <StatusBadge status={complaint.status} size="sm" />
        </div>

        <p className="text-sm text-dark-500 mb-3 leading-relaxed">
          {truncateText(complaint.description, 120)}
        </p>

        <div className="flex items-center justify-between text-xs text-dark-400">
          <div className="flex items-center gap-4">
            {complaint.category && (
              <span className="flex items-center gap-1">
                {complaint.category.icon || '📋'} {complaint.category.name}
              </span>
            )}
            {complaint.location?.address && (
              <span className="flex items-center gap-1 max-w-[150px] truncate">
                <HiOutlineLocationMarker className="w-3.5 h-3.5 flex-shrink-0" />
                {complaint.location.address}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {complaint.comments?.length > 0 && (
              <span className="flex items-center gap-1">
                <HiOutlineChat className="w-3.5 h-3.5" /> {complaint.comments.length}
              </span>
            )}
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-3.5 h-3.5" />
              {formatRelativeTime(complaint.createdAt)}
            </span>
          </div>
        </div>

        {showUser && complaint.user && (
          <div className="mt-3 pt-3 border-t border-dark-100 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-300 to-accent-300 rounded-md flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">
                {complaint.user.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-dark-500">{complaint.user.name}</span>
            <span className="text-xs text-dark-300">•</span>
            <span className="text-xs text-dark-400">{complaint.user.email}</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default ComplaintCard;
