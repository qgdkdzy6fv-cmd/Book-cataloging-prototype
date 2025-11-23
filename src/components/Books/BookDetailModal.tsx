import { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2, BookOpen, Tag as TagIcon, Upload, Image as ImageIcon, RotateCcw, XCircle } from 'lucide-react';
import { bookService } from '../../services/bookService';
import { uploadBookCover, deleteBookCover } from '../../services/imageUploadService';
import { enrichBookData } from '../../services/bookApi';
import { useAuth } from '../../contexts/AuthContext';
import type { Book } from '../../types';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function BookDetailModal({ book, isOpen, onClose, onUpdate }: BookDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState<Partial<Book>>({});
  const [displayBook, setDisplayBook] = useState<Book | null>(null);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resettingImage, setResettingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (book) {
      setEditedBook(book);
      setDisplayBook(book);
      setIsEditing(false);
      setError('');
    }
  }, [book]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !displayBook) return null;

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      await bookService.updateBook(user?.id || null, displayBook.id, {
        title: editedBook.title,
        author: editedBook.author,
        genre: editedBook.genre || undefined,
        holiday_category: editedBook.holiday_category || undefined,
        cover_image_url: editedBook.cover_image_url || undefined,
        isbn: editedBook.isbn || undefined,
        publication_year: editedBook.publication_year || undefined,
        description: editedBook.description || undefined,
        tags: editedBook.tags || [],
      });

      setDisplayBook(editedBook as Book);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await bookService.deleteBook(user?.id || null, displayBook.id);
      setShowDeleteConfirm(false);
      onClose();
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to delete book');
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    const currentTags = editedBook.tags || [];
    if (currentTags.includes(newTag.trim())) return;

    setEditedBook({
      ...editedBook,
      tags: [...currentTags, newTag.trim()],
    });
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setEditedBook({
      ...editedBook,
      tags: (editedBook.tags || []).filter(tag => tag !== tagToRemove),
    });
  };

  const uploadImage = async (file: File) => {

    setUploadingImage(true);
    setError('');

    try {
      const oldImageUrl = editedBook.cover_image_url;
      const imageUrl = await uploadBookCover(user?.id || null, displayBook.id, file);

      const updatedBookData = {
        ...editedBook,
        cover_image_url: imageUrl,
      };

      setEditedBook(updatedBookData);

      await bookService.updateBook(user?.id || null, displayBook.id, updatedBookData);

      setDisplayBook(updatedBookData as Book);

      if (oldImageUrl && oldImageUrl.includes('supabase')) {
        await deleteBookCover(oldImageUrl, user?.id || null);
      }

      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadModal(false);
    await uploadImage(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingImage) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploadingImage) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file');
      return;
    }

    setShowUploadModal(false);
    await uploadImage(file);
  };

  const handleRemoveImage = async () => {
    if (!confirm('Are you sure you want to remove this cover image?')) return;

    setLoading(true);
    setError('');

    try {
      const oldImageUrl = editedBook.cover_image_url;

      const updatedBookData = {
        ...editedBook,
        cover_image_url: undefined,
      };

      setEditedBook(updatedBookData);

      await bookService.updateBook(user?.id || null, displayBook.id, updatedBookData);

      setDisplayBook(updatedBookData as Book);

      if (oldImageUrl && oldImageUrl.includes('supabase')) {
        await deleteBookCover(oldImageUrl, user?.id || null);
      }

      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to remove image');
    } finally {
      setLoading(false);
    }
  };

  const handleResetImage = async () => {
    setResettingImage(true);
    setError('');
    setShowResetModal(false);

    try {
      const oldImageUrl = editedBook.cover_image_url;
      const enrichedData = await enrichBookData(editedBook.title || displayBook.title, editedBook.author || displayBook.author);

      const newCoverUrl = enrichedData.cover_image_url;

      const updatedBookData = {
        ...editedBook,
        cover_image_url: newCoverUrl,
      };

      setEditedBook(updatedBookData);

      await bookService.updateBook(user?.id || null, displayBook.id, updatedBookData);

      setDisplayBook(updatedBookData as Book);

      if (oldImageUrl && oldImageUrl.includes('supabase')) {
        await deleteBookCover(oldImageUrl, user?.id || null);
      }

      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to reset image to default');
    } finally {
      setResettingImage(false);
    }
  };

  const handleResetInfo = () => {
    setEditedBook(book!);
    setDisplayBook(book!);
    setShowResetModal(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto overscroll-contain touch-pan-y"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full m-4 relative transition-colors max-h-[calc(100vh-2rem)] overflow-y-auto touch-pan-y"
        style={{ overflowX: 'hidden', maxWidth: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row">
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`md:w-1/3 bg-gray-100 dark:bg-gray-700 p-6 flex flex-col items-center justify-center gap-4 transition-all relative ${
              isDragging && isEditing ? 'ring-4 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/30' : ''
            }`}
          >
            {isDragging && isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-90 z-10 rounded-lg pointer-events-none">
                <div className="text-center text-white">
                  <Upload size={48} className="mx-auto mb-2" />
                  <p className="text-lg font-semibold">Drop image here</p>
                </div>
              </div>
            )}

            <div className="relative group">
              {editedBook.cover_image_url ? (
                <img
                  src={editedBook.cover_image_url}
                  alt={editedBook.title}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-12">
                  <BookOpen size={64} className="text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <button
                  onClick={() => setShowUploadModal(true)}
                  disabled={uploadingImage || resettingImage}
                  className="flex-1 flex items-center justify-center bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Upload Image"
                >
                  {uploadingImage ? (
                    <Upload size={18} className="animate-pulse" />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="md:w-2/3 p-6 dark:text-white transition-colors">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedBook.title || ''}
                    onChange={(e) => setEditedBook({ ...editedBook, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <h2 className="text-2xl font-bold dark:text-white">{displayBook.title}</h2>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedBook.author || ''}
                    onChange={(e) => setEditedBook({ ...editedBook, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-lg text-gray-700 dark:text-gray-300">{displayBook.author}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                  {isEditing ? (
                    <select
                      value={editedBook.genre || ''}
                      onChange={(e) => setEditedBook({ ...editedBook, genre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">None</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-fiction">Non-fiction</option>
                    </select>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{displayBook.genre || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Holiday or Season</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedBook.holiday_category || ''}
                      onChange={(e) => setEditedBook({ ...editedBook, holiday_category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{displayBook.holiday_category || 'Not specified'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ISBN</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedBook.isbn || ''}
                      onChange={(e) => setEditedBook({ ...editedBook, isbn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{displayBook.isbn || 'Not available'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Publication Year</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedBook.publication_year || ''}
                      onChange={(e) => setEditedBook({ ...editedBook, publication_year: parseInt(e.target.value) || null })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{displayBook.publication_year || 'Not available'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    value={editedBook.description || ''}
                    onChange={(e) => setEditedBook({ ...editedBook, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white h-24"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{displayBook.description || 'No description available'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <TagIcon size={16} />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editedBook.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      {isEditing && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag"
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <button
                      onClick={addTag}
                      className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="bg-red-600 text-white p-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Delete"
              >
                <Trash2 size={20} />
              </button>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setShowResetModal(true)}
                      disabled={loading}
                      className="border border-orange-500 text-orange-600 dark:text-orange-400 p-3 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Reset"
                    >
                      <RotateCcw size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setEditedBook(displayBook);
                        setIsEditing(false);
                      }}
                      className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title="Cancel"
                    >
                      <XCircle size={20} />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Save"
                    >
                      <Save size={20} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Remove Book from Catalog?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to remove "{displayBook.title}" from your catalog? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  {loading ? 'Removing...' : 'Remove Book'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showUploadModal && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 rounded-lg p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Upload Cover Image
              </h3>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <Upload className={`mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} size={48} />
                <label className="cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    Choose a file
                  </span>
                  <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">JPG, PNG or WEBP</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploadingImage}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showResetModal && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 rounded-lg p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Reset Options
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                What would you like to reset?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResetImage}
                  disabled={resettingImage || loading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <ImageIcon size={20} />
                  {resettingImage ? 'Resetting Image...' : 'Reset Image'}
                </button>
                <button
                  onClick={handleResetInfo}
                  disabled={resettingImage || loading}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <BookOpen size={20} />
                  Reset Info
                </button>
                <button
                  onClick={() => setShowResetModal(false)}
                  disabled={resettingImage || loading}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
