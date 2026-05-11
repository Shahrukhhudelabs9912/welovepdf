import { NextRequest } from 'next/server';
import { 
  handleFileUpload, 
  createPdfDocument, 
  splitPdfDocument, 
  createApiResponse, 
  createErrorResponse 
} from '@/lib/api-handler';

export async function POST(request: NextRequest) {
  try {
    const uploadResult = await handleFileUpload(request, { 
      maxFiles: 1,
      allowedTypes: ['application/pdf']
    });
    
    if ('error' in uploadResult) {
      return createErrorResponse(uploadResult.error || 'Upload error', uploadResult.status || 400);
    }
    
    const { files } = uploadResult;
    const pdfDoc = await createPdfDocument(files[0]);
    
    // For simplicity, split by individual pages
    // In a real implementation, you could accept page ranges from request body
    const splitBuffers = await splitPdfDocument(pdfDoc);
    
    // Return the first split PDF (or could return a zip with all splits)
    // For now, we return the first page as example
    return createApiResponse(
      splitBuffers,
      `split-page-1-${Date.now()}.pdf`,
      'application/pdf'
    );
    
  } catch (error) {
    console.error('Error splitting PDF:', error);
    return createErrorResponse('Failed to split PDF file', 500);
  }
}

export const runtime = 'nodejs';