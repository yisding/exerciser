'use client';

import { ClassCard } from './ClassCard';

interface Studio {
  id: string;
  name: string;
  brand: string;
  location: string;
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

interface ClassListProps {
  classes: FitnessClass[];
  loading?: boolean;
  onClassClick?: (fitnessClass: FitnessClass) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (classId: string, e: React.MouseEvent) => void;
}

export function ClassList({ classes, loading, onClassClick, favorites = new Set(), onToggleFavorite }: ClassListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        Showing {classes.length} {classes.length === 1 ? 'class' : 'classes'}
      </div>
      {classes.map((fitnessClass) => (
        <ClassCard
          key={fitnessClass.id}
          className={fitnessClass.className}
          instructor={fitnessClass.instructor}
          startTime={new Date(fitnessClass.startTime)}
          endTime={new Date(fitnessClass.endTime)}
          studioName={fitnessClass.studio.name}
          brand={fitnessClass.studio.brand}
          location={fitnessClass.studio.location}
          spotsAvailable={fitnessClass.spotsAvailable}
          capacity={fitnessClass.capacity}
          level={fitnessClass.level}
          bookingUrl={fitnessClass.bookingUrl}
          onClick={() => onClassClick?.(fitnessClass)}
          isFavorite={favorites.has(fitnessClass.id)}
          onToggleFavorite={(e) => onToggleFavorite?.(fitnessClass.id, e)}
        />
      ))}
    </div>
  );
}
