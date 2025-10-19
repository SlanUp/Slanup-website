import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const folderId = searchParams.get('folderId');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!folderId) {
    return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
  }

  try {
    // Fetch files from Google Drive API (max 1000 per request) - sorted by oldest first
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/'+or+mimeType+contains+'video/')&key=${apiKey}&fields=files(id,name,thumbnailLink,webContentLink,webViewLink,mimeType)&orderBy=createdTime&pageSize=1000`;
    
    console.log('Fetching from Google Drive API...');
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Drive API Error:', response.status, errorText);
      throw new Error(`Failed to fetch files: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.files?.length || 0} files`);
    return NextResponse.json({ files: data.files || [] });
  } catch (error) {
    console.error('Error fetching drive files:', error);
    return NextResponse.json({ error: 'Failed to load files' }, { status: 500 });
  }
}
