# 🎵 JamLyrics - Song Management for Jamming Events

A beautiful, responsive web application for managing song lyrics during jamming sessions. Built with vanilla HTML, CSS, and JavaScript with modern design and API integration.

## ✨ Features

### Core Functionality

- **Song Library**: View all your songs in a clean, searchable grid
- **Lyrics Display**: Click any song to view full lyrics in a beautiful modal
- **Search**: Real-time search by title, artist, album, or lyrics content
- **Add/Edit Songs**: Admin interface for managing your song collection
- **Auto-Fetch Lyrics**: Integration with Lyrics.ovh API for automatic lyric retrieval

### Design & UX

- **Modern Design**: Clean, professional interface with smooth animations
- **Fully Responsive**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Friendly**: Elegant color scheme that works in any environment
- **Keyboard Navigation**: Full keyboard support including ESC to close modals
- **Loading States**: Beautiful loading animations for all async operations

### Technical Features

- **Client-Side Storage**: Uses localStorage for data persistence (no backend required)
- **Form Validation**: Real-time validation with helpful error messages
- **API Integration**: Automatic lyrics fetching from free APIs
- **Cross-Browser**: Works on all modern browsers
- **Fast & Lightweight**: Minimal dependencies, fast loading

## 🚀 Quick Start

### Option 1: Simple File Server (Recommended)

1. Open terminal in the project directory
2. Run: `node server.js`
3. Open: http://localhost:3000

### Option 2: Static File Server

```bash
# Using Python
python -m http.server 3000

# Using Node.js (if you have http-server installed)
npx http-server -p 3000

# Using PHP
php -S localhost:3000
```

### Option 3: Open Directly

You can also open `index.html` directly in your browser, but some features (like API calls) may be limited due to CORS restrictions.

## 📖 Usage Guide

### Adding Your First Song

1. Click "Add Song" from the homepage
2. Enter song title and artist name
3. (Optional) Click "Auto-Fetch Lyrics" to automatically retrieve lyrics
4. Enter or edit lyrics manually if needed
5. Click "Save Song"

### Managing Songs

- **View Lyrics**: Click any song card on the homepage
- **Edit Song**: Click "Edit" in the lyrics modal or add `?edit=SONG_ID` to URL
- **Delete Song**: Click "Delete" in the lyrics modal
- **Search Songs**: Use the search bar to find songs by any field

### Keyboard Shortcuts

- `ESC`: Close modal or cancel forms
- `Enter`: Submit forms
- `Tab`: Navigate through form fields

## 🛠️ Technical Details

### File Structure

```
├── index.html          # Homepage with song grid
├── add.html           # Add/edit song form
├── styles.css         # All styling and responsive design
├── script.js          # Homepage functionality
├── add-script.js      # Add/edit page functionality
├── server.js          # Simple Node.js server for development
└── README.md          # This file
```

### Data Storage

Songs are stored in browser localStorage as JSON:

```javascript
{
  id: "unique-id",
  title: "Song Title",
  artist: "Artist Name",
  album: "Album Name (optional)",
  lyrics: "Full lyrics text...",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z" // if edited
}
```

### API Integration

- **Lyrics.ovh API**: Free lyrics retrieval service
- **Fallback Support**: Graceful degradation if API is unavailable
- **CORS Enabled**: Works from any domain

## 🎨 Customization

### Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --primary-color: #6366f1; /* Main brand color */
  --bg-color: #f8fafc; /* Background */
  --text-primary: #1e293b; /* Main text */
  /* ... more variables ... */
}
```

### Adding Features

The modular JavaScript architecture makes it easy to extend:

- Add new validation rules in `validateField()`
- Integrate additional APIs in `fetchLyricsFromAPI()`
- Customize search behavior in `filterSongs()`

## 🔧 Development

### Prerequisites

- Modern web browser
- Node.js (optional, for development server)

### Local Development

1. Clone or download the files
2. Run `node server.js` for development server
3. Edit files and refresh browser to see changes

### Browser Compatibility

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Experience

The app is fully optimized for mobile devices:

- Touch-friendly interface
- Responsive grid layout
- Mobile-optimized forms
- Gesture support for modals

## 🚀 Deployment

### Static Hosting (Recommended)

Deploy to any static hosting service:

- **Netlify**: Drag & drop the files
- **Vercel**: Connect your repository
- **GitHub Pages**: Enable Pages in repository settings
- **Any web host**: Upload files to public directory

### Server Requirements

- No backend required
- No database needed
- Just serve static files
- HTTPS recommended for API calls

## 🔒 Data Privacy

- All data stored locally in browser
- No data sent to external servers (except lyrics API)
- No tracking or analytics
- Works completely offline after first load

## 🎯 Perfect For

- **Jam Sessions**: Quick access to lyrics during music sessions
- **Open Mic Nights**: Organizers can manage song lists
- **Band Practice**: Share lyrics among band members
- **Music Teachers**: Student song collections
- **Solo Musicians**: Personal lyrics library

## 🤝 Contributing

This is a complete, standalone project but you can enhance it:

- Add more lyrics APIs for better coverage
- Implement export/import functionality
- Add chord support alongside lyrics
- Create print-friendly views

## 📄 License

Free to use for personal and commercial projects. No attribution required.

---

**Made with ❤️ for the music community**
