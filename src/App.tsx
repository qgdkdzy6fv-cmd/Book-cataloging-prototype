import { useState, useEffect } from 'react';
import { Library, LogIn, LogOut, Download, Upload, Search, FolderOpen, Edit2, Check, X, Sun, Moon } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { AuthModal } from './components/Auth/AuthModal';
import { AddBookForm } from './components/Books/AddBookForm';
import { BookGrid } from './components/Books/BookGrid';
import { BookFilters } from './components/Books/BookFilters';
import { RandomBookPicker } from './components/Books/RandomBookPicker';
import { BookDetailModal } from './components/Books/BookDetailModal';
import { ExportModal } from './components/Export/ExportModal';
import { ImportModal } from './components/Import/ImportModal';
import { CatalogSelectorModal } from './components/Catalogs/CatalogSelectorModal';
import { bookService } from './services/bookService';
import { catalogService } from './services/catalogService';
import type { Book, FilterOptions, Catalog } from './types';

function AppContent() {
  const { user, signOut, isGuest } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [activeCatalogId, setActiveCatalogId] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookDetailOpen, setBookDetailOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    loadCatalogs();
  }, [user]);

  useEffect(() => {
    if (activeCatalogId) {
      loadBooks();
    }
  }, [user, activeCatalogId]);

  useEffect(() => {
    const filtered = bookService.filterBooks(books, { ...filters, search: searchQuery });
    setFilteredBooks(filtered);
  }, [books, filters, searchQuery]);

  const loadCatalogs = async () => {
    try {
      const loadedCatalogs = await catalogService.getCatalogs(user?.id || null);
      setCatalogs(loadedCatalogs);

      const storedActiveCatalogId = catalogService.getActiveCatalogId();
      const validActiveCatalog = loadedCatalogs.find(c => c.id === storedActiveCatalogId);

      if (validActiveCatalog) {
        setActiveCatalogId(validActiveCatalog.id);
      } else if (loadedCatalogs.length > 0) {
        setActiveCatalogId(loadedCatalogs[0].id);
        catalogService.setActiveCatalogId(loadedCatalogs[0].id);
      }
    } catch (error) {
      console.error('Failed to load catalogs:', error);
    }
  };

  const loadBooks = async () => {
    if (!activeCatalogId) return;

    setLoading(true);
    try {
      const loadedBooks = await bookService.getBooks(user?.id || null, activeCatalogId);
      setBooks(loadedBooks);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCatalog = (catalogId: string) => {
    setActiveCatalogId(catalogId);
    catalogService.setActiveCatalogId(catalogId);
  };

  const handleCreateCatalog = async (name: string, description: string | null) => {
    const newCatalog = await catalogService.createCatalog(user?.id || null, name, description);
    await loadCatalogs();
    setActiveCatalogId(newCatalog.id);
    catalogService.setActiveCatalogId(newCatalog.id);
  };

  const handleUpdateCatalog = async (catalogId: string, name: string, description: string | null) => {
    await catalogService.updateCatalog(user?.id || null, catalogId, name, description);
    await loadCatalogs();
  };

  const handleDeleteCatalog = async (catalogId: string) => {
    await catalogService.deleteCatalog(user?.id || null, catalogId);
    await loadCatalogs();
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || !activeCatalogId) return;

    try {
      const activeCatalog = catalogs.find(c => c.id === activeCatalogId);
      if (activeCatalog) {
        await catalogService.updateCatalog(
          user?.id || null,
          activeCatalogId,
          editedTitle.trim(),
          activeCatalog.description
        );
        await loadCatalogs();
      }
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update catalog name:', error);
    }
  };

  const startEditingTitle = () => {
    const activeCatalog = catalogs.find(c => c.id === activeCatalogId);
    if (activeCatalog) {
      setEditedTitle(activeCatalog.name);
      setIsEditingTitle(true);
    }
  };

  const handlePickRandom = async () => {
    setLoading(true);
    try {
      const suggestion = await bookService.getRandomBookSuggestion(books);
      if (suggestion) {
        setShowAddBookForm(true);
        const form = document.querySelector('input[placeholder="Book Title"]') as HTMLInputElement;
        if (form) {
          setTimeout(() => {
            const titleInput = document.querySelector('input[placeholder="Book Title"]') as HTMLInputElement;
            const authorInput = document.querySelector('input[placeholder="Author"]') as HTMLInputElement;
            if (titleInput && authorInput) {
              titleInput.value = suggestion.title;
              authorInput.value = suggestion.author;
              titleInput.dispatchEvent(new Event('input', { bubbles: true }));
              authorInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to get random book suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setBookDetailOpen(true);
  };

  const handleToggleFavorite = async (bookId: string) => {
    try {
      await bookService.toggleFavorite(user?.id || null, bookId);
      await loadBooks();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleToggleRead = async (bookId: string) => {
    try {
      await bookService.toggleRead(user?.id || null, bookId);
      await loadBooks();
    } catch (error) {
      console.error('Failed to toggle read status:', error);
    }
  };

  const availableGenres = Array.from(new Set(books.filter(b => b.genre).map(b => b.genre!)));
  const availableHolidays = Array.from(new Set(books.filter(b => b.holiday_category).map(b => b.holiday_category!)));
  const availableTags = Array.from(new Set(books.flatMap(b => b.tags)));

  const activeCatalog = catalogs.find(c => c.id === activeCatalogId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Library size={32} className="text-blue-600 dark:text-blue-400" />
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                      className="text-2xl font-bold text-gray-900 dark:text-white dark:bg-gray-700 border-2 border-blue-600 rounded px-2 py-1 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check size={24} />
                    </button>
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={24} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCatalog?.name || 'My Book Catalog'}</h1>
                    <button
                      onClick={startEditingTitle}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isGuest ? 'Guest Mode (Local Storage)' : `Signed in as ${user?.email}`}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-2 py-0.5 rounded">BETA</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Export your work to avoid losing progress</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCatalogModalOpen(true)}
                className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <FolderOpen size={18} />
                Catalogs
              </button>

              <button
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Upload size={18} />
                Import
              </button>

              {books.length > 0 && (
                <button
                  onClick={() => setExportModalOpen(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={18} />
                  Export
                </button>
              )}

              {isGuest ? (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={20} className="text-gray-700 dark:text-gray-200" /> : <Moon size={20} className="text-gray-700" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddBookForm onBookAdded={loadBooks} catalogId={activeCatalogId} />

        {books.length > 0 && (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books by title, author, or description..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
            </div>

            <BookFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableGenres={availableGenres}
              availableHolidays={availableHolidays}
              availableTags={availableTags}
            />

            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                Showing {filteredBooks.length} of {books.length} book{books.length !== 1 ? 's' : ''}
              </p>
              <RandomBookPicker
                onPickRandom={handlePickRandom}
                disabled={filteredBooks.length === 0}
              />
            </div>
          </>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading books...</p>
          </div>
        ) : (
          <BookGrid books={filteredBooks} onBookClick={handleBookClick} onToggleFavorite={handleToggleFavorite} onToggleRead={handleToggleRead} />
        )}
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        catalogId={activeCatalogId}
        onImportComplete={loadBooks}
      />
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        books={filteredBooks}
      />
      <BookDetailModal
        book={selectedBook}
        isOpen={bookDetailOpen}
        onClose={() => {
          setBookDetailOpen(false);
          setSelectedBook(null);
        }}
        onUpdate={loadBooks}
      />
      <CatalogSelectorModal
        isOpen={catalogModalOpen}
        onClose={() => setCatalogModalOpen(false)}
        catalogs={catalogs}
        activeCatalogId={activeCatalogId}
        onSelectCatalog={handleSelectCatalog}
        onCreateCatalog={handleCreateCatalog}
        onUpdateCatalog={handleUpdateCatalog}
        onDeleteCatalog={handleDeleteCatalog}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
