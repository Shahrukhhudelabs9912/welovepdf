"use client";

import { toast } from 'sonner';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  blob?: Blob;
  filename?: string;
}

// Configuration
const USE_PYTHON_BACKEND = process.env.NEXT_PUBLIC_USE_PYTHON_BACKEND === 'true';
const PYTHON_API_BASE = process.env.NEXT_PUBLIC_PYTHON_API_BASE || 'http://localhost:8000/api';
const NEXT_API_BASE = '/api';

// Get the appropriate API base URL
function getApiBase(endpoint: string): string {
  if (USE_PYTHON_BACKEND) {
    return `${PYTHON_API_BASE}${endpoint}`;
  }
  return `${NEXT_API_BASE}${endpoint}`;
}

// API endpoint mappings
const API_ENDPOINTS = {
  'merge-pdf': '/merge-pdf',
  'split-pdf': '/split-pdf',
  'jpg-to-pdf': '/jpg-to-pdf',
  'pdf-to-jpg': '/pdf-to-jpg',
  'add-watermark': '/add-watermark',
  'pdf-to-word': '/pdf-to-word',
  'word-to-pdf': '/word-to-pdf',
  'compress-pdf': '/compress-pdf',
  'protect-pdf': '/protect-pdf',
  'page-numbering': '/page-numbering',
  'organize-pdf': '/organize-pdf',
  'fix-scanned-pdf': '/fix-scanned-pdf',
  'optimize-pdf': '/optimize-pdf',
  'prepare-print-pdf': '/prepare-print-pdf',
  'pdf-to-excel': '/pdf-to-excel',
  'excel-to-pdf': '/excel-to-pdf',
} as const;

type ApiEndpoint = keyof typeof API_ENDPOINTS;

export async function uploadFile(
  endpoint: ApiEndpoint,
  files: File[],
  options?: {
    additionalData?: Record<string, string | number>;
    onProgress?: (progress: number) => void;
  }
): Promise<ApiResponse> {
  try {
    // Enhanced validation
    if (!files || files.length === 0) {
      return { success: false, error: 'No files selected. Please select at least one file.' };
    }

    // Validate file sizes (max 200MB total)
    const maxTotalSize = 200 * 1024 * 1024; // 200MB
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      return { success: false, error: `Total file size (${formatBytes(totalSize)}) exceeds maximum limit of ${formatBytes(maxTotalSize)}` };
    }

    // Validate file types based on endpoint
    const validationError = validateFilesForEndpoint(endpoint, files);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const formData = new FormData();
    
    // Add files - Python backend expects 'files' for multiple, 'file' for single
    // Single file endpoints (based on validateFilesForEndpoint logic)
    const singleFileEndpoints = [
      'split-pdf', 'pdf-to-jpg', 'add-watermark',
      'pdf-to-word', 'word-to-pdf', 'compress-pdf', 'protect-pdf',
      'page-numbering', 'organize-pdf',
      'fix-scanned-pdf', 'optimize-pdf', 'prepare-print-pdf',
      'pdf-to-excel', 'excel-to-pdf'
    ];
    
    if (files.length === 1 && singleFileEndpoints.includes(endpoint)) {
      // Single file endpoints
      formData.append('file', files[0]);
    } else {
      // Multiple files endpoints
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    // Add additional data
    if (options?.additionalData) {
      Object.entries(options.additionalData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
    }

    const apiUrl = getApiBase(API_ENDPOINTS[endpoint]);
    console.log(`Calling API: ${apiUrl}`, {
      fileCount: files.length,
      endpoint,
      fileNames: files.map(f => f.name),
      fileTypes: files.map(f => f.type),
      fileSizes: files.map(f => f.size)
    });
    
    // Debug: Log FormData keys
    const formDataKeys: string[] = [];
    for (const key of formData.keys()) {
      formDataKeys.push(key);
    }
    console.log('FormData keys being sent:', formDataKeys);

    // Make the request with timeout and abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `Upload failed with status ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData.details || '';
        } catch (e) {
          // Try to get text response if not JSON
          try {
            const text = await response.text();
            if (text) errorDetails = text;
          } catch (textError) {
            // Ignore text parsing errors
          }
        }
        
        // Enhanced error messages based on status code
        if (response.status === 413) {
          errorMessage = 'File too large. Please reduce file size and try again.';
        } else if (response.status === 415) {
          errorMessage = 'Unsupported file type. Please check file format.';
        } else if (response.status === 422) {
          errorMessage = 'Invalid file or parameters. Please check your input.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        return {
          success: false,
          error: errorMessage,
          data: errorDetails ? { details: errorDetails } : undefined
        };
      }
      
      // Check if response is a file download
      const contentType = response.headers.get('content-type') || '';
      const contentDisposition = response.headers.get('content-disposition') || '';
      
      if (contentType.includes('application/pdf') ||
          contentType.includes('application/zip') ||
          contentType.includes('image/') ||
          contentType.includes('application/octet-stream') ||
          contentDisposition.includes('attachment')) {
        // It's a file download
        const blob = await response.blob();
        let filename = `download-${Date.now()}`;
        
        // Extract filename from content-disposition header
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        } else {
          // Generate appropriate filename based on endpoint
          const ext = getFileExtension(contentType, endpoint);
          filename = `${endpoint}-${Date.now()}${ext}`;
        }
        
        return {
          success: true,
          blob,
          filename,
        };
      } else if (contentType.includes('application/json')) {
        // It's a JSON response
        const data = await response.json();
        return {
          success: true,
          data,
        };
      } else {
        // It's a text or other response (placeholder endpoints)
        const text = await response.text();
        return {
          success: true,
          data: { message: text },
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        return { success: false, error: 'Request timeout. Please try again with smaller files or check your connection.' };
      }
      
      throw fetchError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Upload error:', error);
    
    // Enhanced error messages for common network issues
    let errorMessage = 'Network error';
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage = 'Cannot connect to server. Please check your internet connection and ensure the backend is running.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Helper function to format bytes to human readable format
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Validate files based on endpoint requirements
function validateFilesForEndpoint(endpoint: ApiEndpoint, files: File[]): string | null {
  // Check minimum file count
  switch (endpoint) {
    case 'merge-pdf':
      if (files.length < 2) {
        return 'Merge PDF requires at least 2 files.';
      }
      break;
    case 'split-pdf':
    case 'pdf-to-jpg':
    case 'add-watermark':
    case 'pdf-to-word':
    case 'word-to-pdf':
    case 'compress-pdf':
    case 'protect-pdf':
    case 'page-numbering':
    case 'organize-pdf':
    case 'pdf-to-excel':
    case 'excel-to-pdf':
      if (files.length !== 1) {
        return 'This tool requires exactly 1 file.';
      }
      break;
    // jpg-to-pdf and pdf-to-jpg can have multiple files
  }

  // Check file types
  for (const file of files) {
    const fileType = file.type.toLowerCase();
    
    switch (endpoint) {
      case 'merge-pdf':
      case 'split-pdf':
      case 'add-watermark':
      case 'pdf-to-word':
      case 'compress-pdf':
      case 'protect-pdf':
      case 'page-numbering':
      case 'organize-pdf':
      case 'pdf-to-excel':
        if (!fileType.includes('pdf')) {
          return `File "${file.name}" is not a PDF. This tool requires PDF files.`;
        }
        break;
      case 'jpg-to-pdf':
        if (!fileType.includes('image/')) {
          return `File "${file.name}" is not an image. This tool requires image files (JPG, PNG, etc.).`;
        }
        break;
      case 'pdf-to-jpg':
        if (!fileType.includes('pdf')) {
          return `File "${file.name}" is not a PDF. This tool requires PDF files.`;
        }
        break;
      case 'word-to-pdf':
        if (!fileType.includes('msword') && !fileType.includes('wordprocessingml') &&
            !file.name.toLowerCase().endsWith('.doc') && !file.name.toLowerCase().endsWith('.docx')) {
          return `File "${file.name}" is not a Word document. This tool requires DOC or DOCX files.`;
        }
        break;
      case 'excel-to-pdf':
        if (!fileType.includes('spreadsheetml') && !fileType.includes('excel') &&
            !file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
          return `File "${file.name}" is not an Excel file. This tool requires XLSX or XLS files.`;
        }
        break;
    }
  }

  return null; // All validations passed
}

function getFileExtension(contentType: string, endpoint: ApiEndpoint): string {
  if (contentType.includes('application/pdf')) return '.pdf';
  if (contentType.includes('application/zip')) return '.zip';
  if (contentType.includes('image/jpeg')) return '.jpg';
  if (contentType.includes('image/png')) return '.png';
  
  // Fallback based on endpoint
  switch (endpoint) {
    case 'merge-pdf':
    case 'jpg-to-pdf':
    case 'add-watermark':
    case 'word-to-pdf':
    case 'excel-to-pdf':
      return '.pdf';
    case 'split-pdf':
      return '.zip';
    case 'pdf-to-jpg':
      return '.jpg';
    case 'pdf-to-excel':
      return '.xlsx';
    default:
      return '';
  }
}

export function downloadBlob(blob: Blob, filename: string): boolean {
  try {
    // Validate inputs
    if (!blob || !(blob instanceof Blob)) {
      console.error('Invalid blob provided for download');
      return false;
    }

    if (!filename || typeof filename !== 'string') {
      filename = `download-${Date.now()}`;
    }

    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Set additional attributes for better compatibility
    a.style.display = 'none';
    a.setAttribute('target', '_blank'); // Fallback for browsers that don't support download attribute
    
    // Append to body and trigger click
    document.body.appendChild(a);
    
    // Use a try-catch for the click operation
    let clickSuccessful = false;
    try {
      a.click();
      clickSuccessful = true;
    } catch (clickError) {
      console.error('Error triggering download click:', clickError);
      
      // Fallback: open in new window for very large files or unsupported browsers
      try {
        window.open(url, '_blank');
        clickSuccessful = true;
      } catch (windowError) {
        console.error('Fallback download also failed:', windowError);
      }
    }
    
    // Clean up — remove the anchor element but do NOT revoke the blob URL.
    // The browser needs the blob URL to read data for the download.
    // Revoking before the download starts silently cancels it.
    // Blob URLs are automatically freed when the page is unloaded.
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
    
    return clickSuccessful;
  } catch (error) {
    console.error('Download error:', error);
    
    // Last resort: show user instructions
    if (blob instanceof Blob) {
      const reader = new FileReader();
      reader.onload = function(e) {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`<html><body>
              <h1>Download Failed</h1>
              <p>Your file is ready but automatic download failed.</p>
              <p>Please <a href="${dataUrl}" download="${filename}">click here</a> to download manually.</p>
              <p>Or right-click <a href="${dataUrl}" download="${filename}">this link</a> and select "Save link as..."</p>
            </body></html>`);
          }
        }
      };
      reader.readAsDataURL(blob);
    }
    
    return false;
  }
}

export function handleApiError(error: string) {
  toast.error(error || 'An error occurred');
}

export function handleApiSuccess(message: string) {
  toast.success(message);
}

// Helper function for processing files with loading state
export async function processFiles(
  endpoint: ApiEndpoint,
  files: File[],
  additionalData?: Record<string, string | number>,
  onSuccess?: (filename: string) => void,
  onError?: (error: string) => void,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  // Update progress to indicate validation
  onProgress?.(10);
  
  const result = await uploadFile(endpoint, files, {
    additionalData,
    onProgress: (progress) => {
      // Map upload progress (0-90) to overall progress (10-90)
      const mappedProgress = 10 + (progress * 0.8); // 10-90 range
      onProgress?.(mappedProgress);
    }
  });
  
  // Update progress to indicate processing complete
  onProgress?.(95);
  
  if (result.success) {
    if (result.blob && result.filename) {
      try {
        const downloadSuccess = downloadBlob(result.blob, result.filename);
        onProgress?.(100);
        
        if (downloadSuccess) {
          handleApiSuccess(`File processed successfully! Downloading ${result.filename}`);
          onSuccess?.(result.filename);
        } else {
          handleApiSuccess(`File processed successfully! If download doesn't start automatically, check your browser's download folder or popup blocker.`);
          onSuccess?.(result.filename);
        }
      } catch (downloadError) {
        console.error('Download error:', downloadError);
        handleApiError('File processed but download failed. Please try downloading manually.');
        onError?.('File processed but download failed. Please try downloading manually.');
        return false;
      }
    } else if (result.data) {
      // Placeholder endpoint response
      onProgress?.(100);
      handleApiSuccess(result.data.message || 'Feature coming soon!');
      onSuccess?.('placeholder');
    }
    return true;
  } else {
    // Enhanced error handling with specific messages
    let errorMessage = result.error || 'Failed to process files';
    
    // Provide more user-friendly error messages
    if (errorMessage.includes('timeout')) {
      errorMessage = 'Processing took too long. Please try again with smaller files.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection and ensure the backend server is running.';
    } else if (errorMessage.includes('size')) {
      errorMessage = 'File too large. Please reduce file size and try again.';
    } else if (errorMessage.includes('validate')) {
      errorMessage = 'Invalid file format. Please check the file requirements for this tool.';
    }
    
    handleApiError(errorMessage);
    onError?.(errorMessage);
    return false;
  }
}

// Hook-like utility for tool pages
export function createToolHandler(endpoint: ApiEndpoint) {
  return async function handleProcess(
    files: File[],
    additionalData?: Record<string, string | number>
  ): Promise<boolean> {
    return processFiles(endpoint, files, additionalData);
  };
}