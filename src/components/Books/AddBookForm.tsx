import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { bookService } from '../../services/bookService';
import { useAuth } from '../../contexts/AuthContext';
import type { BookFormData } from '../../types';

interface AddBookFormProps {
  onBookAdded: () => void;
  catalogId: string;
}

export function AddBookForm({ onBookAdded, catalogId }: AddBookFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !catalogId) return;

    setLoading(true);
    setError('');

    try {
      const bookData: BookFormData = {
        title: title.trim(),
        author: author.trim(),
      };

      await bookService.addBook(user?.id || null, catalogId, bookData, true);
      setTitle('');
      setAuthor('');
      onBookAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Add New Book</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter book title"
            required
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter author name"
            required
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !title.trim() || !author.trim()}
        className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Adding Book...
          </>
        ) : (
          <>
            <Plus size={20} />
            Add Book
          </>
        )}
      </button>

      <p className="text-sm text-gray-500 mt-3">
        Book details will be automatically enriched with genre, cover image, and other metadata.
      </p>
    </form>
  );
}
