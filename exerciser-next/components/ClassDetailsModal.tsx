'use client';

interface Studio {
  id: string;
  name: string;
  brand: string;
  location: string;
  address?: string;
}

interface FitnessClass {
  id: string;
  className: string;
  instructor: string;
  startTime: string;
  endTime: string;
  duration: number;
  capacity?: number;
  spotsAvailable?: number;
  level?: string;
  bookingUrl?: string;
  studio: Studio;
}

interface ClassDetailsModalProps {
  fitnessClass: FitnessClass | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ClassDetailsModal({
  fitnessClass,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: ClassDetailsModalProps) {
  if (!isOpen || !fitnessClass) return null;

  const startDate = new Date(fitnessClass.startTime);
  const endDate = new Date(fitnessClass.endTime);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = `${startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

  const spotsAvailableText =
    fitnessClass.spotsAvailable !== undefined &&
    fitnessClass.capacity !== undefined
      ? `${fitnessClass.spotsAvailable} / ${fitnessClass.capacity} spots available`
      : null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        {/* Modal */}
        <div
          className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {fitnessClass.className}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {fitnessClass.studio.brand}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onToggleFavorite && (
                  <button
                    onClick={onToggleFavorite}
                    className={`rounded-full p-2 transition-colors ${
                      isFavorite
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg
                      className="h-6 w-6"
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
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Date and Time */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{formattedDate}</p>
                <p className="text-sm text-gray-600">{formattedTime}</p>
                <p className="text-sm text-gray-500">{fitnessClass.duration} minutes</p>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{fitnessClass.instructor}</p>
                <p className="text-sm text-gray-600">Instructor</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
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
              </div>
              <div>
                <p className="font-medium text-gray-900">{fitnessClass.studio.name}</p>
                <p className="text-sm text-gray-600">{fitnessClass.studio.location}</p>
                {fitnessClass.studio.address && (
                  <p className="text-sm text-gray-500">{fitnessClass.studio.address}</p>
                )}
              </div>
            </div>

            {/* Level and Availability */}
            <div className="flex flex-wrap gap-4">
              {fitnessClass.level && (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {fitnessClass.level}
                  </span>
                </div>
              )}
              {spotsAvailableText && (
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      fitnessClass.spotsAvailable! > 5
                        ? 'bg-green-100 text-green-800'
                        : fitnessClass.spotsAvailable! > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {spotsAvailableText}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {fitnessClass.bookingUrl && (
                <a
                  href={fitnessClass.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Book Class
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
