# Personal Book Catalog

A beautiful, feature-rich web application for managing your personal book collection with automatic data enrichment, advanced filtering, and dual-mode storage (local or cloud).

## Features

### Core Functionality
- **Simple Book Entry:** Just enter title and author - everything else is automatic
- **Auto-Enrichment:** Fetches cover images, genre, ISBN, publication year, and descriptions from Google Books API
- **Smart Holiday Detection:** Automatically categorizes seasonal books (Christmas, Halloween, etc.)
- **Advanced Filtering:** Filter by genre, holiday category, custom tags, and text search
- **Random Book Picker:** Discover books from your collection (respects active filters)
- **Inline Editing:** Edit any book field directly with full manual override support
- **Export Functionality:** Export to CSV, Excel (HTML), or PDF formats

### Dual-Mode Architecture
- **Guest Mode:** Uses browser localStorage - no account required, instant access
- **Registered Mode:** Cloud storage with Supabase - sync across devices

### User Experience
- **Responsive Design:** Works beautifully on mobile, tablet, and desktop
- **Beautiful UI:** Modern gradient backgrounds, smooth transitions, professional styling
- **Touch-Optimized:** Large buttons and touch-friendly interactions
- **Real-Time Updates:** Instant visual feedback for all actions
- **Empty States:** Helpful messaging when starting out

## Quick Start

### Try It Instantly (Guest Mode)

```bash
npm install
npm run dev
```

That's it! Start adding books immediately. See `QUICK_START.md` for more details.

### Full Setup with Cloud Storage

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Run the SQL migration from `DATABASE_SETUP.md` in your Supabase SQL Editor
3. Add your Supabase credentials to `.env` (URL and anon key already configured)
4. Run the application:

```bash
npm install
npm run dev
```

See `QUICK_START.md` for detailed setup instructions.

## Documentation

- **QUICK_START.md** - Get running in 5 minutes
- **FEATURES.md** - Complete feature overview
- **IMPLEMENTATION_GUIDE.md** - Technical architecture and implementation details
- **DATABASE_SETUP.md** - Database schema and setup instructions

## Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Supabase (PostgreSQL + Authentication)
- **APIs:** Google Books API for data enrichment
- **Storage:** Local Storage (guest) or Supabase (registered)

## Screenshots

### Main Dashboard
Beautiful grid display of your book collection with cover images and metadata.

### Book Entry Form
Simple two-field form - just title and author. Everything else is automatic!

### Filtering System
Filter by genre, holiday, tags, or search text to find exactly what you need.

### Book Details
Full book information with inline editing, tag management, and delete options.

### Export Modal
Choose from multiple export formats to backup or share your collection.

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication modals
│   ├── Books/          # Book-related components
│   └── Export/         # Export functionality
├── contexts/           # React contexts (Auth)
├── services/           # Business logic and API calls
├── types/              # TypeScript type definitions
└── lib/                # Third-party library configuration
```

## Development

### Prerequisites
- Node.js 16+ and npm
- A Supabase account (optional, for cloud storage)

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Type Check
```bash
npm run typecheck
```

### Lint
```bash
npm run lint
```

## Usage Guide

### Adding Books
1. Enter book title and author
2. Click "Add Book"
3. Watch as cover image, genre, and other details appear automatically
4. Edit any details that need customization

### Finding Books
- Use the search bar for quick text search
- Click "Filters" to filter by genre, holiday, or tags
- Use multiple filters simultaneously
- Click "Pick Random Book" for a surprise

### Organizing
- Click any book to open details
- Add custom tags (e.g., "Favorite", "To Read", "Borrowed")
- Edit any field manually
- Genre and holiday categories populate automatically

### Exporting
- Click "Export" in the header
- Choose your format (CSV, Excel, or PDF)
- Export includes all filtered books
- Perfect for backups or sharing

## Features in Detail

### Automatic Data Enrichment

When you add a book, the app:
1. Queries Google Books API with title and author
2. Extracts the best cover image available
3. Classifies genre as Fiction or Non-fiction
4. Detects holiday/seasonal themes
5. Retrieves ISBN, publication year, and description
6. All happens automatically in seconds

### Holiday Detection

Smart keyword-based detection for:
- Christmas (santa, xmas, holiday themes)
- Halloween (spooky, ghost, witch themes)
- Easter (bunny, egg themes)
- Thanksgiving (turkey, pilgrim themes)
- Summer (beach, vacation themes)
- Valentine (love, romance themes)
- New Year (resolution themes)

### Filtering System

Combine multiple filters:
- **Genre:** Fiction or Non-fiction
- **Holiday:** Any detected holiday category
- **Tags:** Your custom tags (additive)
- **Search:** Text search across title, author, description

The random book picker respects all active filters!

### Guest vs Registered Mode

**Guest Mode:**
- ✅ No account needed
- ✅ Instant access
- ✅ 100% private (local only)
- ✅ Full feature access
- ❌ No cross-device sync
- ❌ Data only on current browser

**Registered Mode:**
- ✅ Cross-device sync
- ✅ Access from anywhere
- ✅ Cloud backup
- ✅ Data persistence
- ✅ Full feature access
- ⚠️ Requires Supabase setup

## Security

- **Row Level Security:** Database policies ensure users only see their own books
- **Secure Authentication:** Email/password with Supabase Auth
- **Type Safety:** TypeScript prevents runtime errors
- **Input Validation:** All user inputs validated
- **SQL Injection Protection:** Parameterized queries via Supabase client

## Performance

- **Fast Initial Load:** Optimized bundle (89KB gzipped)
- **Efficient Filtering:** Client-side processing
- **Database Indexes:** Optimized queries for registered users
- **Image Handling:** Fallback icons for missing covers
- **Lazy Loading:** Components loaded on demand

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Recommended Platforms
- Vercel
- Netlify
- Cloudflare Pages

### Environment Variables
Set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build Command
```bash
npm run build
```

### Output Directory
```bash
dist/
```

## Troubleshooting

### Books not appearing after refresh
- Check Supabase connection in browser console
- Verify environment variables are set correctly
- Ensure database migration was run successfully

### Images not loading
- Some books may not have cover images in Google Books
- Fallback book icon will display
- You can manually add image URLs in edit mode

### Can't sign in
- Verify Supabase URL and anon key in `.env`
- Check browser console for error messages
- Ensure database tables and policies are created

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## Future Enhancements

Potential features for future versions:
- Bulk import via ISBN list
- Reading status tracking (read, reading, want to read)
- Book ratings and reviews
- Series tracking
- Barcode scanning
- Goodreads integration
- Book lending tracker
- Progressive Web App (PWA) with offline support

## License

MIT License - feel free to use this project for your own book collection!

## Acknowledgments

- **Google Books API** - Book data enrichment
- **Supabase** - Backend infrastructure
- **Lucide React** - Beautiful icons
- **Tailwind CSS** - Styling system

## Contact & Support

For questions, issues, or feature requests, please refer to the documentation files in this repository.

---

**Happy Reading!** 📚

Start cataloging your book collection today with automatic data enrichment, smart filtering, and beautiful design.
