import { supabase } from '../lib/supabase';
import type { Catalog } from '../types';

const CATALOG_STORAGE_KEY = 'guest_catalogs';
const ACTIVE_CATALOG_KEY = 'active_catalog_id';

export const catalogService = {
  getLocalCatalogs(): Catalog[] {
    try {
      const stored = localStorage.getItem(CATALOG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading catalogs from localStorage:', error);
      return [];
    }
  },

  saveLocalCatalogs(catalogs: Catalog[]): void {
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogs));
    } catch (error) {
      console.error('Error saving catalogs to localStorage:', error);
    }
  },

  getActiveCatalogId(): string | null {
    return localStorage.getItem(ACTIVE_CATALOG_KEY);
  },

  setActiveCatalogId(catalogId: string): void {
    localStorage.setItem(ACTIVE_CATALOG_KEY, catalogId);
  },

  async getCatalogs(userId: string | null): Promise<Catalog[]> {
    if (!userId || !supabase) {
      const catalogs = this.getLocalCatalogs();
      if (catalogs.length === 0) {
        const defaultCatalog = this.createLocalCatalog('My Book Catalog', null);
        return [defaultCatalog];
      }
      return catalogs;
    }

    const { data, error } = await supabase
      .from('catalogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      const defaultCatalog = await this.createCatalog(userId, 'My Book Catalog', null);
      return [defaultCatalog];
    }

    return data;
  },

  createLocalCatalog(name: string, description: string | null): Catalog {
    const catalogs = this.getLocalCatalogs();
    const newCatalog: Catalog = {
      id: crypto.randomUUID(),
      user_id: null,
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    catalogs.push(newCatalog);
    this.saveLocalCatalogs(catalogs);

    if (catalogs.length === 1) {
      this.setActiveCatalogId(newCatalog.id);
    }

    return newCatalog;
  },

  async createCatalog(userId: string | null, name: string, description: string | null): Promise<Catalog> {
    if (!userId || !supabase) {
      return this.createLocalCatalog(name, description);
    }

    const { data, error } = await supabase
      .from('catalogs')
      .insert({
        user_id: userId,
        name,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCatalog(userId: string | null, catalogId: string, name: string, description: string | null): Promise<Catalog> {
    if (!userId || !supabase) {
      const catalogs = this.getLocalCatalogs();
      const index = catalogs.findIndex(c => c.id === catalogId);
      if (index === -1) throw new Error('Catalog not found');

      catalogs[index] = {
        ...catalogs[index],
        name,
        description,
        updated_at: new Date().toISOString(),
      };

      this.saveLocalCatalogs(catalogs);
      return catalogs[index];
    }

    const { data, error } = await supabase
      .from('catalogs')
      .update({ name, description })
      .eq('id', catalogId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCatalog(userId: string | null, catalogId: string): Promise<void> {
    if (!userId || !supabase) {
      const catalogs = this.getLocalCatalogs();
      const filtered = catalogs.filter(c => c.id !== catalogId);
      this.saveLocalCatalogs(filtered);

      if (this.getActiveCatalogId() === catalogId && filtered.length > 0) {
        this.setActiveCatalogId(filtered[0].id);
      }
      return;
    }

    const { error } = await supabase
      .from('catalogs')
      .delete()
      .eq('id', catalogId)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
