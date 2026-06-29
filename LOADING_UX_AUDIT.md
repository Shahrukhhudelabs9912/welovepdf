# Task 1 — Loading Experience Audit (PDFOrca)

> Analysis only. No code changed. Date: 2026-06-20.
> Based on direct source review of `frontend/`.

## Summary

The loading **infrastructure already exists and is strong** (built across prior iterations). The remaining work is **consistency**, not creation.

- Branded loader system: `components/brand-loader.tsx` exposes `BrandMark`, `BrandLoader`, `FullPageLoader`, `OverlayLoader`, `ToolProcessingLoader`, `FileUploadLoader`, `AIProcessingLoader`, `ButtonLoader`.
- Tailwind keyframes backing it (`brand-float`, `brand-line-1/2/3`) exist in `tailwind.config.ts` with `motion-reduce` fallbacks.
- Processing hook `hooks/use-tool-processing.ts` drives every standard tool: stages (uploading -> processing -> downloading -> completed/error), live elapsed timer, progress bar, success/error toasts, and multi-click prevention via `disabled={!hasFiles || isLoading}`.
- Skeletons: `components/skeleton-loader.tsx` (ToolPageSkeleton, ToolContentSkeleton, CardSkeleton, FileListSkeleton).
- Toaster (sonner) is mounted globally in `app/layout.tsx`.
- Root route transition fallback: `app/loading.tsx` -> ToolPageSkeleton.

## Where users experience delays — current coverage

| Delay point | Covered? | Mechanism |
|---|---|---|
| Page navigation (root) | YES | `app/loading.tsx` |
| File upload | YES | upload toast + FileUpload component |
| File processing | YES | use-tool-processing stage + progress + BrandMark |
| File conversion | YES | same hook (shared by 20 tools via ToolComponent) |
| Download preparation | YES | stage 'downloading' -> "Preparing download..." |
| AI tool processing | PARTIAL | AIProcessingLoader exists; wiring in ai-tools-section unverified |
| Auth submit (login/signup/reset) | INCONSISTENT | has loading state but uses raw inline animate-spin SVG, not ButtonLoader |
| sign-pdf (custom 21st tool) | YES | own isProcessing, toasts, dynamic() loading fallback, button disable |

## Tools — 21 total

20 standard tools route through `ToolComponent` (full loader + progress + multi-click guard):
merge, compress, split, pdf-to-jpg, jpg-to-pdf, add-watermark, rotate, extract-pages, pdf-to-powerpoint, unlock, ocr, pdf-to-word, word-to-pdf, excel-to-pdf, pdf-to-excel, organize, protect, page-numbering, powerpoint-to-pdf.

1 custom tool — sign-pdf — has its own loading + toasts. OK.

## Findings

### A. Pages WITHOUT a dedicated route-transition loader
Only root `app/loading.tsx` exists. No per-segment `loading.tsx` for:
- dashboard/, dashboard/history/, dashboard/reports/
- settings/
- login/, signup/, reset-password/
- marketing pages (low priority)

Note: dashboard/settings DO reference in-page loading/skeleton states; they just lack the instant Next.js route-segment fallback.

### B. Inconsistent loading experiences (the real gap)
1. Auth buttons (login, signup, reset-password) use a hand-rolled animate-spin SVG instead of branded ButtonLoader. Off-brand and duplicated.
2. AI tools — confirm AIProcessingLoader is actually rendered during AI calls.
3. Two parallel spinner systems coexist: branded BrandMark (correct) and generic LoadingSpinner / raw SVGs (legacy). Should converge on branded.

### C. "App looks stuck" risk areas
- Long conversions: mitigated by elapsed timer + progress bar. OK.
- Auth round-trip on slow network: covered (button spinner + disable).
- Navigation to dashboard/settings: brief blank flash possible (no segment loading.tsx).

## Recommendation for Task 2 (no code yet)
1. Replace raw auth spinners with ButtonLoader (3 files).
2. Add loading.tsx route fallbacks for dashboard, settings, auth segments.
3. Verify/wire AIProcessingLoader in the AI section.
4. Retire/redirect legacy LoadingSpinner usages to the branded set.

Conclusion: ~80% of loader work is done. Task 2 is a focused consistency pass, not a rebuild.
