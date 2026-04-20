import { motion } from 'framer-motion';
import { formatDateTime, getStatusColor, getStatusLabel } from '../../utils/formatters';
import { HiCheckCircle, HiClock, HiEye, HiPlay, HiXCircle } from 'react-icons/hi';

const statusIcons = {
  'pending': HiClock,
  'under-review': HiEye,
  'in-progress': HiPlay,
  'resolved': HiCheckCircle,
  'rejected': HiXCircle,
};

const ComplaintTimeline = ({ timeline = [] }) => {
  if (!timeline.length) return null;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-dark-100"></div>

      <div className="space-y-6">
        {timeline.map((entry, index) => {
          const colors = getStatusColor(entry.status);
          const Icon = statusIcons[entry.status] || HiClock;
          const isLast = index === timeline.length - 1;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="relative flex gap-4"
            >
              {/* Icon dot */}
              <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                ${isLast ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25' : `${colors.bg} border ${colors.border}`}`}
              >
                <Icon className={`w-5 h-5 ${isLast ? 'text-white' : colors.text}`} />
              </div>

              {/* Content */}
              <div className={`flex-1 pb-2 ${isLast ? '' : 'opacity-80'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${isLast ? 'text-dark-800' : 'text-dark-600'}`}>
                    {getStatusLabel(entry.status)}
                  </span>
                  <span className="text-xs text-dark-400">
                    {formatDateTime(entry.timestamp)}
                  </span>
                </div>
                {entry.comment && (
                  <p className="text-sm text-dark-500">{entry.comment}</p>
                )}
                {entry.updatedBy && (
                  <p className="text-xs text-dark-400 mt-1">
                    by {entry.updatedBy.name || 'System'} 
                    {entry.updatedBy.role && <span className="ml-1 text-primary-500">({entry.updatedBy.role})</span>}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplaintTimeline;
