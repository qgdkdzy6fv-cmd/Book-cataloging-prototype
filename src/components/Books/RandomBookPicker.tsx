import { Shuffle } from 'lucide-react';

interface RandomBookPickerProps {
  onPickRandom: () => void;
  disabled?: boolean;
}

export function RandomBookPicker({ onPickRandom, disabled }: RandomBookPickerProps) {
  return (
    <button
      onClick={onPickRandom}
      disabled={disabled}
      className="bg-gradient-to-r from-orange-500 to-pink-600 dark:from-orange-600 dark:to-pink-700 text-white py-2 px-6 rounded-lg hover:from-orange-600 hover:to-pink-700 dark:hover:from-orange-700 dark:hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
    >
      <Shuffle size={20} />
      Suggest Random Book
    </button>
  );
}
