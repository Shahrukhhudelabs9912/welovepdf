import { NextRequest } from 'next/server';
import { 
  handleFileUpload, 
  createPdfDocument, 
  createApiResponse, 
  createErrorResponse 
} from '@/lib/api-handler';
import { PDFDocument } from 'pdf-lib';

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
    
    // Simple compression: re-save with default settings
    // In a real implementation, you would use ghostscript or other compression libraries
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
    
    const compressedBuffer = Buffer.from(compressedBytes);
    
    // Return the compressed PDF
    return createApiResponse(
      compressedBuffer,
      `compressed-${Date.now()}.pdf`,
      'application/pdf'
    );
    
  } catch (error) {
    console.error('Error compressing PDF:', error);
    return createErrorResponse('Failed to compress PDF file', 500);
  }
}

export const runtime = 'nodejs';