import type { Book, BookFormData } from '../types';

const BOOKS_STORAGE_KEY = 'guest_books';

export const localStorageService = {
  getBooks(): Book[] {
    try {
      const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveBooks(books: Book[]): void {
    try {
      localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  addBook(bookData: BookFormData, catalogId: string): Book {
    const books = this.getBooks();
    const newBook: Book = {
      id: crypto.randomUUID(),
      user_id: null,
      catalog_id: catalogId,
      title: bookData.title,
      author: bookData.author,
      genre: bookData.genre || null,
      holiday_category: bookData.holiday_category || null,
      cover_image_url: bookData.cover_image_url || null,
      isbn: bookData.isbn || null,
      publication_year: bookData.publication_year || null,
      description: bookData.description || null,
      tags: bookData.tags || [],
      is_manually_edited: false,
      is_favorite: false,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    books.push(newBook);
    this.saveBooks(books);
    return newBook;
  },

  toggleFavorite(id: string): Book | null {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === id);

    if (index === -1) return null;

    books[index] = {
      ...books[index],
      is_favorite: !books[index].is_favorite,
      updated_at: new Date().toISOString(),
    };

    this.saveBooks(books);
    return books[index];
  },

  toggleRead(id: string): Book | null {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === id);

    if (index === -1) return null;

    books[index] = {
      ...books[index],
      is_read: !books[index].is_read,
      updated_at: new Date().toISOString(),
    };

    this.saveBooks(books);
    return books[index];
  },

  updateBook(id: string, updates: Partial<BookFormData>): Book | null {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === id);

    if (index === -1) return null;

    books[index] = {
      ...books[index],
      ...updates,
      is_manually_edited: true,
      updated_at: new Date().toISOString(),
    };

    this.saveBooks(books);
    return books[index];
  },

  deleteBook(id: string): boolean {
    const books = this.getBooks();
    const filtered = books.filter(b => b.id !== id);

    if (filtered.length === books.length) return false;

    this.saveBooks(filtered);
    return true;
  },

  getBookById(id: string): Book | null {
    const books = this.getBooks();
    return books.find(b => b.id === id) || null;
  },

  clearAll(): void {
    localStorage.removeItem(BOOKS_STORAGE_KEY);
  },
};
