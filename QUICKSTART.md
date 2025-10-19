# Quick Start - Get Google Drive Credentials

## Step 1: Get Your Folder ID (2 minutes)

1. Open your Google Drive: https://drive.google.com
2. Navigate to your Diwali 2025 photos folder (or create a new one)
3. Look at the URL in your browser:
   ```
   https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
                                            ↑
                                    This is your FOLDER ID
   ```
4. Copy everything after `/folders/` - that's your **FOLDER_ID**

---

## Step 2: Get Google API Key (5 minutes)

### 2a. Create/Select Project
1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click the project dropdown at the top
4. Click "New Project"
5. Name it "Diwali Gallery" or similar
6. Click "Create"
7. Wait for the project to be created (notification will appear)

### 2b. Enable Google Drive API
1. In the left menu, go to: **APIs & Services** → **Library**
   - Direct link: https://console.cloud.google.com/apis/library
2. Search for "Google Drive API"
3. Click on it
4. Click **"Enable"** button
5. Wait for it to enable (~30 seconds)

### 2c. Create API Key
1. Go to: **APIs & Services** → **Credentials**
   - Direct link: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** at the top
3. Select **"API Key"**
4. A popup will show your API key - **COPY IT** (you'll add it to .env.local)
5. Click **"Edit API Key"** (or the key name)
6. Under "API restrictions":
   - Select **"Restrict key"**
   - Check only **"Google Drive API"**
7. Click **"Save"**

✅ You now have: **NEXT_PUBLIC_GOOGLE_API_KEY**

---

## Step 3: Create Service Account (for uploads) (5 minutes)

### 3a. Create Service Account
1. Go to: **APIs & Services** → **Credentials**
   - Direct link: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"Service Account"**
3. Fill in:
   - Service account name: `diwali-uploader`
   - Service account ID: (auto-filled)
4. Click **"Create and Continue"**
5. For role, select: **"Basic"** → **"Editor"**
6. Click **"Continue"** then **"Done"**

### 3b. Create JSON Key
1. You'll see your service account in the list
2. Click on it (click the email address)
3. Go to the **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"**
5. Choose **"JSON"**
6. Click **"Create"**
7. A JSON file will download to your computer - **KEEP IT SAFE!**

### 3c. Get Service Account Email
1. Open the downloaded JSON file in a text editor
2. Find the line with `"client_email"` - it looks like:
   ```json
   "client_email": "diwali-uploader@your-project.iam.gserviceaccount.com"
   ```
3. Copy this email address

✅ You now have: **Service Account JSON file** and **Service Account Email**

---

## Step 4: Share Drive Folder with Service Account (2 minutes)

1. Go back to your Google Drive: https://drive.google.com
2. Find your Diwali 2025 photos folder
3. Right-click the folder → **"Share"**
4. In the "Add people and groups" field, paste the **service account email** (from Step 3c)
5. Change permission to **"Editor"**
6. **UNCHECK** "Notify people" (it's a robot, no need to email it!)
7. Click **"Share"**

---

## Step 5: Make Folder Public (1 minute)

1. Still on your Drive folder, right-click → **"Share"** again
2. Click on **"General access"**
3. Change from "Restricted" to **"Anyone with the link"**
4. Make sure it says **"Viewer"**
5. Click **"Done"**

✅ Now anyone with the link can view the photos

---

## Step 6: Add to .env.local (3 minutes)

1. Open your project in VS Code or terminal
2. Create a file named `.env.local` in the root directory (if it doesn't exist)
3. Add these three variables:

```env
# Your folder ID from Step 1
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here

# Your API key from Step 2
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here

# The entire JSON file contents from Step 3 as ONE LINE
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"diwali-uploader@...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**IMPORTANT for GOOGLE_SERVICE_ACCOUNT_KEY:**
- Open the downloaded JSON file
- Copy the **entire contents**
- Make it a single line (remove all newlines)
- Paste it after the `=`

### Quick way to format the JSON:
```bash
# In terminal, run this (replace 'downloaded-file.json' with your actual filename):
cat ~/Downloads/your-service-account-file.json | tr -d '\n'
```
Then copy the output and paste it into .env.local

---

## Step 7: Test It! (2 minutes)

1. Save the `.env.local` file
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Open: http://localhost:3000/diwali
4. Enter invite code: **diwali2025**
5. You should see:
   - Your Google Drive photos in a gallery
   - An upload form

---

## 🎉 Done!

Total time: ~20 minutes

Your gallery is now connected to Google Drive. Users can view photos and upload their own!

---

## Troubleshooting

**"Gallery not loading"**
- Check the folder ID is correct
- Make sure folder is public ("Anyone with the link")
- Check browser console for errors

**"Upload not working"**
- Make sure service account has Editor access to the folder
- Verify the JSON in .env.local is valid (no newlines in the middle)
- Check server logs in terminal

**"API key invalid"**
- Make sure you enabled Google Drive API
- Check the API key is restricted to only Drive API
- Try creating a new API key
