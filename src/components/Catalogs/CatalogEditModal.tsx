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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState('#2563eb');

  if (!isOpen) return null;

  const handleSave = () => {
    const finalName = name.trim() || catalogName;
    onSave(finalName, selectedIcon, selectedColor);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <>
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
                placeholder={catalogName}
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
              <div className="flex flex-wrap gap-3 justify-center">
                {COLOR_OPTIONS.map(({ name: colorName, bg, hex }) => {
                  const isSelected = selectedColor === colorName && !customColor;
                  return (
                    <button
                      key={colorName}
                      onClick={() => {
                        setSelectedColor(colorName);
                        setCustomColor(null);
                      }}
                      className={`w-14 h-14 rounded-xl ${bg} shadow-md transition-all ${
                        isSelected
                          ? 'ring-4 ring-gray-900 dark:ring-white scale-110'
                          : 'hover:scale-105 hover:shadow-lg'
                      }`}
                      title={colorName}
                      aria-label={colorName}
                    />
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setTempColor(customColor || '#2563eb');
                    setShowColorPicker(true);
                  }}
                  className={`w-14 h-14 rounded-xl shadow-md transition-all flex items-center justify-center ${
                    customColor
                      ? 'ring-4 ring-gray-900 dark:ring-white scale-110'
                      : 'hover:scale-105 hover:shadow-lg'
                  }`}
                  style={customColor ? { backgroundColor: customColor } : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)' }}
                  title="Custom Color"
                  aria-label="Custom Color"
                >
                  {!customColor && <Palette size={24} className="text-white drop-shadow" />}
                </button>
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
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Pick a Custom Color</h3>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div
                  className="w-32 h-32 rounded-2xl shadow-lg border-4 border-gray-200 dark:border-gray-600"
                  style={{ backgroundColor: tempColor }}
                />
              </div>

              <input
                type="color"
                value={tempColor}
                onChange={(e) => setTempColor(e.target.value)}
                className="w-full h-16 rounded-xl cursor-pointer border-4 border-gray-300 dark:border-gray-600"
              />

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected Color</p>
                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">{tempColor.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowColorPicker(false)}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCustomColor(tempColor);
                  setSelectedColor(`custom:${tempColor}`);
                  setShowColorPicker(false);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
