'use client';

interface FiltersProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Filters({
  selectedBrand,
  onBrandChange,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
}: FiltersProps) {
  const brands = [
    { value: '', label: 'All Brands' },
    { value: 'Club Pilates', label: 'Club Pilates' },
    { value: 'CycleBar', label: 'CycleBar' },
  ];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div>
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
            placeholder="Class or instructor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedBrand || searchQuery) && (
        <div className="flex items-center gap-2 pt-2 border-t">
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
            onClick={() => {
              onBrandChange('');
              onSearchChange('');
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline ml-auto"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
