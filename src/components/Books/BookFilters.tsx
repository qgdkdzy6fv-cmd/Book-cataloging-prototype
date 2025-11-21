import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import type { FilterOptions } from '../../types';

interface BookFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableGenres: string[];
  availableHolidays: string[];
  availableTags: string[];
}

export function BookFilters({
  filters,
  onFiltersChange,
  availableGenres,
  availableHolidays,
  availableTags,
}: BookFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = filters.genre || filters.holiday_category || (filters.tags && filters.tags.length > 0);

  const clearFilters = () => {
    onFiltersChange({});
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Filter size={20} />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      genre: filters.genre === genre ? undefined : genre,
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.genre === genre
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {availableHolidays.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Holiday/Season
              </label>
              <div className="flex flex-wrap gap-2">
                {availableHolidays.map((holiday) => (
                  <button
                    key={holiday}
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        holiday_category: filters.holiday_category === holiday ? undefined : holiday,
                      })
                    }
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.holiday_category === holiday
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {holiday}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.tags?.includes(tag)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
