'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  showValue?: boolean;
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className = '',
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} role={interactive ? 'radiogroup' : undefined} aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentRating;

          if (interactive && onChange) {
            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={starValue === rating}
                aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                onClick={() => onChange(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-0.5 text-amber-500 hover:scale-115 transition-transform duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500 rounded cursor-pointer"
              >
                <Star
                  className={`${sizeClasses[size]} transition-colors duration-150 ${
                    isFilled ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                  }`}
                />
              </button>
            );
          }

          return (
            <Star
              key={starValue}
              className={`${sizeClasses[size]} ${
                isFilled ? 'fill-amber-400 text-amber-500' : 'text-stone-200'
              }`}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-bold text-stone-700 ml-1.5">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
