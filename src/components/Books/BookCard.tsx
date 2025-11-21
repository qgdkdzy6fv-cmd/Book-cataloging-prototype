import { BookOpen, Tag, Calendar } from 'lucide-react';
import type { Book } from '../../types';

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="aspect-[2/3] bg-gray-100 relative">
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
          <BookOpen size={48} className="text-gray-400" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{book.author}</p>

        <div className="space-y-1">
          {book.genre && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Tag size={14} />
              <span>{book.genre}</span>
            </div>
          )}

          {book.holiday_category && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={14} />
              <span>{book.holiday_category}</span>
            </div>
          )}

          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {book.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{book.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
