"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface FileContextType {
  files: File[];
  setFiles: (files: File[]) => void;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  processingProgress: number;
  setProcessingProgress: (progress: number) => void;
  selectedTool: string | null;
  setSelectedTool: (tool: string | null) => void;
  processingState: 'idle' | 'processing' | 'success' | 'error';
  setProcessingState: (state: 'idle' | 'processing' | 'success' | 'error') => void;
  processedResult: { url: string; filename: string } | null;
  setProcessedResult: (result: { url: string; filename: string } | null) => void;
  resetProcessing: () => void;
  lastToolPath: string | null;
  shouldClearFiles: boolean;
  markForCleanup: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [processedResult, setProcessedResult] = useState<{ url: string; filename: string } | null>(null);
  const [lastToolPath, setLastToolPath] = useState<string | null>(null);
  const [shouldClearFiles, setShouldClearFiles] = useState(false);
  
  const pathname = usePathname();

  // Track navigation and clear files when navigating away from tools
  useEffect(() => {
    console.log(`[FileContext] Navigation: ${pathname}, Last tool: ${lastToolPath}, Selected tool: ${selectedTool}`);
    
    // If we're navigating to a different tool or away from tools, clear files
    if (lastToolPath && pathname !== lastToolPath) {
      console.log(`[FileContext] Navigating away from ${lastToolPath} to ${pathname}, clearing files`);
      clearFiles();
      setLastToolPath(null);
      setSelectedTool(null);
    }
    
    // If we're on a tool page, update lastToolPath
    if (pathname.includes('/pdf-to-word') ||
        pathname.includes('/pdf-to-jpg') ||
        pathname.includes('/merge-pdf') ||
        pathname.includes('/split-pdf') ||
        pathname.includes('/jpg-to-pdf') ||
        pathname.includes('/compress-pdf') ||
        pathname.includes('/add-watermark')) {
      setLastToolPath(pathname);
    }
  }, [pathname, lastToolPath]);

  // Clear files when component unmounts (tool page navigation)
  useEffect(() => {
    return () => {
      console.log(`[FileContext] Tool component unmounting, checking if files should be cleared`);
      if (shouldClearFiles) {
        console.log(`[FileContext] Clearing files on unmount`);
        clearFiles();
        setShouldClearFiles(false);
      }
    };
  }, [shouldClearFiles]);

  const addFiles = (newFiles: File[]) => {
    console.log(`[FileContext] Adding ${newFiles.length} files:`, newFiles.map(f => f.name));
    setFiles(prev => {
      const unique = newFiles.filter(
        f => !prev.some(p => p.name === f.name && p.size === f.size)
      );
      console.log(`[FileContext] Filtered to ${unique.length} unique files`);
      return [...prev, ...unique];
    });
  };

  const removeFile = (index: number) => {
    console.log(`[FileContext] Removing file at index ${index}`);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = useCallback(() => {
    console.log(`[FileContext] Clearing all files (was ${files.length} files)`);
    setFiles([]);
    // Also reset processing state when clearing files
    resetProcessing();
  }, [files.length]);

  const resetProcessing = useCallback(() => {
    console.log(`[FileContext] Resetting processing state`);
    setProcessingState('idle');
    setProcessedResult(null);
    setProcessingProgress(0);
    setIsLoading(false);
  }, []);

  const markForCleanup = useCallback(() => {
    console.log(`[FileContext] Marking files for cleanup on next navigation`);
    setShouldClearFiles(true);
  }, []);

  // Auto-clear files after successful processing
  useEffect(() => {
    if (processingState === 'success' && files.length > 0) {
      console.log(`[FileContext] Processing successful, scheduling file cleanup`);
      const timer = setTimeout(() => {
        console.log(`[FileContext] Auto-clearing files after successful processing`);
        clearFiles();
      }, 2000); // 2 second delay to ensure download has started
      
      return () => clearTimeout(timer);
    }
  }, [processingState, files.length, clearFiles]);

  // Clear files when page is about to be unloaded
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log(`[FileContext] Page unloading, clearing files`);
      clearFiles();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [clearFiles]);

  return (
    <FileContext.Provider
      value={{
        files,
        setFiles,
        addFiles,
        removeFile,
        clearFiles,
        isLoading,
        setIsLoading,
        processingProgress,
        setProcessingProgress,
        selectedTool,
        setSelectedTool,
        processingState,
        setProcessingState,
        processedResult,
        setProcessedResult,
        resetProcessing,
        lastToolPath,
        shouldClearFiles,
        markForCleanup,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
}