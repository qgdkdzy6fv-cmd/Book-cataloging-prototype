import { X, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { exportService } from '../../services/exportService';
import type { Book, ExportFormat } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  catalogName?: string;
}

export function ExportModal({ isOpen, onClose, books, catalogName = 'book-catalog' }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState(catalogName);

  useEffect(() => {
    if (isOpen) {
      setFilename(catalogName);
    }
  }, [isOpen, catalogName]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      exportService.exportBooks(books, selectedFormat, filename);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formats: { value: ExportFormat; label: string; description: string; icon: any }[] = [
    {
      value: 'csv',
      label: 'CSV',
      description: 'Compatible with Excel, Numbers, Google Sheets',
      icon: FileSpreadsheet,
    },
    {
      value: 'xlsx',
      label: 'Excel (HTML)',
      description: 'Open in Excel and save as .xlsx',
      icon: FileSpreadsheet,
    },
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Print-ready document',
      icon: FileText,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Export Catalog</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Export {books.length} book{books.length !== 1 ? 's' : ''} to your preferred format
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filename
          </label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Enter filename"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            File extension will be added automatically
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {formats.map((format) => (
            <label
              key={format.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedFormat === format.value
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={format.value}
                checked={selectedFormat === format.value}
                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <format.icon size={18} />
                  <span className="font-semibold text-gray-900 dark:text-white">{format.label}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{format.description}</p>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Download size={20} />
          {loading ? 'Exporting...' : 'Export Catalog'}
        </button>
      </div>
    </div>
  );
}
