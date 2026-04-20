import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-dark-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all
            ${page === currentPage
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
              : page === '...'
                ? 'cursor-default text-dark-400'
                : 'hover:bg-dark-50 text-dark-600'
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-dark-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <HiOutlineChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
