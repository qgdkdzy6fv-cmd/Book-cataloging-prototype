import { useState } from 'react';
import { X, Library, Book, Bookmark, BookOpen, Heart, Star, Flame, Sparkles, Award, Crown } from 'lucide-react';

interface CatalogEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogName: string;
  catalogIcon: string;
  onSave: (name: string, icon: string) => void;
}

const ICON_OPTIONS = [
  { name: 'Library', component: Library },
  { name: 'Book', component: Book },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Bookmark', component: Bookmark },
  { name: 'Heart', component: Heart },
  { name: 'Star', component: Star },
  { name: 'Flame', component: Flame },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Award', component: Award },
  { name: 'Crown', component: Crown },
];

export function CatalogEditModal({ isOpen, onClose, catalogName, catalogIcon, onSave }: CatalogEditModalProps) {
  const [name, setName] = useState(catalogName);
  const [selectedIcon, setSelectedIcon] = useState(catalogIcon);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedIcon);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Catalog</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catalog Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter catalog name"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choose Icon
            </label>
            <div className="grid grid-cols-5 gap-3">
              {ICON_OPTIONS.map(({ name: iconName, component: IconComponent }) => (
                <button
                  key={iconName}
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedIcon === iconName
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  title={iconName}
                >
                  <IconComponent
                    size={24}
                    className={selectedIcon === iconName ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
