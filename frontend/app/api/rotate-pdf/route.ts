import { NextRequest } from 'next/server';
import { 
  handleFileUpload, 
  createPdfDocument, 
  rotatePdfDocument, 
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
    
    // Get rotation angle from request body (default to 90 degrees)
    let rotationAngle = 90;
    try {
      const formData = await request.formData();
      const angle = formData.get('angle');
      if (angle) {
        rotationAngle = parseInt(angle.toString());
      }
    } catch (e) {
      // Use default
    }
    
    // Rotate PDF
    const rotatedBuffer = await rotatePdfDocument(pdfDoc, rotationAngle);
    
    // Return the rotated PDF
    return createApiResponse(
      rotatedBuffer,
      `rotated-${Date.now()}.pdf`,
      'application/pdf'
    );
    
  } catch (error) {
    console.error('Error rotating PDF:', error);
    return createErrorResponse('Failed to rotate PDF file', 500);
  }
}

export const runtime = 'nodejs';