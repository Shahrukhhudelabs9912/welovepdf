"use client";

import { useState, useCallback, useEffect } from "react";
import { useFileContext } from "@/lib/file-context";
import { toast } from "sonner";
import { resolveDownloadFilename, triggerDownload, MIME_TO_EXTENSION } from "@/lib/download-utils";

interface UseToolProcessingOptions {
  toolName: string;
  endpoint: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  autoClearFiles?: boolean;
}

interface ProcessingState {
  isLoading: boolean;
  progress: number;
  stage: 'idle' | 'uploading' | 'processing' | 'downloading' | 'completed' | 'error';
  stageMessage: string;
  error: string | null;
}

export function useToolProcessing({
  toolName,
  endpoint,
  onSuccess,
  onError,
  autoClearFiles = true,
}: UseToolProcessingOptions) {
  const { 
    files, 
    clearFiles, 
    setSelectedTool, 
    setProcessingState,
    markForCleanup,
    processingState: globalProcessingState 
  } = useFileContext();
  
  const [state, setState] = useState<ProcessingState>({
    isLoading: false,
    progress: 0,
    stage: 'idle',
    stageMessage: '',
    error: null,
  });

  // Set selected tool when component mounts and mark for cleanup on unmount
  useEffect(() => {
    console.log(`[useToolProcessing] Setting selected tool: ${toolName}`);
    setSelectedTool(toolName);
    
    return () => {
      console.log(`[useToolProcessing] Component unmounting for tool: ${toolName}`);
      if (autoClearFiles) {
        console.log(`[useToolProcessing] Marking files for cleanup on unmount`);
        markForCleanup();
      }
      setSelectedTool(null);
    };
  }, [toolName, setSelectedTool, autoClearFiles, markForCleanup]);

  // Sync local state with global processing state
  useEffect(() => {
    if (globalProcessingState === 'processing') {
      updateState({ 
        isLoading: true, 
        stage: 'processing',
        stageMessage: 'Processing files...' 
      });
    } else if (globalProcessingState === 'success') {
      updateState({ 
        isLoading: false, 
        stage: 'completed',
        stageMessage: 'Processing completed successfully!' 
      });
    } else if (globalProcessingState === 'error') {
      updateState({ 
        isLoading: false, 
        stage: 'error',
        stageMessage: 'Processing failed. Please try again.' 
      });
    }
  }, [globalProcessingState]);

  const updateState = useCallback((updates: Partial<ProcessingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const processFiles = useCallback(async (additionalData?: Record<string, any>) => {
    if (files.length === 0) {
      toast.error("Please upload files first");
      return null;
    }

    console.log(`[useToolProcessing] Starting processing for ${files.length} files`);
    
    try {
      updateState({
        isLoading: true,
        progress: 0,
        stage: 'uploading',
        stageMessage: 'Preparing files for processing...',
        error: null,
      });

      setProcessingState('processing');

      // Prepare form data - handle single vs multiple file endpoints
      const formData = new FormData();
      
      // Single file endpoints (based on api-client.ts logic)
      const singleFileEndpoints = [
        'split-pdf', 'pdf-to-jpg', 'add-watermark',
        'pdf-to-word', 'word-to-pdf', 'compress-pdf', 'protect-pdf',
        'page-numbering', 'organize-pdf',
        'fix-scanned-pdf', 'optimize-pdf', 'prepare-print-pdf',
        'pdf-to-excel', 'excel-to-pdf'
      ];
      
      // Extract the endpoint path from the URL (e.g., 'word-to-pdf' from 'http://127.0.0.1:8000/api/word-to-pdf')
      let endpointPath = endpoint;
      try {
        const url = new URL(endpoint);
        endpointPath = url.pathname; // e.g., '/api/word-to-pdf'
      } catch (e) {
        // Not a valid URL, use as-is
      }
      
      // Check if this is a single file endpoint
      const isSingleFileEndpoint = singleFileEndpoints.some(singleEndpoint =>
        endpointPath.includes(singleEndpoint)
      );
      
      console.log(`[useToolProcessing] Debug: endpoint=${endpoint}, endpointPath=${endpointPath}, files.length=${files.length}, isSingleFileEndpoint=${isSingleFileEndpoint}`);
      
      if (files.length === 1 && isSingleFileEndpoint) {
        // Single file endpoints use 'file' key
        formData.append('file', files[0]);
        console.log(`[useToolProcessing] Using 'file' key for single-file endpoint: ${endpoint}`);
      } else {
        // Multiple files endpoints use 'files' key
        files.forEach((file, index) => {
          formData.append("files", file);
        });
        console.log(`[useToolProcessing] Using 'files' key for multiple-file endpoint: ${endpoint}`);
      }
      
      // Debug: Log FormData keys
      const formDataKeys: string[] = [];
      for (const key of formData.keys()) {
        formDataKeys.push(key);
      }
      console.log(`[useToolProcessing] FormData keys: ${formDataKeys.join(', ')}`);

      // Add additional data if provided
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      // Update progress
      updateState({
        stage: 'processing',
        stageMessage: 'Processing files...',
        progress: 30,
      });

      // Call backend API
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Processing failed (${response.status})`;
        const rawBody = await response.text();
        
        // Try to extract a user-friendly message from the backend JSON response
        try {
          const errorData = JSON.parse(rawBody);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          }
          console.log(`[useToolProcessing] Parsed backend error:`, errorData);
        } catch {
          // Not JSON or unparseable — fall back to a clean generic message
          if (rawBody && rawBody.length < 200) {
            errorMessage = rawBody;
          }
        }
        
        console.log(`[useToolProcessing] Final error message: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Get the processed file
      const blob = await response.blob();
      console.log(`[useToolProcessing] Response blob: ${blob.size} bytes, type=${blob.type}`);

      updateState({
        stage: 'downloading',
        stageMessage: 'Preparing download...',
        progress: 85,
      });

      // Resolve filename using the reusable download utility
      const filename = await resolveDownloadFilename(response, toolName, blob);
      console.log(`[useToolProcessing] Resolved filename: ${filename}`);

      // Download the file
      const url = URL.createObjectURL(blob);
      triggerDownload(blob, filename);

      updateState({
        stage: 'completed',
        stageMessage: 'Processing completed successfully!',
        progress: 100,
        isLoading: false,
      });

      setProcessingState('success');
      toast.success("Processing completed successfully!");

      // Mark files for cleanup after successful processing
      if (autoClearFiles) {
        console.log(`[useToolProcessing] Marking files for cleanup after successful processing`);
        markForCleanup();
      }

      // Call success callback
      if (onSuccess) {
        onSuccess({ url, filename, blob });
      }

      return { url, filename, blob };
    } catch (error) {
      console.error(`[useToolProcessing] Error:`, error);
      
      const errorMessage = error instanceof Error ? error.message : "Processing failed. Please try again.";
      
      updateState({
        stage: 'error',
        stageMessage: errorMessage,
        progress: 0,
        isLoading: false,
        error: errorMessage,
      });

      setProcessingState('error');
      toast.error(errorMessage);

      // Call error callback
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }

      return null;
    }
  }, [files, endpoint, toolName, autoClearFiles, updateState, setProcessingState, markForCleanup, onSuccess, onError]);

  const reset = useCallback(() => {
    console.log(`[useToolProcessing] Resetting state`);
    updateState({
      isLoading: false,
      progress: 0,
      stage: 'idle',
      stageMessage: '',
      error: null,
    });
    setProcessingState('idle');
  }, [updateState, setProcessingState]);

  const clearAllFiles = useCallback(() => {
    console.log(`[useToolProcessing] Manually clearing all files`);
    clearFiles();
    reset();
  }, [clearFiles, reset]);

  return {
    files,
    ...state,
    processFiles,
    reset,
    clearAllFiles,
    hasFiles: files.length > 0,
  };
}