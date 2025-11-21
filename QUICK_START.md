# Quick Start Guide

Get your personal book catalog running in 5 minutes!

## Option 1: Try Guest Mode (Instant)

No setup required! Just start the app:

```bash
npm install
npm run dev
```

Visit the local URL and start adding books. Your data will be stored in your browser's local storage.

## Option 2: Full Setup with Cloud Storage

### Step 1: Set Up Supabase (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait for the project to be provisioned

### Step 2: Configure Database (2 minutes)

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the entire SQL code from `DATABASE_SETUP.md`
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Step 3: Get Your API Keys (1 minute)

1. In Supabase, go to Settings > API
2. Find your Project URL (looks like: `https://xxxxx.supabase.co`)
3. Find your `anon` `public` key (long string of characters)

### Step 4: Configure Environment Variables (1 minute)

Open the `.env` file in your project root and update:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Start the App (1 minute)

```bash
npm install
npm run dev
```

## Using the Application

### Adding Your First Book

1. Enter a book title and author (e.g., "The Hobbit" by "J.R.R. Tolkien")
2. Click "Add Book"
3. Watch as the app automatically fetches the cover image, genre, and other details
4. Your book appears in the grid below

### Exploring Features

**View Book Details:**
- Click any book card to see full details

**Edit Book Information:**
- Click a book, then click "Edit"
- Modify any field
- Add custom tags
- Click "Save"

**Filter Your Books:**
- Click "Filters" to expand filter options
- Select genre (Fiction/Non-fiction)
- Select holiday categories
- Choose tags
- Use the search bar for text search

**Pick a Random Book:**
- Click "Pick Random Book" to get a surprise selection
- Works with your current filters (picks from filtered results)

**Export Your Catalog:**
- Click "Export" in the header
- Choose your format (CSV, Excel, or PDF)
- Download your book list

### Guest Mode vs Registered Mode

**Guest Mode (Default):**
- No sign-up required
- Data stored in browser only
- Perfect for testing
- Data doesn't sync across devices

**Registered Mode:**
- Click "Sign In" to create an account
- Email and password authentication
- Cloud storage with Supabase
- Data syncs across all your devices
- Access your books from anywhere

## Tips & Tricks

1. **Auto-enrichment:** Most popular books are found automatically. For obscure books, you may need to manually add details.

2. **Custom tags:** Add tags like "Favorite", "Must Read", "Borrowed", etc. to organize your collection.

3. **Holiday books:** The system automatically detects holiday-themed books. Perfect for seasonal reading!

4. **Bulk management:** Use filters to view specific categories, then export to work with them in Excel.

5. **Backup:** Export to CSV regularly as a backup of your collection.

## Troubleshooting

**Problem: Book details not auto-filling**
- The Google Books API may not have data for that book
- Try adding author's full name
- You can manually enter all details in the edit view

**Problem: Can't sign in**
- Check your internet connection
- Verify Supabase URL and key in `.env`
- Check the browser console for error messages

**Problem: Books disappear after refresh (Guest Mode)**
- This shouldn't happen - check browser console
- Try a different browser
- Consider using registered mode for reliability

**Problem: Images not loading**
- Some books don't have cover images in Google Books
- The fallback book icon will display instead
- You can manually add an image URL in edit mode

## What's Next?

Once you're comfortable with the basics:

1. Build your full collection
2. Organize with tags and categories
3. Use filters to find exactly what you're looking for
4. Export your catalog to share or backup
5. Discover new books with the random picker

## Getting Help

- Check `IMPLEMENTATION_GUIDE.md` for detailed technical documentation
- Review `DATABASE_SETUP.md` for database schema details
- Open an issue if you encounter bugs

Enjoy cataloging your books!
