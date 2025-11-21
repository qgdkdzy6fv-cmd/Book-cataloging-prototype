import { createClient } from '@supabase/supabase-js';
import type { Book, UserPreferences } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Database {
  public: {
    Tables: {
      books: {
        Row: Book;
        Insert: Omit<Book, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
