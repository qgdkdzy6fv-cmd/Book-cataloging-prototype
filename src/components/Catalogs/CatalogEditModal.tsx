import { useState } from 'react';
import { X, Library, Book, Bookmark, BookOpen, Heart, Star, Flame, Sparkles, Award, Crown, Users, GraduationCap, Home, Briefcase, Music } from 'lucide-react';

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
  { name: 'Users', component: Users },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Home', component: Home },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Music', component: Music },
];

const COLOR_OPTIONS = [
  { name: 'Blue', hex: '#2563eb', class: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-600', border: 'border-blue-600' },
  { name: 'Green', hex: '#16a34a', class: 'text-green-600 dark:text-green-400', bg: 'bg-green-600', border: 'border-green-600' },
  { name: 'Red', hex: '#dc2626', class: 'text-red-600 dark:text-red-400', bg: 'bg-red-600', border: 'border-red-600' },
  { name: 'Orange', hex: '#ea580c', class: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-600', border: 'border-orange-600' },
  { name: 'Pink', hex: '#db2777', class: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-600', border: 'border-pink-600' },
  { name: 'Purple', hex: '#9333ea', class: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-600', border: 'border-purple-600' },
  { name: 'Yellow', hex: '#ca8a04', class: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-600', border: 'border-yellow-600' },
  { name: 'Teal', hex: '#0d9488', class: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-600', border: 'border-teal-600' },
  { name: 'Cyan', hex: '#0891b2', class: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-600', border: 'border-cyan-600' },
  { name: 'Slate', hex: '#475569', class: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-600', border: 'border-slate-600' },
];

export function CatalogEditModal({ isOpen, onClose, catalogName, catalogIcon, catalogColor = 'Blue', onSave }: CatalogEditModalProps) {
  const [name, setName] = useState(catalogName);
  const [selectedIcon, setSelectedIcon] = useState(catalogIcon);
  const [selectedColor, setSelectedColor] = useState(catalogColor);
  const [customColor, setCustomColor] = useState<string | null>(null);

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
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center ${
                      isSelected
                        ? isCustomColor
                          ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-700'
                          : `${colorOption.border} bg-gray-100 dark:bg-gray-700`
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
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
            <div className="grid grid-cols-5 gap-3 justify-items-center">
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
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 -mx-6 px-6 flex justify-center gap-3">
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
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
