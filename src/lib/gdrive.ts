import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Server-side Only Utility for Google Drive Operations.
 * 
 * Environments Variables Needed:
 * GOOGLE_CLIENT_EMAIL = "your-service-account-email@project.iam.gserviceaccount.com"
 * GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n..."
 * GOOGLE_DRIVE_FOLDER_ID = "Id of the shared drive folder"
 */

const getAuth = () => {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // Fix escaped newlines in Vercel/Next format
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'],
  });
};

export async function uploadToDrive(fileName: string, mimeType: string, buffer: Buffer) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Convert buffer to readable stream
  const bufferStream = new Readable();
  bufferStream.push(buffer);
  bufferStream.push(null);

  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType: mimeType,
    body: bufferStream,
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });
    
    // Make public so Next.js Image component can load it directly via webContentLink.
    // If you want it private, omit this and serve via Next.js API route proxy.
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    throw new Error('Drive Upload Failed');
  }
}

export async function getDriveFileStreaming(fileId: string) {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  
  return await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'stream' }
  );
}
