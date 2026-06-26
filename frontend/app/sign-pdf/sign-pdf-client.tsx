"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Type,
  Upload,
  PenTool,
  Download,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  Eraser,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SIGNATURE_FONTS, type SignatureFont } from "./signature-fonts";

const SignPdfViewer = dynamic(() => import("./sign-pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="w-[600px] h-[800px] border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
      <span className="text-sm text-gray-500">Loading PDF viewer...</span>
    </div>
  ),
});

type Mode = "type" | "draw" | "upload";

interface Placement {
  id: string;
  page: number; // 1-based
  x: number;
  y: number;
  w: number;
  h: number;
}

const INK_COLORS = [
  { id: "black", label: "Black", value: "#000000" },
  { id: "blue", label: "Blue", value: "#1d4ed8" },
  { id: "red", label: "Red", value: "#b91c1c" },
];

const PAGE_WIDTH = 600;

function renderTypedSignatureToBlob(
  text: string,
  fontFamily: string,
  color: string,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!text.trim()) {
      resolve(null);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = `120px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob());
}

function DrawPad({
  value,
  onChange,
  clearLabel,
  color,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  clearLabel: string;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const hasInkRef = useRef(!!value);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    hasInkRef.current = false;
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const isTouch = "touches" in e;
    const clientX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * c.width,
      y: ((clientY - rect.top) / rect.height) * c.height,
    };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    drawingRef.current = true;
    lastRef.current = getPos(e);
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const pos = getPos(e);
    const last = lastRef.current!;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastRef.current = pos;
    hasInkRef.current = true;
  };
  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;
    if (hasInkRef.current && canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  };
  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    hasInkRef.current = false;
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-40 touch-none cursor-crosshair rounded-lg"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="text-xs text-gray-500 hover:text-red-500 inline-flex items-center gap-1"
      >
        <Eraser className="h-3 w-3" /> {clearLabel}
      </button>
    </div>
  );
}

export function SignPDFClient() {
  const t = useTranslations("sign_pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [mode, setMode] = useState<Mode>("type");
  const [typedText, setTypedText] = useState("");
  const [typedFont, setTypedFont] = useState<SignatureFont>(SIGNATURE_FONTS[0]);
  const [inkColor, setInkColor] = useState<string>(INK_COLORS[0].value);
  const [sigScale, setSigScale] = useState<number>(1); // 0.5 - 2.0
  const [drawDataUrl, setDrawDataUrl] = useState<string | null>(null);
  const [uploadedSig, setUploadedSig] = useState<File | null>(null);
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string | null>(null);

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signatureReady, setSignatureReady] = useState(false);
  const [applyAllPages, setApplyAllPages] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string | null>(null);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    orig: Placement;
    rect: DOMRect;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      if (uploadedSigUrl) URL.revokeObjectURL(uploadedSigUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sigIsReady = useMemo(() => {
    if (mode === "type") return typedText.trim().length > 0;
    if (mode === "draw") return !!drawDataUrl;
    return !!uploadedSig;
  }, [mode, typedText, drawDataUrl, uploadedSig]);

  useEffect(() => {
    if (!sigIsReady && signatureReady) setSignatureReady(false);
  }, [sigIsReady, signatureReady]);

  const handlePdfUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (!f.type.includes("pdf") && !f.name.toLowerCase().endsWith(".pdf")) {
        toast.error(t("toast_select_pdf"));
        return;
      }
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(f);
      setPdfFile(f);
      setPdfUrl(url);
      setPageNumber(1);
      setPlacements([]);
      setSelectedId(null);
      setResultUrl(null);
    },
    [pdfUrl],
  );

  const handleSigUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (uploadedSigUrl) URL.revokeObjectURL(uploadedSigUrl);
      const url = URL.createObjectURL(f);
      setUploadedSig(f);
      setUploadedSigUrl(url);
    },
    [uploadedSigUrl],
  );

  const handlePageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!signatureReady) {
        toast.error(t("toast_signature_first"));
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest("[data-placement]")) return;
      const el = pageContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const w = Math.min(0.6, 0.25 * sigScale);
      const h = w * (rect.width / rect.height) * 0.4;
      const cx = Math.max(0, Math.min(1 - w, x - w / 2));
      const cy = Math.max(0, Math.min(1 - h, y - h / 2));
      const baseId = `p${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      const targetPages =
        applyAllPages && numPages > 1
          ? Array.from({ length: numPages }, (_, i) => i + 1)
          : [pageNumber];
      const newOnes = targetPages.map((p) => ({
        id: `${baseId}-${p}`,
        page: p,
        x: cx,
        y: cy,
        w,
        h,
      }));
      setPlacements((prev) => [...prev, ...newOnes]);
      setSelectedId(`${baseId}-${pageNumber}`);
    },
    [signatureReady, applyAllPages, numPages, pageNumber, sigScale, t],
  );

  const startDrag = useCallback(
    (id: string, dragMode: "move" | "resize") => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const placement = placements.find((p) => p.id === id);
      if (!placement) return;
      const el = pageContainerRef.current;
      if (!el) return;
      dragRef.current = {
        id,
        mode: dragMode,
        startX: e.clientX,
        startY: e.clientY,
        orig: placement,
        rect: el.getBoundingClientRect(),
      };
      setSelectedId(id);
    },
    [placements],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (e.clientX - d.startX) / d.rect.width;
      const dy = (e.clientY - d.startY) / d.rect.height;
      setPlacements((prev) =>
        prev.map((p) => {
          if (p.id !== d.id) return p;
          if (d.mode === "move") {
            const nx = Math.max(0, Math.min(1 - d.orig.w, d.orig.x + dx));
            const ny = Math.max(0, Math.min(1 - d.orig.h, d.orig.y + dy));
            return { ...p, x: nx, y: ny };
          } else {
            const nw = Math.max(0.05, Math.min(1 - d.orig.x, d.orig.w + dx));
            const aspect = d.orig.h / d.orig.w;
            const nh = Math.max(0.02, Math.min(1 - d.orig.y, nw * aspect));
            return { ...p, w: nw, h: nh };
          }
        }),
      );
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const removePlacement = useCallback((id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    setSelectedId(null);
  }, []);

  const confirmSignature = useCallback(() => {
    if (!sigIsReady) {
      toast.error(t("toast_create_signature"));
      return;
    }
    setSignatureReady(true);
    toast.success(t("toast_signature_ready"));
  }, [sigIsReady, t]);

  const editSignature = useCallback(() => {
    setSignatureReady(false);
  }, []);

  const handleSign = useCallback(async () => {
    if (!pdfFile) {
      toast.error(t("toast_upload_pdf_first"));
      return;
    }
    if (placements.length === 0) {
      toast.error(t("toast_place_signature_first"));
      return;
    }
    let sigBlob: Blob | null = null;
    if (mode === "type") {
      sigBlob = await renderTypedSignatureToBlob(typedText, typedFont.fontFamily, inkColor);
    } else if (mode === "draw") {
      if (drawDataUrl) sigBlob = await dataUrlToBlob(drawDataUrl);
    } else {
      if (uploadedSig) sigBlob = uploadedSig;
    }
    if (!sigBlob) {
      toast.error(t("toast_signature_missing"));
      return;
    }

    setIsProcessing(true);
    try {
      const fd = new FormData();
      fd.append("file", pdfFile);
      fd.append("signature", sigBlob, "signature.png");
      fd.append(
        "placements",
        JSON.stringify(
          placements.map((p) => ({
            page_index: p.page - 1,
            x: p.x,
            y: p.y,
            width: p.w,
            height: p.h,
          })),
        ),
      );

      const res = await fetch("/api/sign-pdf", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: t("toast_sign_failed") }));
        toast.error(err.error || t("toast_sign_failed"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const cd = res.headers.get("content-disposition") || "";
      const match = cd.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || pdfFile.name.replace(/\.pdf$/i, "_signed.pdf");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setResultFilename(filename);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      toast.success(t("toast_signed_count", { count: placements.length }));
    } catch (e) {
      console.error("[sign-pdf] error:", e);
      toast.error(t("toast_sign_error"));
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFile, placements, mode, typedText, typedFont, inkColor, drawDataUrl, uploadedSig, resultUrl, t]);

  const renderPlacementContent = (p: Placement) => {
    if (mode === "type") {
      const el = pageContainerRef.current;
      const pxH = (el?.getBoundingClientRect().height || 0) * p.h;
      return (
        <span
          className={typedFont.className}
          style={{
            fontFamily: typedFont.fontFamily,
            fontSize: Math.max(12, pxH * 0.7),
            color: inkColor,
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {typedText}
        </span>
      );
    }
    if (mode === "draw" && drawDataUrl) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={drawDataUrl} alt="sig" className="max-w-full max-h-full object-contain" />;
    }
    if (mode === "upload" && uploadedSigUrl) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={uploadedSigUrl} alt="sig" className="max-w-full max-h-full object-contain" />;
    }
    return null;
  };

  const currentPagePlacements = placements.filter((p) => p.page === pageNumber);

  return (
    <div className="space-y-6">
      {!pdfFile && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">{t("upload_pdf_title")}</h3>
          <p className="text-sm text-gray-500 mb-4">{t("upload_pdf_hint")}</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90">
            <Upload className="h-4 w-4" />
            {t("choose_pdf")}
            <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
          </label>
        </div>
      )}

      {pdfFile && pdfUrl && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono truncate">{pdfFile.name}</p>
              <button
                onClick={() => {
                  setPdfFile(null);
                  setPdfUrl(null);
                  setPlacements([]);
                  setSelectedId(null);
                  setSignatureReady(false);
                }}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> {t("remove")}
              </button>
            </div>

            {signatureReady && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {t("click_to_place")}
              </div>
            )}

            <div className="flex justify-center">
              <SignPdfViewer
                fileUrl={pdfUrl}
                pageNumber={pageNumber}
                width={PAGE_WIDTH}
                onNumPages={setNumPages}
                onPageSize={() => {}}
                onClick={handlePageClick}
                containerRef={pageContainerRef}
                overlay={
                  <>
                    {currentPagePlacements.map((p) => (
                      <div
                        key={p.id}
                        data-placement
                        onMouseDown={startDrag(p.id, "move")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(p.id);
                        }}
                        className={`absolute select-none flex items-center justify-center bg-blue-500/5 ${
                          selectedId === p.id
                            ? "ring-2 ring-blue-500"
                            : "ring-1 ring-blue-300/60"
                        } cursor-move`}
                        style={{
                          left: `${p.x * 100}%`,
                          top: `${p.y * 100}%`,
                          width: `${p.w * 100}%`,
                          height: `${p.h * 100}%`,
                        }}
                      >
                        {renderPlacementContent(p)}
                        {selectedId === p.id && (
                          <>
                            <button
                              type="button"
                              data-placement
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlacement(p.id);
                              }}
                              className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div
                              data-placement
                              onMouseDown={startDrag(p.id, "resize")}
                              className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-sm bg-blue-500 cursor-nwse-resize border-2 border-white"
                              title="Resize"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </>
                }
              />
            </div>

            {numPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {t("page_of", { current: pageNumber, total: numPages })}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex">
                {(
                  [
                    { id: "type", label: t("mode_type"), icon: Type },
                    { id: "draw", label: t("mode_draw"), icon: Pencil },
                    { id: "upload", label: t("mode_upload"), icon: Upload },
                  ] as { id: Mode; label: string; icon: typeof Type }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setMode(tab.id);
                      setSignatureReady(false);
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
                      mode === tab.id
                        ? "bg-primary text-white"
                        : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4 space-y-3">
                {mode === "type" && (
                  <>
                    <input
                      type="text"
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value)}
                      placeholder={t("type_placeholder")}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {SIGNATURE_FONTS.map((f) => {
                        const isActive = typedFont.id === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setTypedFont(f)}
                            className={`relative flex h-16 items-center justify-center overflow-hidden rounded-lg border bg-white px-2 dark:bg-gray-900 transition-all ${
                              isActive
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                            }`}
                            title={f.label}
                          >
                            <span
                              className={`${f.className} truncate`}
                              style={{
                                fontFamily: f.fontFamily,
                                color: inkColor,
                                fontSize: typedText.trim().length > 12 ? 18 : 24,
                                lineHeight: 1,
                              }}
                            >
                              {typedText.trim() || f.label}
                            </span>
                            {isActive && (
                              <span className="absolute top-1 right-1 text-primary">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {mode === "draw" && (
                  <DrawPad
                    value={drawDataUrl}
                    onChange={setDrawDataUrl}
                    clearLabel={t("draw_clear")}
                    color={inkColor}
                  />
                )}

                {mode === "upload" && (
                  <>
                    <label className="block w-full px-3 py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center cursor-pointer hover:border-primary">
                      <Upload className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                      <span className="text-sm">
                        {uploadedSig ? uploadedSig.name : t("upload_choose")}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleSigUpload}
                        className="hidden"
                      />
                    </label>
                    {uploadedSigUrl && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[80px] flex items-center justify-center bg-white dark:bg-gray-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={uploadedSigUrl} alt="Signature" className="max-h-24" />
                      </div>
                    )}
                  </>
                )}

                {(mode === "type" || mode === "draw") && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500">Ink:</span>
                    {INK_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setInkColor(c.value)}
                        className={`h-6 w-6 rounded-full border-2 transition-all ${
                          inkColor === c.value
                            ? "border-primary ring-2 ring-primary/30 scale-110"
                            : "border-gray-300 dark:border-gray-600 hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.value }}
                        aria-label={c.label}
                        title={c.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {signatureReady && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Size</span>
                  <span className="font-mono">{Math.round(sigScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={sigScale}
                  onChange={(e) => setSigScale(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}

            {!signatureReady ? (
              <Button
                onClick={confirmSignature}
                disabled={!sigIsReady}
                className="w-full"
                size="lg"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t("use_signature")}
              </Button>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> {t("signature_ready")}
                </span>
                <button
                  onClick={editSignature}
                  className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline"
                >
                  {t("signature_edit")}
                </button>
              </div>
            )}

            {signatureReady && numPages > 1 && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyAllPages}
                  onChange={(e) => setApplyAllPages(e.target.checked)}
                  className="rounded"
                />
                {t("apply_all_pages")}
              </label>
            )}

            {placements.length > 0 && (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{t("placements_count", { count: placements.length })}</span>
                  <button
                    onClick={() => {
                      setPlacements([]);
                      setSelectedId(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> {t("clear_all")}
                  </button>
                </div>
                <div className="text-xs text-gray-500 max-h-32 overflow-y-auto space-y-1">
                  {placements.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                        selectedId === p.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                      onClick={() => {
                        setPageNumber(p.page);
                        setSelectedId(p.id);
                      }}
                    >
                      <span>
                        {t("placement_label", { index: i + 1, page: p.page })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlacement(p.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleSign}
              disabled={isProcessing || placements.length === 0}
              className="w-full"
              size="lg"
            >
              <PenTool className="h-4 w-4 mr-2" />
              {isProcessing
                ? t("signing")
                : `${t("sign_button")}${placements.length > 0 ? ` (${placements.length})` : ""}`}
            </Button>

            {resultUrl && resultFilename && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3">
                <a
                  href={resultUrl}
                  download={resultFilename}
                  className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300"
                >
                  <Download className="h-4 w-4" />
                  {t("result_download", { filename: resultFilename })}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
