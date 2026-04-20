import { getStatusColor, getStatusLabel } from '../../utils/formatters';

const StatusBadge = ({ status, size = 'md' }) => {
  const colors = getStatusColor(status);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span className={`badge ${colors.bg} ${colors.text} border ${colors.border} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} mr-1.5`}></span>
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
