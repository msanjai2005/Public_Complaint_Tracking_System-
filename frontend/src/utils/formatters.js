import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM dd, yyyy');
  } catch { return 'N/A'; }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM dd, yyyy • hh:mm a');
  } catch { return 'N/A'; }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch { return ''; }
};

export const formatResolutionTime = (hours) => {
  if (!hours && hours !== 0) return 'N/A';
  if (hours < 1) return 'Less than 1 hour';
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) return `${days} day${days > 1 ? 's' : ''}`;
  return `${days}d ${remainingHours}h`;
};

export const getStatusColor = (status) => {
  const colors = {
    'pending': { bg: 'bg-warning-50', text: 'text-warning-600', dot: 'bg-warning-400', border: 'border-warning-200' },
    'under-review': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400', border: 'border-blue-200' },
    'in-progress': { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-400', border: 'border-purple-200' },
    'resolved': { bg: 'bg-success-50', text: 'text-success-600', dot: 'bg-success-400', border: 'border-success-200' },
    'rejected': { bg: 'bg-danger-50', text: 'text-danger-600', dot: 'bg-danger-400', border: 'border-danger-200' },
  };
  return colors[status] || colors['pending'];
};

export const getPriorityColor = (priority) => {
  const colors = {
    'low': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    'medium': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    'high': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  };
  return colors[priority] || colors['medium'];
};

export const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pending',
    'under-review': 'Under Review',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Rejected',
  };
  return labels[status] || status;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
