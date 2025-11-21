import type { BookFormData } from '../types';

export interface ImportResult {
  success: boolean;
  books: BookFormData[];
  errors: string[];
  warnings: string[];
  totalRecords: number;
  validRecords: number;
}

function parseCSV(content: string): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const books: BookFormData[] = [];

  try {
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      return {
        success: false,
        books: [],
        errors: ['CSV file is empty or contains only headers'],
        warnings: [],
        totalRecords: 0,
        validRecords: 0,
      };
    }

    const headerLine = lines[0];
    const expectedHeaders = ['Title', 'Author', 'Genre', 'Holiday', 'ISBN', 'Year', 'Description', 'Tags', 'Cover URL'];

    const parsedHeaders = parseCSVLine(headerLine);
    const headerMap = new Map<string, number>();

    parsedHeaders.forEach((header, index) => {
      const normalized = header.trim();
      headerMap.set(normalized, index);
    });

    if (!headerMap.has('Title') || !headerMap.has('Author')) {
      errors.push('CSV must contain at least "Title" and "Author" columns');
      return {
        success: false,
        books: [],
        errors,
        warnings: [],
        totalRecords: lines.length - 1,
        validRecords: 0,
      };
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);

        const title = values[headerMap.get('Title') ?? 0]?.trim();
        const author = values[headerMap.get('Author') ?? 1]?.trim();

        if (!title || !author) {
          warnings.push(`Row ${i + 1}: Skipped - missing title or author`);
          continue;
        }

        const book: BookFormData = {
          title,
          author,
          genre: values[headerMap.get('Genre') ?? 2]?.trim() || undefined,
          holiday_category: values[headerMap.get('Holiday') ?? 3]?.trim() || undefined,
          isbn: values[headerMap.get('ISBN') ?? 4]?.trim() || undefined,
          description: values[headerMap.get('Description') ?? 6]?.trim() || undefined,
          cover_image_url: values[headerMap.get('Cover URL') ?? 8]?.trim() || undefined,
        };

        const yearStr = values[headerMap.get('Year') ?? 5]?.trim();
        if (yearStr) {
          const year = parseInt(yearStr, 10);
          if (!isNaN(year) && year > 0 && year <= new Date().getFullYear() + 10) {
            book.publication_year = year;
          } else {
            warnings.push(`Row ${i + 1}: Invalid year "${yearStr}" - skipped`);
          }
        }

        const tagsStr = values[headerMap.get('Tags') ?? 7]?.trim();
        if (tagsStr) {
          book.tags = tagsStr.split(';').map(tag => tag.trim()).filter(tag => tag);
        }

        books.push(book);
      } catch (rowError: any) {
        warnings.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    return {
      success: books.length > 0,
      books,
      errors,
      warnings,
      totalRecords: lines.length - 1,
      validRecords: books.length,
    };
  } catch (error: any) {
    return {
      success: false,
      books: [],
      errors: [`Failed to parse CSV: ${error.message}`],
      warnings,
      totalRecords: 0,
      validRecords: 0,
    };
  }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseHTML(content: string): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const books: BookFormData[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const rows = doc.querySelectorAll('tbody tr');

    if (rows.length === 0) {
      return {
        success: false,
        books: [],
        errors: ['No book data found in HTML file'],
        warnings: [],
        totalRecords: 0,
        validRecords: 0,
      };
    }

    rows.forEach((row, index) => {
      try {
        const cells = row.querySelectorAll('td');

        if (cells.length < 7) {
          warnings.push(`Row ${index + 1}: Not enough columns - skipped`);
          return;
        }

        const coverImg = cells[0].querySelector('img');
        const title = cells[1]?.textContent?.trim();
        const author = cells[2]?.textContent?.trim();
        const genre = cells[3]?.textContent?.trim();
        const holiday = cells[4]?.textContent?.trim();
        const yearStr = cells[5]?.textContent?.trim();
        const tagsStr = cells[6]?.textContent?.trim();

        if (!title || !author) {
          warnings.push(`Row ${index + 1}: Missing title or author - skipped`);
          return;
        }

        const book: BookFormData = {
          title,
          author,
          genre: genre || undefined,
          holiday_category: holiday || undefined,
          cover_image_url: coverImg?.src || undefined,
        };

        if (yearStr) {
          const year = parseInt(yearStr, 10);
          if (!isNaN(year) && year > 0 && year <= new Date().getFullYear() + 10) {
            book.publication_year = year;
          }
        }

        if (tagsStr) {
          book.tags = tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        books.push(book);
      } catch (rowError: any) {
        warnings.push(`Row ${index + 1}: ${rowError.message}`);
      }
    });

    return {
      success: books.length > 0,
      books,
      errors,
      warnings,
      totalRecords: rows.length,
      validRecords: books.length,
    };
  } catch (error: any) {
    return {
      success: false,
      books: [],
      errors: [`Failed to parse HTML: ${error.message}`],
      warnings,
      totalRecords: 0,
      validRecords: 0,
    };
  }
}

function detectFileFormat(content: string, filename: string): 'csv' | 'html' | 'unknown' {
  const lowerFilename = filename.toLowerCase();

  if (lowerFilename.endsWith('.csv')) {
    return 'csv';
  }

  if (lowerFilename.endsWith('.html') || lowerFilename.endsWith('.htm')) {
    return 'html';
  }

  if (content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')) {
    return 'html';
  }

  if (content.includes('Title,Author') || content.includes('"Title","Author"')) {
    return 'csv';
  }

  return 'unknown';
}

export const importService = {
  async importFromFile(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;

          if (!content) {
            resolve({
              success: false,
              books: [],
              errors: ['File is empty'],
              warnings: [],
              totalRecords: 0,
              validRecords: 0,
            });
            return;
          }

          const format = detectFileFormat(content, file.name);

          let result: ImportResult;

          switch (format) {
            case 'csv':
              result = parseCSV(content);
              break;
            case 'html':
              result = parseHTML(content);
              break;
            default:
              result = {
                success: false,
                books: [],
                errors: ['Unsupported file format. Please upload a CSV or HTML file exported from this application.'],
                warnings: [],
                totalRecords: 0,
                validRecords: 0,
              };
          }

          resolve(result);
        } catch (error: any) {
          resolve({
            success: false,
            books: [],
            errors: [`Failed to read file: ${error.message}`],
            warnings: [],
            totalRecords: 0,
            validRecords: 0,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          success: false,
          books: [],
          errors: ['Failed to read file'],
          warnings: [],
          totalRecords: 0,
          validRecords: 0,
        });
      };

      reader.readAsText(file);
    });
  },
};
