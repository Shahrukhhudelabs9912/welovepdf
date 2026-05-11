"use client";

import { useState } from "react";
import { ToolComponent } from "@/components/tools/tool-component";
import { Button } from "@/components/ui/button";
import { Settings, Grid } from "lucide-react";

export function PDFToJPGClient() {
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(85);
  const [dpi, setDpi] = useState(150);
  const [pageNumber, setPageNumber] = useState(0);

  const additionalContent = showSettings && (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="font-medium mb-3">Conversion Settings</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Image Quality</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{quality}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Higher quality = larger file size</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Resolution (DPI)</label>
          <div className="flex gap-2">
            {[72, 150, 300].map((value) => (
              <Button
                key={value}
                type="button"
                variant={dpi === value ? "default" : "outline"}
                size="sm"
                onClick={() => setDpi(value)}
              >
                {value} DPI
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Higher DPI = better quality for printing</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Page Number (0 = all pages)</label>
          <input
            type="number"
            min="0"
            value={pageNumber}
            onChange={(e) => setPageNumber(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">0 converts all pages, specific number converts single page</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ToolComponent
        toolName="pdf-to-jpg"
        endpoint="http://127.0.0.1:8000/api/pdf-to-jpg"
        title="Convert PDF to JPG"
        description="Upload your PDF file to convert it to high-quality JPG images."
        accept="application/pdf"
        multiple={false}
        maxSize={100 * 1024 * 1024} // 100MB
        additionalContent={additionalContent}
        autoClearFiles={true}
      />

      {/* Settings Toggle Button */}
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {showSettings ? "Hide Settings" : "Show Settings"}
        </Button>
      </div>

      {/* Sample Output Preview */}
      <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Grid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold">Sample Output Preview</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          After conversion, you'll receive high-quality JPG images like these examples:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((page) => (
            <div key={page} className="aspect-square bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-gray-300 dark:text-gray-600 mb-2">JPG</div>
                <div className="text-sm text-gray-500">Page {page}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Each page of your PDF will be converted to a separate JPG image file.
        </p>
      </div>
    </>
  );
}