export interface Catalog {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  user_id: string | null;
  catalog_id: string;
  title: string;
  author: string;
  genre: string | null;
  holiday_category: string | null;
  cover_image_url: string | null;
  isbn: string | null;
  publication_year: number | null;
  description: string | null;
  tags: string[];
  is_manually_edited: boolean;
  is_favorite: boolean;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookFormData {
  title: string;
  author: string;
  genre?: string;
  holiday_category?: string;
  cover_image_url?: string;
  isbn?: string;
  publication_year?: number;
  description?: string;
  tags?: string[];
}

export interface BookAPIResponse {
  title: string;
  author: string;
  genre?: string;
  cover_image_url?: string;
  isbn?: string;
  publication_year?: number;
  description?: string;
  holiday_category?: string;
}

export interface FilterOptions {
  genre?: string;
  holiday_category?: string;
  tags?: string[];
  search?: string;
  favorites?: boolean;
  read?: boolean;
  unread?: boolean;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  default_view: 'grid' | 'list';
  items_per_page: number;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export type ViewMode = 'grid' | 'list';
export type ExportFormat = 'xlsx' | 'pdf' | 'csv';
