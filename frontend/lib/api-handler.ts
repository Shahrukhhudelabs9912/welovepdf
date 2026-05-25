import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

export interface ApiHandlerOptions {
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

export async function handleFileUpload(request: NextRequest, options: ApiHandlerOptions = {}) {
  const { maxFiles = 1, maxSize = 100 * 1024 * 1024, allowedTypes = ['application/pdf'] } = options;
  
  try {
    const formData = await request.formData();
    let files: File[] = [];
    
    // Debug: log all formData keys
    const formDataKeys: string[] = [];
    for (const key of formData.keys()) {
      formDataKeys.push(key);
    }
    console.log('FormData keys:', formDataKeys);
    
    // Check for both 'files' (multiple) and 'file' (single) keys
    const filesArray = formData.getAll('files');
    const fileArray = formData.getAll('file');
    
    console.log('filesArray length:', filesArray.length, 'fileArray length:', fileArray.length);
    console.log('filesArray types:', filesArray.map(f => typeof f));
    console.log('fileArray types:', fileArray.map(f => typeof f));
    
    if (filesArray.length > 0) {
      files = filesArray as File[];
    } else if (fileArray.length > 0) {
      files = fileArray as File[];
    }
    
    console.log('Total files found:', files.length);
    
    if (files.length === 0) {
      console.log('No files found in FormData. Checking all keys...');
      // Debug: list all entries
      for (const [key, value] of formData.entries()) {
        console.log(`Key: ${key}, Value type: ${typeof value}, Is File?: ${value instanceof File}`);
      }
      return { error: 'No files uploaded', status: 400 };
    }
    
    // Debug: log file info
    files.forEach((file, i) => {
      console.log(`File ${i}: name=${file.name}, size=${file.size}, type=${file.type}, constructor: ${file.constructor.name}`);
    });
    
    if (files.length > maxFiles) {
      return { error: `Too many files. Maximum allowed: ${maxFiles}`, status: 400 };
    }
    
    const fileBuffers: Buffer[] = [];
    for (const file of files) {
      if (file.size > maxSize) {
        return { error: `File ${file.name} exceeds maximum size of ${formatBytes(maxSize)}`, status: 400 };
      }
      
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { error: `File ${file.name} has unsupported type: ${file.type}`, status: 400 };
      }
      
      const buffer = Buffer.from(await file.arrayBuffer());
      fileBuffers.push(buffer);
    }
    
    return { files: fileBuffers, originalFiles: files };
  } catch (error) {
    console.error('Error handling file upload:', error);
    return { error: 'Failed to process uploaded files', status: 500 };
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function createPdfDocument(buffer: Buffer) {
  return await PDFDocument.load(buffer);
}

export async function mergePdfDocuments(documents: PDFDocument[]) {
  const mergedPdf = await PDFDocument.create();
  
  for (const doc of documents) {
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  const pdfBytes = await mergedPdf.save();
  return Buffer.from(pdfBytes);
}

export async function splitPdfDocument(pdfDoc: PDFDocument, pageRanges?: number[][]) {
  const results: Buffer[] = [];
  const totalPages = pdfDoc.getPages().length;
  
  if (!pageRanges) {
    // Split each page into separate PDF
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      results.push(Buffer.from(pdfBytes));
    }
  } else {
    // Split by specified ranges
    for (const range of pageRanges) {
      const newPdf = await PDFDocument.create();
      const pages = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i);
      const copiedPages = await newPdf.copyPages(pdfDoc, pages);
      copiedPages.forEach((page) => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      results.push(Buffer.from(pdfBytes));
    }
  }
  
  return results;
}

export async function addWatermarkToPdf(pdfDoc: PDFDocument, watermarkText: string) {
  const pages = pdfDoc.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    page.drawText(watermarkText, {
      x: width / 2 - 50,
      y: height / 2,
      size: 32,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.3,
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export function createApiResponse(data: Buffer | Buffer[], filename: string, contentType = 'application/pdf') {
  const buffer = Array.isArray(data) ? data[0] : data;
  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  // Convert Buffer to Uint8Array for Blob
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array], { type: contentType });
  return new Response(blob, { headers });
}

export function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}