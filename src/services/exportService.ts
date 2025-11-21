import type { Book, ExportFormat } from '../types';

function generateCSV(books: Book[]): string {
  const headers = [
    'Title',
    'Author',
    'Genre',
    'Holiday',
    'ISBN',
    'Year',
    'Description',
    'Tags',
    'Cover URL',
  ];

  const rows = books.map(book => [
    book.title,
    book.author,
    book.genre || '',
    book.holiday_category || '',
    book.isbn || '',
    book.publication_year?.toString() || '',
    book.description || '',
    book.tags.join('; '),
    book.cover_image_url || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

function generateHTML(books: Book[]): string {
  const bookRows = books.map(book => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">
        ${book.cover_image_url ? `<img src="${book.cover_image_url}" style="width: 50px; height: auto;" />` : ''}
      </td>
      <td style="border: 1px solid #ddd; padding: 8px;">${book.title}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${book.author}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${book.genre || ''}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${book.holiday_category || ''}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${book.publication_year || ''}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${book.tags.join(', ')}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>My Book Catalog</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #4CAF50;
          color: white;
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <h1>My Book Catalog</h1>
      <p>Total Books: ${books.length}</p>
      <table>
        <thead>
          <tr>
            <th>Cover</th>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Holiday</th>
            <th>Year</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          ${bookRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportService = {
  exportBooks(books: Book[], format: ExportFormat, filename: string = 'book-catalog') {
    const sanitizedFilename = filename.replace(/[^a-z0-9_-]/gi, '_') || 'book-catalog';
    const timestamp = new Date().toISOString().split('T')[0];
    const filenameWithDate = `${sanitizedFilename}-${timestamp}`;

    switch (format) {
      case 'csv':
        const csvContent = generateCSV(books);
        downloadFile(csvContent, `${filenameWithDate}.csv`, 'text/csv;charset=utf-8;');
        break;

      case 'xlsx':
        const htmlContent = generateHTML(books);
        downloadFile(htmlContent, `${filenameWithDate}.html`, 'text/html;charset=utf-8;');
        alert('Note: Excel format exported as HTML. Open the file and save as .xlsx from Excel for full compatibility.');
        break;

      case 'pdf':
        const pdfHtmlContent = generateHTML(books);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(pdfHtmlContent);
          printWindow.document.close();
          printWindow.print();
        }
        break;

      default:
        throw new Error('Unsupported export format');
    }
  },
};
