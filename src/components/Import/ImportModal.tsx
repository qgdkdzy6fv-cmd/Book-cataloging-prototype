import { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { importService, ImportResult } from '../../services/importService';
import { bookService } from '../../services/bookService';
import type { BookFormData } from '../../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogId: string;
  onImportComplete: () => void;
}

type ImportStage = 'upload' | 'preview' | 'importing' | 'complete';

export function ImportModal({ isOpen, onClose, catalogId, onImportComplete }: ImportModalProps) {
  const [stage, setStage] = useState<ImportStage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('File selected:', selectedFile.name, selectedFile.size);
      setFile(selectedFile);
      setStage('upload');
      setImportResult(null);

      await handleAnalyzeFile(selectedFile);
    }
  };

  const handleAnalyzeFile = async (fileToAnalyze: File) => {
    setImporting(true);
    try {
      console.log('Analyzing file...');
      const result = await importService.importFromFile(fileToAnalyze);
      console.log('Analysis result:', result);
      setImportResult(result);

      if (result.success) {
        setStage('preview');
      } else {
        setStage('upload');
      }
    } catch (error: any) {
      console.error('Import analyze error:', error);
      setImportResult({
        success: false,
        books: [],
        errors: [error.message || 'Failed to analyze file'],
        warnings: [],
        totalRecords: 0,
        validRecords: 0,
      });
      setStage('upload');
    } finally {
      setImporting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    await handleAnalyzeFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'csv' || fileExtension === 'html' || fileExtension === 'htm') {
        console.log('File dropped:', droppedFile.name, droppedFile.size);
        setFile(droppedFile);
        setStage('upload');
        setImportResult(null);
        await handleAnalyzeFile(droppedFile);
      } else {
        alert('Please drop a CSV or HTML file.');
      }
    }
  };

  const handleImport = async () => {
    if (!importResult || !importResult.success) return;

    if (!catalogId) {
      alert('No catalog selected. Please select a catalog first.');
      return;
    }

    setImporting(true);
    setStage('importing');

    try {
      let successCount = 0;

      for (const bookData of importResult.books) {
        try {
          await bookService.addBook(null, catalogId, bookData);
          successCount++;
          setImportedCount(successCount);
        } catch (error) {
          console.error('Failed to import book:', bookData.title, error);
        }
      }

      setImportedCount(successCount);
      setStage('complete');
      onImportComplete();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import books. Please try again.');
      setStage('preview');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setStage('upload');
    setFile(null);
    setImportResult(null);
    setImportedCount(0);
    onClose();
  };

  const renderUploadStage = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Import Books</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Upload a CSV or HTML file that was previously exported from this application
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <Upload className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} size={48} />

        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv,.html,.htm"
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Choose a file
          </span>
          <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
        </label>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">CSV or HTML files only</p>

        {file && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </div>

      {importResult && !importResult.success && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-medium text-red-900 mb-2">Import Failed</p>
              {importResult.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-700">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleAnalyze}
          disabled={!file || importing}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {importing ? 'Analyzing...' : 'Analyze File'}
        </button>
      </div>
    </>
  );

  const renderPreviewStage = () => (
    <>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Preview Import</h2>

      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            <span className="font-medium text-green-900 dark:text-green-100">Ready to Import</span>
          </div>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {importResult?.validRecords}
          </span>
        </div>

        {importResult && importResult.warnings.length > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-h-40 overflow-y-auto">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
              <span className="font-medium text-yellow-900 dark:text-yellow-100">Warnings ({importResult.warnings.length})</span>
            </div>
            <div className="space-y-1">
              {importResult.warnings.slice(0, 5).map((warning, index) => (
                <p key={index} className="text-sm text-yellow-700 dark:text-yellow-300">{warning}</p>
              ))}
              {importResult.warnings.length > 5 && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  ... and {importResult.warnings.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Title</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Author</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200">Genre</th>
            </tr>
          </thead>
          <tbody>
            {importResult?.books.slice(0, 10).map((book, index) => (
              <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{book.title}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{book.author}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{book.genre || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {importResult && importResult.books.length > 10 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ... and {importResult.books.length - 10} more books
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStage('upload')}
          className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleImport}
          disabled={importing}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Import {importResult?.validRecords} Books
        </button>
      </div>
    </>
  );

  const renderImportingStage = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Importing Books</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {importedCount} / {importResult?.validRecords}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((importedCount / (importResult?.validRecords || 1)) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Importing your books...</p>
      </div>
    </>
  );

  const renderCompleteStage = () => (
    <>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Import Complete</h2>

      <div className="text-center py-8 mb-6">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
        </div>
        <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Successfully imported {importedCount} books!
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Your books have been added to the catalog
        </p>
      </div>

      <button
        onClick={handleClose}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Done
      </button>
    </>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && stage !== 'importing') {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {stage !== 'importing' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        )}

        {stage === 'upload' && renderUploadStage()}
        {stage === 'preview' && renderPreviewStage()}
        {stage === 'importing' && renderImportingStage()}
        {stage === 'complete' && renderCompleteStage()}
      </div>
    </div>
  );
}
