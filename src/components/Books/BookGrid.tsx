import { BookCard } from './BookCard';
import type { Book } from '../../types';

interface BookGridProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

export function BookGrid({ books, onBookClick }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No books found</p>
        <p className="text-gray-400 text-sm mt-2">Add your first book to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onClick={() => onBookClick(book)} />
      ))}
    </div>
  );
}
