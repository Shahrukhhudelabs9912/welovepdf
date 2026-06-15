"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ListOrdered, SortAsc, SortDesc, Grid, Columns,
  Download, Loader2, RefreshCw, AlertCircle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { ToolLayout } from "@/components/tools/tool-layout";
import { motion } from "framer-motion";
import { useToolProcessing } from "@/hooks/use-tool-processing";
import { downloadBlob } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

// Dynamic import — the sortable thumbnail is a client-only component
const SortablePageThumbnail = dynamic(
  () => import("./organize-pdf-thumbnail").then((mod) => ({ default: mod.SortablePageThumbnail })),
  { ssr: false }
);

const ORGANIZE_PDF_ENDPOINT = process.env.NEXT_PUBLIC_USE_PYTHON_BACKEND === "true"
  ? `${process.env.NEXT_PUBLIC_PYTHON_API_BASE || "http://localhost:8000/api"}/organize-pdf`
  : "/api/organize-pdf";

interface PageItem {
  id: string;
  pageNumber: number; // 1-based original page number
}

export function OrganizePDFClient() {
  const t = useTranslations("organize_pdf");
  const tp = useTranslations("tool_pages");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [sortVersion, setSortVersion] = useState(0); // Force SortableContext remount on external sort
  const [originalPageOrder, setOriginalPageOrder] = useState<number[]>([]);
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string>("");
  const [organizedBlob, setOrganizedBlob] = useState<Blob | null>(null);
  const [organizedFilename, setOrganizedFilename] = useState<string>("");
  const [pageCount, setPageCount] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  // Keep a ref to the current object URL for cleanup
  const objectUrlRef = useRef<string>("");

  const {
    files,
    isLoading,
    progress,
    stage,
    stageMessage,
    error,
    processFiles,
    reset,
    clearAllFiles,
    hasFiles,
  } = useToolProcessing({
    toolName: "Organize PDF",
    endpoint: ORGANIZE_PDF_ENDPOINT,
    autoClearFiles: false,
    onSuccess: (result) => {
      if (result?.blob) {
        setOrganizedBlob(result.blob);
        setOrganizedFilename(result.filename || "organized.pdf");
      }
    },
  });

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // When files change, create object URL and detect pages using pdf-lib (no ESM issues)
  useEffect(() => {
    if (files.length > 0 && files[0]) {
      // Clean up previous URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(files[0]);
      objectUrlRef.current = url;
      setPdfObjectUrl(url);
      setIsDetecting(true);
      setPages([]);
      setPageCount(0);
      setOrganizedBlob(null);
      setOrganizedFilename("");

      // Use pdf-lib to read the PDF and count pages (no react-pdf / pdfjs-dist needed)
      const detectPages = async () => {
        try {
          const arrayBuffer = await files[0].arrayBuffer();
          const { PDFDocument } = await import("pdf-lib");
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const numPages = pdfDoc.getPageCount();
          console.log(`[organize-pdf] Detected ${numPages} pages`);
          setPageCount(numPages);
          setIsDetecting(false);
          const newPages: PageItem[] = Array.from({ length: numPages }, (_, i) => ({
            id: `page-${i + 1}`,
            pageNumber: i + 1,
          }));
          setPages(newPages);
          setOriginalPageOrder(newPages.map(p => p.pageNumber));
        } catch (err) {
          console.error("[organize-pdf] Failed to detect pages:", err);
          setIsDetecting(false);
          toast.error(t("invalid_pdf_toast"));
        }
      };
      detectPages();
    } else {
      // No files — reset
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }
      setPdfObjectUrl("");
      setPages([]);
      setPageCount(0);
      setOriginalPageOrder([]);
      setOrganizedBlob(null);
      setOrganizedFilename("");
    }
  }, [files, t]);

  const handleFileUpload = useCallback((_uploadedFiles: File[]) => {
    setOrganizedBlob(null);
    setOrganizedFilename("");
    reset();
  }, [reset]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPages((prevPages) => {
      const oldIndex = prevPages.findIndex((p) => p.id === active.id);
      const newIndex = prevPages.findIndex((p) => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prevPages;
      return arrayMove(prevPages, oldIndex, newIndex);
    });
  }, []);

  // Delete a page by its original page number
  const handleDeletePage = useCallback((pageNumber: number) => {
    setPages((prevPages) => prevPages.filter((p) => p.pageNumber !== pageNumber));
    toast.success(t("page_removed_toast", { pageNumber }));
  }, [t]);

  // Sort ascending (by original page number)
  const handleSortAscending = useCallback(() => {
    setPages((prevPages) =>
      [...prevPages].sort((a, b) => a.pageNumber - b.pageNumber)
    );
    setSortVersion((v) => v + 1); // Force SortableContext remount
    toast.success(t("sort_asc_toast"));
  }, [t]);

  // Sort descending (reverse original page number)
  const handleSortDescending = useCallback(() => {
    setPages((prevPages) =>
      [...prevPages].sort((a, b) => b.pageNumber - a.pageNumber)
    );
    setSortVersion((v) => v + 1); // Force SortableContext remount
    toast.success(t("sort_desc_toast"));
  }, [t]);

  // Reset to original order (restore all original pages including deleted ones)
  const handleResetToOriginal = useCallback(() => {
    const restored: PageItem[] = originalPageOrder.map((pageNum) => ({
      id: `page-${pageNum}`,
      pageNumber: pageNum,
    }));
    setPages(restored);
    setSortVersion((v) => v + 1); // Force SortableContext remount
    toast.success(t("reset_toast"));
  }, [originalPageOrder, t]);

  // Apply organization — send current page order to backend
  const handleApplyOrganization = async () => {
    if (!hasFiles) {
      toast.error(t("upload_pdf_first"));
      return;
    }

    if (pages.length === 0) {
      toast.error(t("no_pages_to_organize"));
      return;
    }

    setOrganizedBlob(null);
    setOrganizedFilename("");

    // Build page_order as JSON array of 1-based page numbers in desired order
    const pageOrder = pages.map((p) => p.pageNumber);

    await processFiles({
      page_order: JSON.stringify(pageOrder),
    });
  };

  const handleManualDownload = () => {
    if (organizedBlob) {
      downloadBlob(organizedBlob, organizedFilename || "organized.pdf");
    }
  };

  const isOrganized = !isLoading && organizedBlob !== null;
  const hasPages = pages.length > 0;

  const sortableIds = useMemo(() => pages.map(p => p.id), [pages]);

  // Computed values for parameterized translations
  const pageWord = pageCount === 1 ? t("page_singular") : t("page_plural");
  const previewPageWord = pages.length === 1 ? t("page_singular") : t("page_plural");
  const detectedInfo = t("detected_pages_info", { count: pageCount, page_word: pageWord });
  const afterDeletions = pages.length !== pageCount
    ? t("after_deletions_info", { shown: pages.length })
    : "";

  return (
    <ToolLayout
      title={t("title")}
      description={t("description")}
      toolName="Organize PDF"
      toolDescription={t("description")}
      toolKey="organize_pdf"
      seoContent={{
        h1: "Organize PDF Pages Online for Free",
        h2: "How to Organize PDF Pages",
        content: `
          <p>Our free PDF organizer tool gives you complete control over your document's structure. Whether you need to rearrange pages for a presentation, remove unnecessary sections, or sort pages in a specific order, our tool makes it simple and intuitive.</p>
          <p><strong>Key features:</strong></p>
          <ul>
            <li>Drag and drop interface for easy page reordering</li>
            <li>Sort pages numerically, ascending or descending</li>
            <li>Delete unwanted pages with one click</li>
            <li>Grid and list view modes</li>
            <li>Reset to original page order anytime</li>
            <li>Secure processing with automatic file deletion</li>
          </ul>
          <p>Perfect for organizing reports, creating presentations, compiling portfolios, or preparing documents for printing.</p>
        `,
        faq: [
          {
            question: "Can I organize multiple PDFs at once?",
            answer: "Yes! You can upload multiple PDF files and organize their pages together as if they were a single document. Our tool merges them temporarily for organization.",
          },
          {
            question: "How do I reorder pages?",
            answer: "Simply drag and drop page thumbnails to rearrange them. You can also use our sorting options to automatically organize pages by number, ascending or descending order.",
          },
          {
            question: "Can I delete pages from my PDF?",
            answer: "Absolutely. Hover over any page and click the trash icon to delete it. Use 'Reset to Original' to restore all deleted pages.",
          },
          {
            question: "Is there a limit to the number of pages I can organize?",
            answer: "Our free tier supports PDFs with up to 500 pages. For larger documents, consider splitting them first or upgrading to our premium plan.",
          },
        ],
      }}
    >
      <div className="space-y-6 lg:col-span-2">
        {/* Upload Section */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">{t("upload_to_organize_title")}</h3>
          <FileUpload
            onUpload={handleFileUpload}
            accept="application/pdf"
            multiple={false}
            maxSize={100 * 1024 * 1024}
          />
        </div>

        {/* Page Detection Status */}
        {hasFiles && isDetecting && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-gray-600 dark:text-gray-400">{t("detecting_pages")}</p>
          </div>
        )}

        {/* Page count info */}
        {hasFiles && pageCount > 0 && !isDetecting && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-gray-700 dark:text-gray-300">
              {detectedInfo}
              {afterDeletions && (
                <span className="text-gray-500">{afterDeletions}</span>
              )}
            </p>
          </div>
        )}

        {/* Organization Controls & Preview — shown once pages are detected */}
        {hasPages && !isDetecting && (
          <>
            {/* Sorting & View Mode Controls */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t("sorting_options")}</h3>
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4 mr-1" />
                    {t("grid_view")}
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <Columns className="h-4 w-4 mr-1" />
                    {t("list_view")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2" onClick={handleSortAscending}>
                  <SortAsc className="h-4 w-4" />
                  {t("sort_asc_label")}
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleSortDescending}>
                  <SortDesc className="h-4 w-4" />
                  {t("sort_desc_label")}
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleResetToOriginal}>
                  <RefreshCw className="h-4 w-4" />
                  {t("reset_to_original")}
                </Button>
              </div>
            </div>

            {/* Page Preview with Drag & Drop */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h3 className="text-xl font-semibold mb-2">
                {t("page_preview_title", { count: pages.length, page_word: previewPageWord })}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t("drag_hint_description")}
              </p>

              <DndContext
                key={`dnd-${sortVersion}`}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortableIds}
                  strategy={viewMode === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
                >
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                        : "space-y-2"
                    }
                  >
                    {pages.map((page) => (
                      <SortablePageThumbnail
                        key={page.id}
                        pageItem={page}
                        objectUrl={pdfObjectUrl}
                        viewMode={viewMode}
                        onDelete={handleDeletePage}
                        isProcessing={isLoading}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {pages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{t("all_pages_deleted")}</p>
                </div>
              )}
            </div>

            {/* Processing Progress */}
            {isLoading && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{stageMessage || t("organizing")}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300">{t("org_failed_title")}</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Display */}
            {isOrganized && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">{t("organization_success")}</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {t("organization_success_desc")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isOrganized ? (
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleApplyOrganization}
                  disabled={isLoading || pages.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("organizing_button")}
                    </>
                  ) : (
                    <>
                      <ListOrdered className="h-4 w-4" />
                      {t("apply_organization")}
                    </>
                  )}
                </Button>
              ) : (
                <Button size="lg" className="flex-1 gap-2" onClick={handleManualDownload}>
                  <Download className="h-4 w-4" />
                  {t("download_organized")}
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                onClick={handleResetToOriginal}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
                {t("reset_to_original")}
              </Button>
            </div>
            {isOrganized && (
              <p className="text-xs text-center text-gray-500 -mt-2">
                {t("download_hint")}
              </p>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}