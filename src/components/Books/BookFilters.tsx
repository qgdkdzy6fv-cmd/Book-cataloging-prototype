import { Filter, X, Star, CheckCircle, Circle } from 'lucide-react';
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

  const hasActiveFilters = filters.favorites || filters.read || filters.unread || filters.genre || filters.holiday_category || (filters.tags && filters.tags.length > 0);

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    favorites: !filters.favorites,
                  })
                }
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  filters.favorites
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Star size={16} className={filters.favorites ? 'fill-white' : ''} />
                Favorites
              </button>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    read: !filters.read,
                    unread: false,
                  })
                }
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  filters.read
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <CheckCircle size={16} className={filters.read ? 'fill-white' : ''} />
                Read
              </button>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    unread: !filters.unread,
                    read: false,
                  })
                }
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  filters.unread
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Circle size={16} />
                Unread
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {availableHolidays.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
