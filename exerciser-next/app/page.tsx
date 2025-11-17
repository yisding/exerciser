'use client';

import { useEffect, useState } from 'react';
import { ClassList } from '../components/ClassList';
import { Filters } from '../components/Filters';
import { ClassDetailsModal } from '../components/ClassDetailsModal';

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

export default function Home() {
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('');

  // Modal and favorites state
  const [selectedClass, setSelectedClass] = useState<FitnessClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('exerciser_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('exerciser_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedDate]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();

      // Set date range for selected date
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());

      if (selectedBrand) {
        params.append('brand', selectedBrand);
      }

      const response = await fetch(`/api/classes?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      setClasses(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if class time falls within selected time range
  const matchesTimeRange = (classStartTime: string, timeRange: string): boolean => {
    if (!timeRange) return true;

    const startDate = new Date(classStartTime);
    const hour = startDate.getHours();

    switch (timeRange) {
      case 'early-morning':
        return hour >= 5 && hour < 8;
      case 'morning':
        return hour >= 8 && hour < 12;
      case 'afternoon':
        return hour >= 12 && hour < 17;
      case 'evening':
        return hour >= 17 && hour < 21;
      default:
        return true;
    }
  };

  // Client-side filtering
  const filteredClasses = classes.filter((fitnessClass) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        fitnessClass.className.toLowerCase().includes(query) ||
        fitnessClass.instructor.toLowerCase().includes(query) ||
        fitnessClass.studio.name.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Level filter
    if (selectedLevel && fitnessClass.level !== selectedLevel) {
      return false;
    }

    // Location filter
    if (selectedLocation && fitnessClass.studio.location !== selectedLocation) {
      return false;
    }

    // Time range filter
    if (!matchesTimeRange(fitnessClass.startTime, selectedTimeRange)) {
      return false;
    }

    return true;
  });

  const handleClassClick = (fitnessClass: FitnessClass) => {
    setSelectedClass(fitnessClass);
    setIsModalOpen(true);
  };

  const handleToggleFavorite = (classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(classId)) {
        newFavorites.delete(classId);
      } else {
        newFavorites.add(classId);
      }
      return newFavorites;
    });
  };

  const handleModalToggleFavorite = () => {
    if (selectedClass) {
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(selectedClass.id)) {
          newFavorites.delete(selectedClass.id);
        } else {
          newFavorites.add(selectedClass.id);
        }
        return newFavorites;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Exerciser</h1>
          <p className="text-sm text-gray-600 mt-1">
            Find fitness classes across the Bay Area
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Filters
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <ClassList
          classes={filteredClasses}
          loading={loading}
          onClassClick={handleClassClick}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      <ClassDetailsModal
        fitnessClass={selectedClass}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isFavorite={selectedClass ? favorites.has(selectedClass.id) : false}
        onToggleFavorite={handleModalToggleFavorite}
      />
    </div>
  );
}
