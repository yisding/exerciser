'use client';

interface FiltersProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLevel?: string;
  onLevelChange?: (level: string) => void;
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
  selectedTimeRange?: string;
  onTimeRangeChange?: (timeRange: string) => void;
}

export function Filters({
  selectedBrand,
  onBrandChange,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  selectedLevel = '',
  onLevelChange = () => {},
  selectedLocation = '',
  onLocationChange = () => {},
  selectedTimeRange = '',
  onTimeRangeChange = () => {},
}: FiltersProps) {
  const brands = [
    { value: '', label: 'All Brands' },
    { value: 'Club Pilates', label: 'Club Pilates' },
    { value: 'CycleBar', label: 'CycleBar' },
    { value: 'Row House', label: 'Row House' },
    { value: 'Pure Barre', label: 'Pure Barre' },
    { value: 'YogaSix', label: 'YogaSix' },
    { value: 'F45 Training', label: 'F45 Training' },
    { value: 'barre3', label: 'barre3' },
    { value: 'Title Boxing Club', label: 'Title Boxing Club' },
    { value: 'StretchLab', label: 'StretchLab' },
    { value: 'Spenga', label: 'Spenga' },
    { value: 'Rumble Boxing', label: 'Rumble Boxing' },
    { value: 'Jia Ren Yoga', label: 'Jia Ren Yoga' },
    { value: '[solidcore]', label: '[solidcore]' },
  ];

  const levels = [
    { value: '', label: 'All Levels' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'All Levels', label: 'All Levels' },
  ];

  const locations = [
    { value: '', label: 'All Locations' },
    { value: 'San Francisco', label: 'San Francisco' },
    { value: 'Oakland', label: 'Oakland' },
    { value: 'Berkeley', label: 'Berkeley' },
    { value: 'Palo Alto', label: 'Palo Alto' },
    { value: 'San Jose', label: 'San Jose' },
    { value: 'Walnut Creek', label: 'Walnut Creek' },
    { value: 'Mountain View', label: 'Mountain View' },
    { value: 'Sunnyvale', label: 'Sunnyvale' },
    { value: 'Los Gatos', label: 'Los Gatos' },
    { value: 'Menlo Park', label: 'Menlo Park' },
    { value: 'San Mateo', label: 'San Mateo' },
    { value: 'Fremont', label: 'Fremont' },
    { value: 'Redwood City', label: 'Redwood City' },
    { value: 'San Ramon', label: 'San Ramon' },
    { value: 'Pleasanton', label: 'Pleasanton' },
    { value: 'Mill Valley', label: 'Mill Valley' },
  ];

  const timeRanges = [
    { value: '', label: 'Any Time' },
    { value: 'early-morning', label: 'Early Morning (5-8 AM)' },
    { value: 'morning', label: 'Morning (8-12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12-5 PM)' },
    { value: 'evening', label: 'Evening (5-9 PM)' },
  ];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const hasActiveFilters = selectedBrand || selectedLevel || selectedLocation || selectedTimeRange || searchQuery;

  const clearAllFilters = () => {
    onBrandChange('');
    onLevelChange('');
    onLocationChange('');
    onTimeRangeChange('');
    onSearchChange('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Brand Filter */}
        <div>
          <label
            htmlFor="brand"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Brand
          </label>
          <select
            id="brand"
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {brands.map((brand) => (
              <option key={brand.value} value={brand.value}>
                {brand.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Location
          </label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {locations.map((location) => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Level
          </label>
          <select
            id="level"
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range Filter */}
        <div>
          <label
            htmlFor="timeRange"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Time
          </label>
          <select
            id="timeRange"
            value={selectedTimeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((timeRange) => (
              <option key={timeRange.value} value={timeRange.value}>
                {timeRange.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search */}
        <div className="md:col-span-2 lg:col-span-3">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Class name or instructor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <span className="text-sm text-gray-600">Active filters:</span>
          {selectedBrand && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {selectedBrand}
              <button
                onClick={() => onBrandChange('')}
                className="ml-2 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedLocation && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              {selectedLocation}
              <button
                onClick={() => onLocationChange('')}
                className="ml-2 hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedLevel && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              {selectedLevel}
              <button
                onClick={() => onLevelChange('')}
                className="ml-2 hover:text-yellow-900"
              >
                ×
              </button>
            </span>
          )}
          {selectedTimeRange && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              {timeRanges.find(t => t.value === selectedTimeRange)?.label}
              <button
                onClick={() => onTimeRangeChange('')}
                className="ml-2 hover:text-orange-900"
              >
                ×
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              &quot;{searchQuery}&quot;
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 hover:text-purple-900"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline ml-auto"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
