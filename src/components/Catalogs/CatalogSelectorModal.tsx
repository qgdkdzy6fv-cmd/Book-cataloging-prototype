import { useState } from 'react';
import { X, Plus, Trash2, FolderOpen, Edit2, Check } from 'lucide-react';
import type { Catalog } from '../../types';

interface CatalogSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogs: Catalog[];
  activeCatalogId: string;
  onSelectCatalog: (catalogId: string) => void;
  onCreateCatalog: (name: string, description: string | null) => Promise<void>;
  onUpdateCatalog: (catalogId: string, name: string, description: string | null) => Promise<void>;
  onDeleteCatalog: (catalogId: string) => Promise<void>;
}

export function CatalogSelectorModal({
  isOpen,
  onClose,
  catalogs,
  activeCatalogId,
  onSelectCatalog,
  onCreateCatalog,
  onUpdateCatalog,
  onDeleteCatalog,
}: CatalogSelectorModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await onCreateCatalog(newName.trim(), newDescription.trim() || null);
      setNewName('');
      setNewDescription('');
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (catalogId: string) => {
    if (catalogs.length <= 1) {
      alert('You must have at least one catalog');
      return;
    }

    if (!confirm('Are you sure you want to delete this catalog? All books in this catalog will be deleted.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onDeleteCatalog(catalogId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAndClose = (catalogId: string) => {
    onSelectCatalog(catalogId);
    onClose();
  };

  const startEditing = (catalog: Catalog) => {
    setEditingId(catalog.id);
    setEditedName(catalog.name);
    setEditedDescription(catalog.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedName('');
    setEditedDescription('');
  };

  const handleUpdate = async (catalogId: string) => {
    if (!editedName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await onUpdateCatalog(catalogId, editedName.trim(), editedDescription.trim() || null);
      setEditingId(null);
      setEditedName('');
      setEditedDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to update catalog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative transition-colors">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen size={24} />
            My Catalogs
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {catalogs.map((catalog) => (
              <div
                key={catalog.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  catalog.id === activeCatalogId
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {editingId === catalog.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Catalog Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Fiction Collection"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description (optional)
                      </label>
                      <input
                        type="text"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., My favorite fiction books"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(catalog.id)}
                        disabled={loading || !editedName.trim()}
                        className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => handleSelectAndClose(catalog.id)}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{catalog.name}</h3>
                      {catalog.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{catalog.description}</p>
                      )}
                      {catalog.id === activeCatalogId && (
                        <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => startEditing(catalog)}
                        disabled={loading}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                      >
                        <Edit2 size={18} />
                      </button>
                      {catalogs.length > 1 && (
                        <button
                          onClick={() => handleDelete(catalog.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {isCreating ? (
            <form onSubmit={handleCreate} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Create New Catalog</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="catalog-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Catalog Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="catalog-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Fiction Collection"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="catalog-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <input
                    id="catalog-description"
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., My favorite fiction books"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !newName.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Catalog'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setNewName('');
                      setNewDescription('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Plus size={20} />
              Create New Catalog
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
