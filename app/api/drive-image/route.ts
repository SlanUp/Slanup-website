import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('id');
  const size = searchParams.get('size') || 'full'; // 'thumb' or 'full'

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  try {
    // Use thumbnail for grid, full image for lightbox
    const url = size === 'thumb' 
      ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
      : `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
    
    // Fetch image from Google Drive
    const imageResponse = await fetch(url);

    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
