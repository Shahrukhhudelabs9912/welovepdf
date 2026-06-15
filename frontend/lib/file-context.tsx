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
    // If we're navigating to a different tool or away from tools, clear files
    if (lastToolPath && pathname !== lastToolPath) {
      if (typeof window !== 'undefined') {
        clearFiles();
      }
      setLastToolPath(null);
      setSelectedTool(null);
    }
    
    // If we're on a tool page, update lastToolPath
    if (pathname.includes('/pdf-to-word') ||
        pathname.includes('/pdf-to-jpg') ||
        pathname.includes('/pdf-to-excel') ||
        pathname.includes('/excel-to-pdf') ||
        pathname.includes('/word-to-pdf') ||
        pathname.includes('/merge-pdf') ||
        pathname.includes('/split-pdf') ||
        pathname.includes('/jpg-to-pdf') ||
        pathname.includes('/compress-pdf') ||
        pathname.includes('/protect-pdf') ||
        pathname.includes('/page-numbering') ||
        pathname.includes('/organize-pdf') ||
        pathname.includes('/add-watermark')) {
      setLastToolPath(pathname);
    }
  }, [pathname, lastToolPath]);

  // Clear files when component unmounts (tool page navigation)
  useEffect(() => {
    return () => {
      if (shouldClearFiles) {
        clearFiles();
        setShouldClearFiles(false);
      }
    };
  }, [shouldClearFiles]);

  const addFiles = (newFiles: File[]) => {
    setFiles(prev => {
      const unique = newFiles.filter(
        f => !prev.some(p => p.name === f.name && p.size === f.size)
      );
      return [...prev, ...unique];
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetProcessing = useCallback(() => {
    setProcessingState('idle');
    setProcessedResult(null);
    setProcessingProgress(0);
    setIsLoading(false);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    // Also reset processing state when clearing files
    resetProcessing();
  }, [resetProcessing]);

  const markForCleanup = useCallback(() => {
    setShouldClearFiles(true);
  }, []);

  // Auto-clear files after successful processing
  useEffect(() => {
    if (processingState === 'success' && files.length > 0) {
      const timer = setTimeout(() => {
        clearFiles();
      }, 2000); // 2 second delay to ensure download has started
      
      return () => clearTimeout(timer);
    }
  }, [processingState, files.length, clearFiles]);

  // Clear files when page is about to be unloaded
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearFiles();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
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