"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useFileContext } from "@/lib/file-context";
import { toast } from "sonner";
import { resolveDownloadFilename, triggerDownload, MIME_TO_EXTENSION } from "@/lib/download-utils";

/**
 * Format a millisecond duration as `M:SS` (or `MM:SS` once over 10 min).
 * Used by the live elapsed-time counter in tool components so long renders
 * (e.g. PDF→JPG at 300 DPI) don't look frozen.
 */
export function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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
  /**
   * Wall-clock time elapsed since processing started, in milliseconds.
   * Updates roughly once per second while `isLoading` is true. Components
   * use this to render a live "MM:SS" counter so long renders (e.g. 300 DPI
   * PDF→JPG) don't look frozen.
   */
  elapsedMs: number;
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
    elapsedMs: 0,
  });
  // Track when the current run started so the elapsed timer below can tick
  // independently of React re-renders. Held in ref to avoid resetting the
  // timer on every parent re-render.
  const startedAtRef = useRef<number | null>(null);

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

  // Elapsed-time ticker. Runs only while a job is in flight; clears itself
  // on completion or error. Tick rate is 1s — enough resolution for a
  // user-facing MM:SS counter without thrashing React.
  useEffect(() => {
    if (!state.isLoading || startedAtRef.current === null) return;
    const id = setInterval(() => {
      const since = startedAtRef.current;
      if (since !== null) {
        setState(prev => ({ ...prev, elapsedMs: Date.now() - since }));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [state.isLoading]);

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

    // Stamp the start time so the elapsed-timer effect ticks from now.
    startedAtRef.current = Date.now();

    try {
      updateState({
        isLoading: true,
        progress: 0,
        stage: 'uploading',
        stageMessage: 'Preparing files for processing...',
        error: null,
        elapsedMs: 0,
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
        'pdf-to-excel', 'excel-to-pdf',
        'unlock-pdf', 'rotate-pdf', 'extract-pages',
        'powerpoint-to-pdf', 'pdf-to-powerpoint',
        'ocr-pdf'
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

      // Capture all custom X-* response headers so tool-specific clients can
      // surface backend signals (e.g. X-DPI-Adjusted from pdf-to-jpg). The
      // hook itself stays generic — interpretation is the caller's job.
      const customHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        if (key.toLowerCase().startsWith("x-")) {
          customHeaders[key.toLowerCase()] = value;
        }
      });

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

      // Stop the elapsed-timer effect — null clears the next tick.
      startedAtRef.current = null;

      // Mark files for cleanup after successful processing
      if (autoClearFiles) {
        console.log(`[useToolProcessing] Marking files for cleanup after successful processing`);
        markForCleanup();
      }

      // Call success callback
      if (onSuccess) {
        onSuccess({ url, filename, blob, headers: customHeaders });
      }

      return { url, filename, blob, headers: customHeaders };
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

      // Stop the elapsed-timer effect — null clears the next tick.
      startedAtRef.current = null;

      // Call error callback
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }

      return null;
    }
  }, [files, endpoint, toolName, autoClearFiles, updateState, setProcessingState, markForCleanup, onSuccess, onError]);

  const reset = useCallback(() => {
    console.log(`[useToolProcessing] Resetting state`);
    startedAtRef.current = null;
    updateState({
      isLoading: false,
      progress: 0,
      stage: 'idle',
      stageMessage: '',
      error: null,
      elapsedMs: 0,
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