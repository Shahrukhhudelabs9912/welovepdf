import { NextRequest } from 'next/server';
import {
  handleFileUpload,
  createPdfDocument,
  mergePdfDocuments,
  createApiResponse,
  createErrorResponse
} from '@/lib/api-handler';

export async function POST(request: NextRequest) {
  try {
    const uploadResult = await handleFileUpload(request, {
      maxFiles: 20,
      allowedTypes: ['application/pdf']
    });
    
    if ('error' in uploadResult) {
      return createErrorResponse(uploadResult.error || 'Upload error', uploadResult.status || 400);
    }
    
    const { files } = uploadResult;
    
    if (files.length < 2) {
      return createErrorResponse('At least 2 PDF files are required for merging', 400);
    }
    
    // Load all PDF documents
    const pdfDocs = await Promise.all(files.map(file => createPdfDocument(file)));
    
    // Merge PDFs
    const mergedPdfBuffer = await mergePdfDocuments(pdfDocs);
    
    // Return the merged PDF
    return createApiResponse(
      mergedPdfBuffer,
      `merged-${Date.now()}.pdf`,
      'application/pdf'
    );
    
  } catch (error) {
    console.error('Error merging PDFs:', error);
    return createErrorResponse('Failed to merge PDF files', 500);
  }
}

export const runtime = 'nodejs';