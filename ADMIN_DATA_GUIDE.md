# Admin Panel Data Sync Guide

## How It Works

All admin content (announcements, videos, home, products, about) is stored in **`admin-data.json`** in your website folder.

### Workflow

1. **Edit content** in the admin panel
2. **Preview changes** by clicking "Preview your work"
3. **Publish to SuvraTech** button:
   - Applies changes to the live website
   - Downloads updated `admin-data.json`
4. **Save the downloaded file** by replacing the one in your website folder

### Data Persistence

- When you open any page on your site, it automatically loads from `admin-data.json`
- All drafts are stored in browser localStorage (temporary)
- Published changes are saved to localStorage keys and downloaded as JSON
- To sync across devices/backups, always download after publishing

### Backup & Restore

**Tools tab → Download admin-data.json**: Create a backup
**Tools tab → Upload admin-data.json**: Restore from backup

### File Structure

```json
{
  "announcements": [
    {
      "id": "unique-id",
      "title": "Title",
      "date": "6 February, 2026",
      "body": "Content here"
    }
  ],
  "videos": [
    {
      "id": "video-1",
      "title": "Video Title",
      "url": "https://www.youtube.com/embed/VIDEO_ID"
    }
  ],
  "home": {
    "heroTitle": "Welcome to SuvraTech",
    "heroSubtitle": "Latest News from SuvraTech",
    "heroBanner": "SuvraTech Banner.png"
  },
  "products": [
    {
      "id": "prod-1",
      "name": "Product Name",
      "description": "Description",
      "image": "images/product.png",
      "link": "products.html#prod-1"
    }
  ],
  "about": {
    "title": "About SuvraTech",
    "body": "About content here"
  }
}
```

### Quick Start

1. Go to [admin.html](admin.html) and sign in
2. Add/edit announcements, videos, products, home, or about content
3. Click "Preview your work" to see all pending changes
4. Click "Publish to SuvraTech" to go live
5. Download the `admin-data.json` file when prompted
6. Move the downloaded file to your website folder (replace existing)

That's it! All changes are now saved and will load on every page.
