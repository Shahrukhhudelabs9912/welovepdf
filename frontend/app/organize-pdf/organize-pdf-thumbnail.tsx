"use client";

import { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "grid" | "list";

interface PageItem {
  id: string;
  pageNumber: number; // 1-based original page number
}

interface SortablePageThumbnailProps {
  pageItem: PageItem;
  objectUrl: string;
  viewMode: ViewMode;
  onDelete: (pageNumber: number) => void;
  isProcessing: boolean;
}

export const SortablePageThumbnail = memo(function SortablePageThumbnail({
  pageItem,
  objectUrl: _objectUrl,
  viewMode,
  onDelete,
  isProcessing,
}: SortablePageThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pageItem.id, disabled: isProcessing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-shadow hover:shadow-md ${
        viewMode === "list" ? "flex items-center" : ""
      }`}
    >
      {/* Drag Handle */}
      {!isProcessing && (
        <button
          {...attributes}
          {...listeners}
          className={`absolute top-2 left-2 z-10 p-1 rounded bg-white/80 dark:bg-gray-900/80 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity ${
            viewMode === "list" ? "relative top-auto left-auto shrink-0" : ""
          }`}
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-gray-500" />
        </button>
      )}

      {/* Delete Button */}
      {!isProcessing && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(pageItem.pageNumber);
          }}
          title="Delete page"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Page Thumbnail Card */}
      <div
        className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden ${
          viewMode === "grid"
            ? "aspect-[3/4] w-full"
            : "w-16 h-20 shrink-0"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-2">
          <FileText className={`${viewMode === "grid" ? "h-10 w-10" : "h-6 w-6"} mb-2`} />
          <span className={`font-bold text-gray-600 dark:text-gray-300 ${viewMode === "grid" ? "text-lg" : "text-xs"}`}>
            {pageItem.pageNumber}
          </span>
        </div>
      </div>

      {/* Page Label */}
      <div className="absolute bottom-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium">
        {pageItem.pageNumber}
      </div>

      {/* List view details */}
      {viewMode === "list" && (
        <div className="flex-1 px-4 py-3 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Page {pageItem.pageNumber}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Drag to reorder • Click × to delete
          </p>
        </div>
      )}
    </div>
  );
});