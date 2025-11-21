import type { BookAPIResponse } from '../types';

const HOLIDAY_KEYWORDS: Record<string, string[]> = {
  Christmas: ['christmas', 'santa', 'xmas', 'holiday', 'winter wonderland', 'reindeer', 'snowman'],
  Halloween: ['halloween', 'spooky', 'ghost', 'witch', 'pumpkin', 'haunted'],
  Easter: ['easter', 'bunny', 'egg'],
  Thanksgiving: ['thanksgiving', 'turkey', 'pilgrim'],
  Summer: ['summer', 'beach', 'vacation', 'sun'],
  Valentine: ['valentine', 'love', 'romance', 'heart'],
  'New Year': ['new year', 'resolution'],
};

function detectHolidayCategory(title: string, description: string): string | undefined {
  const searchText = `${title} ${description}`.toLowerCase();

  for (const [holiday, keywords] of Object.entries(HOLIDAY_KEYWORDS)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return holiday;
    }
  }

  return undefined;
}

function classifyGenre(categories: string[]): string {
  const fictionKeywords = ['fiction', 'novel', 'fantasy', 'science fiction', 'mystery', 'thriller', 'romance'];
  const nonFictionKeywords = ['biography', 'history', 'science', 'self-help', 'business', 'memoir', 'reference'];

  const categoriesLower = categories.map(c => c.toLowerCase()).join(' ');

  const hasFiction = fictionKeywords.some(keyword => categoriesLower.includes(keyword));
  const hasNonFiction = nonFictionKeywords.some(keyword => categoriesLower.includes(keyword));

  if (hasFiction && !hasNonFiction) return 'Fiction';
  if (hasNonFiction && !hasFiction) return 'Non-fiction';
  if (hasFiction) return 'Fiction';

  return 'Fiction';
}

export async function enrichBookData(title: string, author: string): Promise<BookAPIResponse> {
  try {
    const query = `${title} ${author}`.trim();
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch book data');
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        title,
        author,
      };
    }

    const bookInfo = data.items[0].volumeInfo;
    const categories = bookInfo.categories || [];
    const description = bookInfo.description || '';

    const enrichedData: BookAPIResponse = {
      title: bookInfo.title || title,
      author: bookInfo.authors?.join(', ') || author,
      genre: classifyGenre(categories),
      cover_image_url: bookInfo.imageLinks?.thumbnail?.replace('http:', 'https:') ||
                       bookInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:'),
      isbn: bookInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier ||
            bookInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier,
      publication_year: bookInfo.publishedDate ? parseInt(bookInfo.publishedDate.split('-')[0]) : undefined,
      description: description,
      holiday_category: detectHolidayCategory(bookInfo.title || title, description),
    };

    return enrichedData;
  } catch (error) {
    console.error('Error enriching book data:', error);
    return {
      title,
      author,
    };
  }
}
