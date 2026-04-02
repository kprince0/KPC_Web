import { NextRequest, NextResponse } from 'next/server';
import { getDriveFileStreaming, getDriveFileMetadata } from '@/lib/gdrive';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return new NextResponse('File ID is required', { status: 400 });
    }

    const driveResponse = await getDriveFileStreaming(id);
    
    // 1. Force valid content-type logic
    const headersRaw = driveResponse.headers;
    let rawContentType = headersRaw['content-type'] || headersRaw['Content-Type'];
    let contentType = Array.isArray(rawContentType) ? rawContentType[0] : rawContentType;

    if (!contentType || contentType === 'application/octet-stream') {
      try {
        const meta = await getDriveFileMetadata(id);
        if (meta.data && meta.data.mimeType) {
          contentType = meta.data.mimeType;
        } else {
          contentType = 'application/pdf';
        }
      } catch(e) {
        contentType = 'application/pdf';
      }
    }

    // 2. Set Content-Disposition to inline to force browser rendering instead of downloading
    return new NextResponse(driveResponse.data as any, {
      headers: {
        'Content-Type': contentType as string,
        'Content-Disposition': 'inline', 
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });

  } catch (error: any) {
    console.error(`Error streaming drive file:`, error);
    return new NextResponse('Error fetching file from Drive', { status: 500 });
  }
}
