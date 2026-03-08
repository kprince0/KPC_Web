import * as pdfjsLib from 'pdfjs-dist';

// Pointing to a reliable CDN for the worker bundle
// This avoids heavy Next.js build configuration issues regarding PDF.js worker files.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Reads a File object (must be PDF), parses it with pdf.js, 
 * and extracts the very first page into a JPEG base64 string.
 */
export async function extractFirstPageAsImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load PDF Document
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  
  // Fetch Page 1
  const page = await pdf.getPage(1);
  
  // Define Scale for good quality (1.5x)
  const viewport = page.getViewport({ scale: 1.5 });
  
  // Create Canvas elements for rendering
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error("Could not create canvas context for PDF generation.");
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  // Render page onto canvas
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  // Output as JPEG dataURL string representing the thumbnail image
  return canvas.toDataURL('image/jpeg', 0.8);
}
