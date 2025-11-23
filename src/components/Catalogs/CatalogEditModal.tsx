import { useState, useRef } from 'react';
import { X, Library, Book, Bookmark, BookOpen, Heart, Star, Flame, Sparkles, Award, Crown, Palette } from 'lucide-react';

interface CatalogEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogName: string;
  catalogIcon: string;
  catalogColor?: string;
  onSave: (name: string, icon: string, color: string) => void;
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

const COLOR_OPTIONS = [
  { name: 'Blue', hex: '#2563eb', class: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-600', border: 'border-blue-600' },
  { name: 'Green', hex: '#16a34a', class: 'text-green-600 dark:text-green-400', bg: 'bg-green-600', border: 'border-green-600' },
  { name: 'Red', hex: '#dc2626', class: 'text-red-600 dark:text-red-400', bg: 'bg-red-600', border: 'border-red-600' },
  { name: 'Orange', hex: '#ea580c', class: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-600', border: 'border-orange-600' },
  { name: 'Pink', hex: '#db2777', class: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-600', border: 'border-pink-600' },
];

export function CatalogEditModal({ isOpen, onClose, catalogName, catalogIcon, catalogColor = 'Blue', onSave }: CatalogEditModalProps) {
  const [name, setName] = useState(catalogName);
  const [selectedIcon, setSelectedIcon] = useState(catalogIcon);
  const [selectedColor, setSelectedColor] = useState(catalogColor);
  const [customColor, setCustomColor] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedIcon, selectedColor);
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Catalog Name</h2>
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
              {ICON_OPTIONS.map(({ name: iconName, component: IconComponent }) => {
                const isCustomColor = customColor !== null;
                const colorOption = COLOR_OPTIONS.find(c => c.name === selectedColor) || COLOR_OPTIONS[0];
                const isSelected = selectedIcon === iconName;

                return (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? isCustomColor
                          ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900'
                          : `${colorOption.border} bg-${selectedColor.toLowerCase()}-50 dark:bg-${selectedColor.toLowerCase()}-900`
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    title={iconName}
                  >
                    <IconComponent
                      size={24}
                      className={isSelected && !isCustomColor ? colorOption.class : 'text-gray-600 dark:text-gray-400'}
                      style={isSelected && isCustomColor ? { color: customColor } : undefined}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choose Color
            </label>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map(({ name: colorName, bg }) => {
                const isSelected = selectedColor === colorName && !customColor;
                return (
                  <button
                    key={colorName}
                    onClick={() => {
                      setSelectedColor(colorName);
                      setCustomColor(null);
                    }}
                    className={`w-10 h-10 rounded-full ${bg} border-4 transition-all ${
                      isSelected
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                    }`}
                    title={colorName}
                    aria-label={colorName}
                  />
                );
              })}
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                className={`w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center ${
                  customColor
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                }`}
                style={customColor ? { backgroundColor: customColor } : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)' }}
                title="Custom Color"
                aria-label="Custom Color"
              >
                {!customColor && <Palette size={20} className="text-white drop-shadow" />}
              </button>
              <input
                ref={colorInputRef}
                type="color"
                className="hidden"
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setSelectedColor(`custom:${e.target.value}`);
                }}
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-center gap-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
