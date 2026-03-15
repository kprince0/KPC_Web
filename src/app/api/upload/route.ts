import { NextRequest, NextResponse } from 'next/server';
import { uploadToDrive } from '@/lib/gdrive';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to Google Drive
    const driveFile = await uploadToDrive(file.name, file.type, buffer);

    return NextResponse.json({ 
      success: true, 
      fileId: driveFile.id,
      webViewLink: driveFile.webViewLink,
      webContentLink: driveFile.webContentLink
    });

  } catch (error: any) {
    console.error('File upload route error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
