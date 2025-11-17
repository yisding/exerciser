'use client';

interface ClassCardProps {
  className: string;
  instructor: string;
  startTime: Date;
  endTime: Date;
  studioName: string;
  brand: string;
  location: string;
  spotsAvailable?: number;
  capacity?: number;
  level?: string;
  bookingUrl?: string;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export function ClassCard({
  className,
  instructor,
  startTime,
  endTime,
  studioName,
  brand,
  location,
  spotsAvailable,
  capacity,
  level,
  bookingUrl,
  onClick,
  isFavorite = false,
  onToggleFavorite,
}: ClassCardProps) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{className}</h3>
          <p className="text-sm text-gray-600">{instructor}</p>
        </div>
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(e)}
              className={`p-1 rounded-full transition-colors ${
                isFavorite
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className="w-5 h-5"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
          {level && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {level}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          {formatDate(start)} • {formatTime(start)} - {formatTime(end)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>
          {studioName} • {location}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="font-medium text-gray-700">{brand}</span>
          {spotsAvailable !== undefined && capacity !== undefined && (
            <span className="ml-2 text-gray-600">
              {spotsAvailable}/{capacity} spots
            </span>
          )}
        </div>

        {bookingUrl && (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Book
          </a>
        )}
      </div>
    </div>
  );
}
