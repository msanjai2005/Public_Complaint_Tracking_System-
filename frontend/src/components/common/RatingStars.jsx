import { useState } from 'react';
import { HiStar } from 'react-icons/hi';

const RatingStars = ({ value = 0, onChange, readonly = false, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <HiStar
            className={`${sizeClasses[size]} transition-colors ${
              star <= (hovered || value)
                ? 'text-yellow-400 drop-shadow-sm'
                : 'text-dark-200'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-dark-600">{value}.0</span>
      )}
    </div>
  );
};

export default RatingStars;
