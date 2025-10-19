# Diwali 2025 Gallery Setup Guide

## Overview
The Diwali page now has a special invite code **"diwali2025"** that displays a dynamic gallery of photos/videos from your Google Drive folder. Users can also upload their own photos which will be added to the same folder.

## Features
- ✅ 5-column gallery layout on desktop/laptop screens
- ✅ 3-column gallery layout on mobile screens
- ✅ Users can upload photos/videos
- ✅ Auto-refresh gallery after uploads
- ✅ Lightbox view for full-size images/videos
- ✅ Direct Google Drive integration

## Setup Steps

### 1. Create/Configure Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google Drive API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Get Google API Key (for reading files)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. **IMPORTANT**: Click "Restrict Key" and:
   - Under "API restrictions", select "Restrict key"
   - Choose only "Google Drive API"
   - This prevents unauthorized use of your API key

### 3. Create Service Account (for uploading files)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Give it a name like "diwali-gallery-uploader"
4. Grant role: "Project" → "Editor" (or create custom role with Drive write access)
5. Click "Done"
6. Click on the created service account
7. Go to "Keys" tab → "Add Key" → "Create New Key"
8. Choose JSON format
9. Download the JSON file (keep it secure!)

### 4. Share Google Drive Folder with Service Account

1. Open your Google Drive folder with Diwali 2025 photos
2. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE
   ```
3. Right-click the folder → "Share"
4. Add the service account email (found in the JSON file: `client_email` field)
5. Give it "Editor" permission
6. Share

### 5. Make Folder Publicly Viewable

1. Right-click the folder → "Share"
2. Click "Change to anyone with the link"
3. Set permission to "Viewer"
4. This allows the thumbnails to be displayed publicly

### 6. Configure Environment Variables

Create or update `.env.local` file in your project root:

```env
# Google Drive Folder ID (from step 4)
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here

# Google API Key (from step 2)
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here

# Google Service Account JSON (from step 3)
# Copy the entire contents of the downloaded JSON file as a single line
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}
```

**IMPORTANT**: For the service account key:
- Open the downloaded JSON file
- Copy the entire contents
- Paste it as a single line (no newlines) in the .env.local file
- Or you can stringify it: `JSON.stringify(yourJsonObject)`

### 7. Deploy to Production

When deploying to Vercel or another platform:

1. Add all three environment variables to your hosting platform:
   - `NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID`
   - `NEXT_PUBLIC_GOOGLE_API_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_KEY`

2. For Vercel:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable
   - Redeploy your application

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Diwali page: `http://localhost:3000/diwali`

3. Enter invite code: **diwali2025**

4. You should see:
   - The gallery loading from your Google Drive
   - An upload form to add new photos
   - Responsive grid layout (5 columns desktop, 3 columns mobile)

5. Test uploading a photo:
   - Click "Click to select a file"
   - Choose an image or video
   - Click "Upload to Gallery"
   - Wait for success message
   - Gallery should refresh and show your new upload

## Troubleshooting

### Gallery not loading
- Check that `NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID` is set correctly
- Verify the folder is publicly shared (anyone with link can view)
- Check browser console for errors
- Verify Google Drive API is enabled in Cloud Console

### Upload not working
- Check that `GOOGLE_SERVICE_ACCOUNT_KEY` is properly formatted (valid JSON)
- Verify the service account has Editor access to the folder
- Check that the folder ID in upload matches the folder ID in environment variables
- Look at server logs for detailed error messages

### API Key Issues
- Make sure the API key is restricted to only Google Drive API
- Check that the API key hasn't been accidentally exposed (regenerate if needed)
- Verify billing is enabled on Google Cloud project (API calls require it)

## Security Notes

- **NEVER** commit your `.env.local` file to Git
- The `.env.local` file is already in `.gitignore`
- API keys should be restricted to specific APIs
- Service account keys should be kept secure
- Consider rotating keys periodically
- Monitor API usage in Google Cloud Console

## Cost

Google Drive API:
- **Free tier**: 1 billion queries/day, 10,000 requests/100 seconds
- This should be more than enough for your use case
- Uploads count as API requests
- Monitor usage in Google Cloud Console

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs (run `npm run dev` and look at terminal output)
3. Verify all environment variables are set correctly
4. Test API key with a simple curl request
5. Make sure the Google Drive folder has the correct permissions
