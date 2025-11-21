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

  filterBooks(books: Book[], filters: FilterOptions): Book[] {
    let filtered = [...books];

    if (filters.favorites) {
      filtered = filtered.filter(book => book.is_favorite);
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
};
