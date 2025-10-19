# Google Drive Gallery Setup

## 📋 Steps to Integrate Google Drive Gallery

### 1. Make Your Drive Folder Public

1. Open your Google Drive folder with photos
2. Right-click → **Share** → **Anyone with the link can view**
3. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
   ```

### 2. Get Google API Key (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. **Restrict the key** to only Google Drive API for security

### 3. Add to Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

### 4. Usage in Diwali Page

The gallery is already integrated! Just make sure your environment variables are set.

## 🎨 Features

- ✅ Responsive grid layout (2 columns on mobile, 4 on desktop)
- ✅ Hover effects with download buttons
- ✅ Lightbox modal for full-size viewing
- ✅ Direct download functionality
- ✅ Link to view in Google Drive
- ✅ Mobile-friendly touch interactions
- ✅ Loading states and error handling

## 🔐 Alternative: Simple Embed (No API Key Required)

If you don't want to use API key, you can use a simpler static list:

```tsx
// In your diwali page, manually list the image IDs
const DRIVE_IMAGES = [
  { id: 'FILE_ID_1', name: 'Photo 1' },
  { id: 'FILE_ID_2', name: 'Photo 2' },
  // ... more images
];
```

Each image can be accessed via:
- Thumbnail: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w400`
- Download: `https://drive.google.com/uc?export=download&id=FILE_ID`

## 📱 Mobile Optimization

The gallery is fully optimized for mobile:
- Touch-friendly grid
- Responsive spacing
- Lazy loading for performance
- Swipe to close lightbox

## 🎯 Position on Page

The gallery appears **above the invite code section** on the Diwali page, making it immediately visible to visitors!