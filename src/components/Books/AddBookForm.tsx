import { useState, useRef, useEffect } from 'react';
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
  const [titleSuggestions, setTitleSuggestions] = useState<Array<{ title: string; author: string }>>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [loadingTitleSuggestions, setLoadingTitleSuggestions] = useState(false);
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const titleInputRef = useRef<HTMLDivElement>(null);
  const authorInputRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (authorInputRef.current && !authorInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (titleInputRef.current && !titleInputRef.current.contains(event.target as Node)) {
        setShowTitleSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (titleDebounceRef.current) {
        clearTimeout(titleDebounceRef.current);
      }
    };
  }, []);

  const fetchTitleSuggestions = async (searchTitle: string) => {
    if (!searchTitle.trim() || searchTitle.trim().length < 2) {
      setTitleSuggestions([]);
      return;
    }

    setLoadingTitleSuggestions(true);
    try {
      let query = `intitle:${encodeURIComponent(searchTitle.trim())}`;

      if (author.trim()) {
        query += `+inauthor:${encodeURIComponent(author.trim())}`;
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const books = data.items
          .map((item: any) => ({
            title: item.volumeInfo.title || '',
            author: item.volumeInfo.authors?.[0] || 'Unknown Author',
          }))
          .filter((book: any) => book.title);

        const uniqueBooks = books.filter((book: any, index: number, self: any[]) =>
          index === self.findIndex((b: any) =>
            b.title.toLowerCase() === book.title.toLowerCase() &&
            b.author.toLowerCase() === book.author.toLowerCase()
          )
        );

        setTitleSuggestions(uniqueBooks);
      } else {
        setTitleSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching title suggestions:', error);
      setTitleSuggestions([]);
    } finally {
      setLoadingTitleSuggestions(false);
    }
  };

  const fetchAuthorSuggestions = async () => {
    if (!title.trim()) {
      setAuthorSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title.trim())}&maxResults=5`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const authors = data.items
          .map((item: any) => item.volumeInfo.authors?.[0])
          .filter((author: string | undefined) => author)
          .filter((author: string, index: number, self: string[]) =>
            self.indexOf(author) === index
          );
        setAuthorSuggestions(authors);
      } else {
        setAuthorSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching author suggestions:', error);
      setAuthorSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (titleDebounceRef.current) {
      clearTimeout(titleDebounceRef.current);
    }

    if (value.trim().length >= 2) {
      setShowTitleSuggestions(true);
      titleDebounceRef.current = setTimeout(() => {
        fetchTitleSuggestions(value);
      }, 500);
    } else {
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
    }
  };

  const handleSelectTitle = (selectedBook: { title: string; author: string }) => {
    setTitle(selectedBook.title);
    setAuthor(selectedBook.author);
    setShowTitleSuggestions(false);
    setTitleSuggestions([]);
  };

  const handleAuthorInputFocus = () => {
    if (title.trim()) {
      setShowSuggestions(true);
      if (authorSuggestions.length === 0) {
        fetchAuthorSuggestions();
      }
    }
  };

  const handleSelectAuthor = (selectedAuthor: string) => {
    setAuthor(selectedAuthor);
    setShowSuggestions(false);
  };

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
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
      setAuthorSuggestions([]);
      setShowSuggestions(false);
      onBookAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Book</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div ref={titleInputRef} className="relative">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Enter book title"
            required
          />
          {showTitleSuggestions && title.trim().length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {loadingTitleSuggestions ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Loading suggestions...
                </div>
              ) : titleSuggestions.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-600">
                    Book suggestions
                  </div>
                  {titleSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectTitle(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors border-b dark:border-gray-600 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        by {suggestion.author}
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={authorInputRef} className="relative">
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onFocus={handleAuthorInputFocus}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Enter author name"
            required
          />
          {showSuggestions && title.trim() && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {loadingSuggestions ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Loading suggestions...
                </div>
              ) : authorSuggestions.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-600">
                    Suggested authors for "{title}"
                  </div>
                  {authorSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectAuthor(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No author suggestions found for this title
                </div>
              )}
            </div>
          )}
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
