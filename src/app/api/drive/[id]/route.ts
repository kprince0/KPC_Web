import { NextRequest, NextResponse } from 'next/server';
import { getDriveFileStreaming } from '@/lib/gdrive';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return new NextResponse('File ID is required', { status: 400 });
    }

    const driveResponse = await getDriveFileStreaming(id);
    
    // Determine content type from Drive response headers if possible, 
    // otherwise fallback to a generic binary type or let the browser guess.
    const contentType = driveResponse.headers['content-type'] || 'application/octet-stream';

    // Return the stream as a standard web Response
    return new NextResponse(driveResponse.data as any, {
      headers: {
        'Content-Type': contentType,
        // Cache control to improve performance for static assets like photos/pdfs
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });

  } catch (error: any) {
    console.error(`Error streaming drive file:`, error);
    return new NextResponse('Error fetching file from Drive', { status: 500 });
  }
}
