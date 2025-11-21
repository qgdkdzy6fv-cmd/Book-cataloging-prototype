import { supabase } from '../lib/supabase';
import { localStorageService } from './localStorage';
import { enrichBookData } from './bookApi';
import type { Book, BookFormData, FilterOptions } from '../types';

export const bookService = {
  async getBooks(userId: string | null, catalogId: string): Promise<Book[]> {
    if (!userId || !supabase) {
      const allBooks = localStorageService.getBooks();
      return allBooks.filter(book => book.catalog_id === catalogId);
    }

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .eq('catalog_id', catalogId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addBook(userId: string | null, catalogId: string, bookData: BookFormData, autoEnrich: boolean = true): Promise<Book> {
    let finalData = bookData;

    if (autoEnrich && !bookData.cover_image_url) {
      const enrichedData = await enrichBookData(bookData.title, bookData.author);
      finalData = {
        ...bookData,
        genre: bookData.genre || enrichedData.genre,
        holiday_category: bookData.holiday_category || enrichedData.holiday_category,
        cover_image_url: bookData.cover_image_url || enrichedData.cover_image_url,
        isbn: bookData.isbn || enrichedData.isbn,
        publication_year: bookData.publication_year || enrichedData.publication_year,
        description: bookData.description || enrichedData.description,
      };
    }

    if (!userId || !supabase) {
      return localStorageService.addBook(finalData, catalogId);
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: userId,
        catalog_id: catalogId,
        title: finalData.title,
        author: finalData.author,
        genre: finalData.genre || null,
        holiday_category: finalData.holiday_category || null,
        cover_image_url: finalData.cover_image_url || null,
        isbn: finalData.isbn || null,
        publication_year: finalData.publication_year || null,
        description: finalData.description || null,
        tags: finalData.tags || [],
        is_manually_edited: false,
        is_favorite: false,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBook(userId: string | null, bookId: string, updates: Partial<BookFormData>): Promise<Book> {
    if (!userId || !supabase) {
      const updated = localStorageService.updateBook(bookId, updates);
      if (!updated) throw new Error('Book not found');
      return updated;
    }

    const { data, error } = await supabase
      .from('books')
      .update({
        ...updates,
        is_manually_edited: true,
      })
      .eq('id', bookId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBook(userId: string | null, bookId: string): Promise<void> {
    if (!userId || !supabase) {
      const success = localStorageService.deleteBook(bookId);
      if (!success) throw new Error('Book not found');
      return;
    }

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getBookById(userId: string | null, bookId: string): Promise<Book | null> {
    if (!userId || !supabase) {
      return localStorageService.getBookById(bookId);
    }

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async toggleFavorite(userId: string | null, bookId: string): Promise<Book> {
    if (!userId || !supabase) {
      const updated = localStorageService.toggleFavorite(bookId);
      if (!updated) throw new Error('Book not found');
      return updated;
    }

    const book = await this.getBookById(userId, bookId);
    if (!book) throw new Error('Book not found');

    const { data, error } = await supabase
      .from('books')
      .update({ is_favorite: !book.is_favorite })
      .eq('id', bookId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleRead(userId: string | null, bookId: string): Promise<Book> {
    if (!userId || !supabase) {
      const updated = localStorageService.toggleRead(bookId);
      if (!updated) throw new Error('Book not found');
      return updated;
    }

    const book = await this.getBookById(userId, bookId);
    if (!book) throw new Error('Book not found');

    const { data, error } = await supabase
      .from('books')
      .update({ is_read: !book.is_read })
      .eq('id', bookId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  filterBooks(books: Book[], filters: FilterOptions): Book[] {
    let filtered = [...books];

    if (filters.favorites) {
      filtered = filtered.filter(book => book.is_favorite);
    }

    if (filters.read) {
      filtered = filtered.filter(book => book.is_read);
    }

    if (filters.unread) {
      filtered = filtered.filter(book => !book.is_read);
    }

    if (filters.genre) {
      filtered = filtered.filter(book => book.genre === filters.genre);
    }

    if (filters.holiday_category) {
      filtered = filtered.filter(book => book.holiday_category === filters.holiday_category);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(book =>
        filters.tags!.some(tag => book.tags.includes(tag))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        book.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  },

  getRandomBook(books: Book[]): Book | null {
    if (books.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * books.length);
    return books[randomIndex];
  },

  async getRandomBookSuggestion(existingBooks: Book[]): Promise<BookAPIResponse | null> {
    try {
      const genres = ['fiction', 'mystery', 'fantasy', 'science fiction', 'romance', 'thriller', 'historical fiction', 'adventure', 'biography', 'self-help', 'history'];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(randomGenre)}&orderBy=relevance&maxResults=40`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch book suggestions');
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const existingTitlesAndAuthors = new Set(
        existingBooks.map(book => {
          const normalizedTitle = book.title.toLowerCase().trim().replace(/[^\w\s]/g, '');
          const normalizedAuthor = book.author.toLowerCase().trim().replace(/[^\w\s]/g, '');
          return `${normalizedTitle}|${normalizedAuthor}`;
        })
      );

      const existingISBNs = new Set(
        existingBooks.filter(book => book.isbn).map(book => book.isbn)
      );

      const availableBooks = data.items.filter((item: any) => {
        const bookInfo = item.volumeInfo;
        if (!bookInfo?.title || !bookInfo?.authors) return false;

        const normalizedTitle = bookInfo.title.toLowerCase().trim().replace(/[^\w\s]/g, '');
        const normalizedAuthor = (bookInfo.authors[0] || '').toLowerCase().trim().replace(/[^\w\s]/g, '');
        const titleAuthorKey = `${normalizedTitle}|${normalizedAuthor}`;

        if (existingTitlesAndAuthors.has(titleAuthorKey)) {
          return false;
        }

        const isbn13 = bookInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;
        const isbn10 = bookInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;

        if ((isbn13 && existingISBNs.has(isbn13)) || (isbn10 && existingISBNs.has(isbn10))) {
          return false;
        }

        return true;
      });

      if (availableBooks.length === 0) {
        return null;
      }

      const randomBook = availableBooks[Math.floor(Math.random() * availableBooks.length)];
      const bookInfo = randomBook.volumeInfo;
      const categories = bookInfo.categories || [];
      const description = bookInfo.description || '';

      return {
        title: bookInfo.title,
        author: bookInfo.authors?.join(', ') || 'Unknown Author',
        genre: this.classifyGenre(categories),
        cover_image_url: bookInfo.imageLinks?.thumbnail?.replace('http:', 'https:') ||
                         bookInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
        isbn: bookInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier ||
              bookInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier,
        publication_year: bookInfo.publishedDate ? parseInt(bookInfo.publishedDate.split('-')[0]) : undefined,
        description: description,
        holiday_category: this.detectHolidayCategory(bookInfo.title, description),
      };
    } catch (error) {
      console.error('Error fetching random book suggestion:', error);
      return null;
    }
  },

  classifyGenre(categories: string[]): string {
    const fictionKeywords = ['fiction', 'novel', 'fantasy', 'science fiction', 'mystery', 'thriller', 'romance'];
    const nonFictionKeywords = ['biography', 'history', 'science', 'self-help', 'business', 'memoir', 'reference'];

    const categoriesLower = categories.map(c => c.toLowerCase()).join(' ');

    const hasFiction = fictionKeywords.some(keyword => categoriesLower.includes(keyword));
    const hasNonFiction = nonFictionKeywords.some(keyword => categoriesLower.includes(keyword));

    if (hasFiction && !hasNonFiction) return 'Fiction';
    if (hasNonFiction && !hasFiction) return 'Non-fiction';
    if (hasFiction) return 'Fiction';

    return 'Fiction';
  },

  detectHolidayCategory(title: string, description: string): string | undefined {
    const HOLIDAY_KEYWORDS: Record<string, string[]> = {
      Christmas: ['christmas', 'santa', 'xmas', 'holiday', 'winter wonderland', 'reindeer', 'snowman'],
      Halloween: ['halloween', 'spooky', 'ghost', 'witch', 'pumpkin', 'haunted'],
      Easter: ['easter', 'bunny', 'egg'],
      Thanksgiving: ['thanksgiving', 'turkey', 'pilgrim'],
      Summer: ['summer', 'beach', 'vacation', 'sun'],
      Valentine: ['valentine', 'love', 'romance', 'heart'],
      'New Year': ['new year', 'resolution'],
    };

    const searchText = `${title} ${description}`.toLowerCase();

    for (const [holiday, keywords] of Object.entries(HOLIDAY_KEYWORDS)) {
      if (keywords.some(keyword => searchText.includes(keyword))) {
        return holiday;
      }
    }

    return undefined;
  },
};
