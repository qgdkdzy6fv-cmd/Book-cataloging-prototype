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
      className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-600 dark:from-orange-600 dark:to-pink-700 text-white py-2 px-6 rounded-lg hover:from-orange-600 hover:to-pink-700 dark:hover:from-orange-700 dark:hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
    >
      <Shuffle size={20} className="flex-shrink-0" />
      <span>Suggest Book</span>
    </button>
  );
}
