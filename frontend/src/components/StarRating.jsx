import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

// Star Rating Display Component (read-only)
export const StarRatingDisplay = ({ rating, size = 16, showNumber = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="d-flex align-items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={size} className="text-warning" />
      ))}
      {hasHalfStar && (
        <FaStarHalfAlt size={size} className="text-warning" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} size={size} className="text-secondary" />
      ))}
      {showNumber && (
        <span className="ms-2 text-dark fw-semibold">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

// Star Rating Input Component (interactive)
export const StarRatingInput = ({ rating, onRatingChange, size = 24 }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value) => {
    onRatingChange(value);
  };

  const handleMouseEnter = (value) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="d-flex align-items-center gap-1 flex-nowrap" style={{ minWidth: 'fit-content' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="btn p-0 border-0 bg-transparent"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          style={{ 
            cursor: 'pointer', 
            transition: 'transform 0.2s',
            minWidth: `${size}px`,
            height: `${size}px`
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {star <= displayRating ? (
            <FaStar size={size} className="text-warning" />
          ) : (
            <FaRegStar size={size} className="text-secondary" />
          )}
        </button>
      ))}
      {rating > 0 && (
        <span className="ms-2 text-dark fw-semibold text-nowrap">{rating} star{rating !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

export default StarRatingDisplay;