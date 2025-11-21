import { BookOpen, Tag, Calendar, Star, Check } from 'lucide-react';
import type { Book } from '../../types';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onToggleFavorite: (bookId: string) => void;
  onToggleRead: (bookId: string) => void;
}

export function BookCard({ book, onClick, onToggleFavorite, onToggleRead }: BookCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(book.id);
  };

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleRead(book.id);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
    >
      <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 relative">
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${book.cover_image_url ? 'hidden' : ''}`}>
          <BookOpen size={48} className="text-gray-400 dark:text-gray-500" />
        </div>

        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:scale-110 transition-transform"
          aria-label={book.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            size={20}
            className={book.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 dark:text-gray-500'}
          />
        </button>

        <button
          onClick={handleReadClick}
          className="absolute top-2 left-2 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:scale-110 transition-transform"
          aria-label={book.is_read ? 'Mark as unread' : 'Mark as read'}
        >
          <Check
            size={20}
            className={book.is_read ? 'text-green-500 stroke-[3]' : 'text-gray-400 dark:text-gray-500'}
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-2 text-gray-900 dark:text-white">{book.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{book.author}</p>

        <div className="space-y-1">
          {book.genre && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Tag size={14} />
              <span>{book.genre}</span>
            </div>
          )}

          {book.holiday_category && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar size={14} />
              <span>{book.holiday_category}</span>
            </div>
          )}

          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {book.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">+{book.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
