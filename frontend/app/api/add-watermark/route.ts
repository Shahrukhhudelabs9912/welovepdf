import { NextRequest } from 'next/server';
import { 
  handleFileUpload, 
  createPdfDocument, 
  addWatermarkToPdf, 
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
    
    // Get watermark text from request body (default to "CONFIDENTIAL")
    let watermarkText = "CONFIDENTIAL";
    try {
      const formData = await request.formData();
      const text = formData.get('watermark');
      if (text) {
        watermarkText = text.toString();
      }
    } catch (e) {
      // Use default
    }
    
    // Add watermark to PDF
    const watermarkedBuffer = await addWatermarkToPdf(pdfDoc, watermarkText);
    
    // Return the watermarked PDF
    return createApiResponse(
      watermarkedBuffer,
      `watermarked-${Date.now()}.pdf`,
      'application/pdf'
    );
    
  } catch (error) {
    console.error('Error adding watermark to PDF:', error);
    return createErrorResponse('Failed to add watermark to PDF file', 500);
  }
}

export const runtime = 'nodejs';