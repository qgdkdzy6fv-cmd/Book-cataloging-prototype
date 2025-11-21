import { supabase } from '../lib/supabase';

export async function uploadBookCover(
  userId: string | null,
  bookId: string,
  file: File
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image must be smaller than 5MB');
  }

  const fileExt = file.name.split('.').pop();
  const userFolder = userId || 'guest';
  const fileName = `${userFolder}/${bookId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('book-covers')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('book-covers')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteBookCover(imageUrl: string, userId: string | null): Promise<void> {
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const fileName = pathParts.slice(pathParts.indexOf('book-covers') + 1).join('/');

  const { error } = await supabase.storage
    .from('book-covers')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}
