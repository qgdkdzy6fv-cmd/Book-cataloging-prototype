import { useState, useEffect, useRef } from 'react';
import { Library, LogIn, LogOut, Download, Upload, Search, FolderOpen, Edit2, Sun, Moon, Menu, Book as BookIcon, Bookmark, BookOpen, Heart, Star, Flame, Sparkles, Award, Crown } from 'lucide-react';
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
import { CatalogEditModal } from './components/Catalogs/CatalogEditModal';
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
  const [catalogEditOpen, setCatalogEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const mobileSettingsRef = useRef<HTMLDivElement>(null);
  const desktopSettingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCatalogs();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const isInsideMobile = mobileSettingsRef.current && mobileSettingsRef.current.contains(target);
      const isInsideDesktop = desktopSettingsRef.current && desktopSettingsRef.current.contains(target);

      if (!isInsideMobile && !isInsideDesktop) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleUpdateCatalog = async (catalogId: string, name: string, description: string | null, icon?: string, color?: string) => {
    await catalogService.updateCatalog(user?.id || null, catalogId, name, description, icon, color);
    await loadCatalogs();
  };

  const handleDeleteCatalog = async (catalogId: string) => {
    await catalogService.deleteCatalog(user?.id || null, catalogId);
    await loadCatalogs();
  };

  const handleSaveCatalogEdit = async (name: string, icon: string, color: string) => {
    if (!activeCatalogId) return;

    try {
      const activeCatalog = catalogs.find(c => c.id === activeCatalogId);
      if (activeCatalog) {
        await catalogService.updateCatalog(
          user?.id || null,
          activeCatalogId,
          name,
          activeCatalog.description,
          icon,
          color
        );
        await loadCatalogs();
      }
    } catch (error) {
      console.error('Failed to update catalog:', error);
    }
  };

  const handlePickRandom = () => {
    if (books.length === 0) return;

    const randomBook = bookService.getRandomBook(books);
    if (randomBook) {
      setSelectedBook(randomBook);
      setBookDetailOpen(true);
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
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-gray-900 transition-colors pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors px-3 sm:px-6 lg:px-8 py-3 sm:py-4 relative">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {(() => {
                  const iconName = activeCatalog?.icon || 'Library';
                  const colorName = activeCatalog?.color || 'Blue';
                  const iconMap: { [key: string]: any } = {
                    Library, Book: BookIcon, Bookmark, BookOpen, Heart, Star, Flame, Sparkles, Award, Crown
                  };
                  const colorMap: { [key: string]: string } = {
                    Blue: 'text-blue-600 dark:text-blue-400',
                    Green: 'text-green-600 dark:text-green-400',
                    Red: 'text-red-600 dark:text-red-400',
                    Orange: 'text-orange-600 dark:text-orange-400',
                    Pink: 'text-pink-600 dark:text-pink-400',
                  };
                  const IconComponent = iconMap[iconName] || Library;
                  const isCustomColor = colorName.startsWith('custom:');
                  const customColor = isCustomColor ? colorName.replace('custom:', '') : null;
                  const colorClass = colorMap[colorName] || colorMap.Blue;
                  return (
                    <IconComponent
                      size={28}
                      className={`${!isCustomColor ? colorClass : ''} flex-shrink-0 sm:w-8 sm:h-8`}
                      style={isCustomColor ? { color: customColor } : undefined}
                    />
                  );
                })()}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{activeCatalog?.name || 'My Book Catalog'}</h1>
                    <button
                      onClick={() => setCatalogEditOpen(true)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 flex-shrink-0"
                    >
                      <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {isGuest ? 'Guest Mode (Local Storage)' : `Signed in as ${user?.email}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative lg:hidden" ref={mobileSettingsRef}>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  aria-label="Menu"
                >
                  <Menu size={18} className="text-gray-700 dark:text-gray-200" />
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          toggleTheme();
                          setSettingsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <button
                        onClick={() => {
                          setCatalogModalOpen(true);
                          setSettingsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FolderOpen size={18} />
                        Catalogs
                      </button>
                      <button
                        onClick={() => {
                          setImportModalOpen(true);
                          setSettingsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Upload size={18} />
                        Import
                      </button>
                      {books.length > 0 && (
                        <button
                          onClick={() => {
                            setExportModalOpen(true);
                            setSettingsOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Download size={18} />
                          Export
                        </button>
                      )}
                      {isGuest ? (
                        <button
                          onClick={() => {
                            setAuthModalOpen(true);
                            setSettingsOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogIn size={18} />
                          Sign In
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            signOut();
                            setSettingsOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>

            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 pointer-events-none">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-2 py-0.5 rounded whitespace-nowrap">BETA</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Export your catalog to avoid losing progress</p>
            </div>

            <div className="flex justify-end">
              <div className="hidden lg:block relative" ref={desktopSettingsRef}>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  aria-label="Menu"
                >
                  <Menu size={20} className="text-gray-700 dark:text-gray-200" />
                </button>

                {settingsOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          toggleTheme();
                          setSettingsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <button
                        onClick={() => {
                          setCatalogModalOpen(true);
                          setSettingsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FolderOpen size={18} />
                        Catalogs
                      </button>
                      <button
                        onClick={() => {
                          setImportModalOpen(true);
                          setSettingsOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Upload size={18} />
                        Import
                      </button>
                      {books.length > 0 && (
                        <button
                          onClick={() => {
                            setExportModalOpen(true);
                            setSettingsOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Download size={18} />
                          Export
                        </button>
                      )}
                      {isGuest ? (
                        <button
                          onClick={() => {
                            setAuthModalOpen(true);
                            setSettingsOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogIn size={18} />
                          Sign In
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            signOut();
                            setSettingsOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isGuest && (
              <div className="flex items-center justify-center gap-1.5 sm:hidden">
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900 px-1.5 py-0.5 rounded whitespace-nowrap">BETA</span>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Export to avoid losing progress</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddBookForm onBookAdded={loadBooks} catalogId={activeCatalogId} />

        {books.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or description"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-3">
                <BookFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableGenres={availableGenres}
                  availableHolidays={availableHolidays}
                  availableTags={availableTags}
                />
                <RandomBookPicker
                  onPickRandom={handlePickRandom}
                  disabled={filteredBooks.length === 0}
                />
              </div>
              <p className="text-gray-600 dark:text-gray-300 hidden sm:block">
                Showing {filteredBooks.length} of {books.length} book{books.length !== 1 ? 's' : ''}
              </p>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6 sm:hidden">
              Showing {filteredBooks.length} of {books.length} book{books.length !== 1 ? 's' : ''}
            </p>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Loading books...</p>
              </div>
            ) : (
              <BookGrid books={filteredBooks} onBookClick={handleBookClick} onToggleFavorite={handleToggleFavorite} onToggleRead={handleToggleRead} />
            )}
          </div>
        )}

        {!books.length && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No books yet. Add your first book above!</p>
          </div>
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
        catalogName={catalogs.find(c => c.id === activeCatalogId)?.name || 'book-catalog'}
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
      <CatalogEditModal
        isOpen={catalogEditOpen}
        onClose={() => setCatalogEditOpen(false)}
        catalogName={activeCatalog?.name || ''}
        catalogIcon={activeCatalog?.icon || 'Library'}
        catalogColor={activeCatalog?.color || 'Blue'}
        onSave={handleSaveCatalogEdit}
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
