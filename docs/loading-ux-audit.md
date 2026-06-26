# Task 1 — Loading Experience Audit (WeLovePDF Frontend)

_Analysis only. No code changed. Date: 2026-06-20._

## 1. What already exists (the good news)

The app is **not** starting from zero. There is real loading infrastructure already in place:

| Asset | Location | What it does |
|---|---|---|
| `LoadingSpinner` / `PageLoader` | `frontend/components/loading-spinner.tsx` | Generic SVG spinner + a full-page centered loader |
| `Skeleton` + pre-built skeletons | `frontend/components/skeleton-loader.tsx` | `ToolPageSkeleton`, `ToolContentSkeleton`, `CardSkeleton`, `FileListSkeleton` |
| Root route loader | `frontend/app/loading.tsx` | Renders `ToolPageSkeleton` during route transitions (App Router) |
| `useToolProcessing` hook | `frontend/hooks/use-tool-processing.ts` | Drives `isLoading`, `progress`, `stage`, `stageMessage`, live `elapsedMs` timer, fires success/error toasts, disables actions |
| `ToolComponent` | `frontend/components/tools/tool-component.tsx` | Shared tool UI: progress bar, stage label, elapsed timer, error box, button disabling, double-click guard |
| `Toaster` + `notify` | `frontend/components/ui/toaster.tsx` | Sonner toaster mounted at root (`layout.tsx:103`); `notify` helper exposes success/error/warning/promise/loading |

**Implication:** the work is mostly about (a) a branded loader to replace the generic SVG spinner, and (b) closing consistency gaps — not building loaders from scratch.

## 2. Tool inventory — loader coverage

There are **21 tools**. They fall into 3 buckets by how they handle loading:

### Bucket A — Use shared `ToolComponent` + `useToolProcessing` (full, consistent loaders) ✅
Progress bar + stage message + live elapsed timer + success/error toast + button disabled while processing + double-click prevented (button `disabled={!hasFiles || isLoading}`).

- `rotate-pdf` (`app/rotate-pdf/page.tsx` → `ToolComponent`)
- `extract-pages` (`app/extract-pages/page.tsx` → `ToolComponent`)
- `unlock-pdf` (`app/unlock-pdf/page.tsx` → `ToolComponent`)
- `pdf-to-jpg` (bespoke client but wraps `ToolComponent` w/ `onBeforeProcess`)
- `split-pdf`, `add-watermark`, `organize-pdf`, `page-numbering`, `protect-pdf`, `pdf-to-word`, `word-to-pdf`, `excel-to-pdf`, `pdf-to-excel`, `jpg-to-pdf`, `pdf-to-powerpoint`, `powerpoint-to-pdf` — bespoke `-client.tsx` files that still import/use the shared processing path.

### Bucket B — Dedicated tool components ✅ (separate but complete)
- `merge-pdf` → `components/tools/merge-pdf-tool.tsx`
- `compress-pdf` → `components/tools/compress-pdf-tool.tsx`

### Bucket C — Heavily bespoke, custom loading logic ⚠️ (works, but inconsistent styling)
- `sign-pdf` (`app/sign-pdf/sign-pdf-client.tsx`) — own dynamic-import loader ("Loading PDF viewer…" plain text, `sign-pdf-client.tsx:26`), own canvas flow.
- AI tools (`components/ai/ai-tools-section.tsx`) — **simulated** progress bar (`startProgressSimulation`), own status state machine, own spinner.

**No tool is completely missing a loader during processing.** The problem is **inconsistency**, not absence — see §4.

## 3. Non-tool pages — loader coverage

| Page / area | Async work | Loading feedback today | Gap |
|---|---|---|---|
| Login (`app/login/page.tsx`) | auth submit | ✅ button spinner + disabled inputs (`isSubmitting`) | none |
| Signup (`app/signup/page.tsx`) | auth submit | ✅ same pattern | verify parity |
| Reset password (`app/reset-password/page.tsx`) | auth submit | ✅ uses toast | verify spinner |
| Settings (`app/settings/page.tsx`) | profile/password PUT/POST | ✅ per-button `Loader2` spinners + `authLoading` skeleton | none |
| Dashboard overview (`app/dashboard/page.tsx`) | `/api/dashboard/overview` fetch | ✅ inline `animate-pulse` skeleton + per-card `loading` prop | **bespoke skeleton, not shared** |
| Dashboard history (`app/dashboard/history/page.tsx`) | history fetch | uses `history-table.tsx` (has loading prop) | verify |
| Dashboard reports (`app/dashboard/reports/page.tsx`) | report data | needs check | likely inline |
| Home (`app/page.tsx`) | mostly static | route-level `loading.tsx` | OK |
| AI tools (`app/ai-tools/page.tsx`) | AI analysis + report | ✅ simulated progress + spinner | **simulated %, not real** |
| **Language switching** (`components/locale-switcher.tsx`) | **hard nav `window.location.href`** (`locale-switcher.tsx:29`) | ❌ **none** | **No feedback during full-page reload → looks frozen** |
| Header user/auth state | `auth-context` bootstrap | check | possible flash |

### Route-level loaders
Only **one** `loading.tsx` exists — at the app root (`app/loading.tsx`). There are **no nested `loading.tsx`** for `/dashboard`, `/login`, `/ai-tools`, etc. The root one renders a **tool-shaped** skeleton (`ToolPageSkeleton`), which is **wrong** for non-tool routes (e.g. dashboard, login) — a user navigating to `/login` briefly sees a 3-column tool skeleton.

## 4. Inconsistencies (the real problem)

1. **Three different progress patterns coexist:**
   - Real staged progress (`useToolProcessing`: uploading→processing→downloading→completed + elapsed timer)
   - Simulated progress that ticks to a ceiling (`ai-tools-section.tsx` `startProgressSimulation`)
   - Plain text "Loading…" (`sign-pdf` viewer)
2. **Two spinner sources:** custom SVG in `LoadingSpinner`/login page vs. `Loader2` from lucide-react used inline in most clients. No single branded spinner.
3. **Skeletons are inconsistent:** shared `Skeleton`/`ToolPageSkeleton` exist, but dashboard & settings hand-roll their own `bg-gray-200 animate-pulse` blocks instead of using them.
4. **Root `loading.tsx` is tool-shaped** and shown for every route, including non-tool routes.
5. **No branded identity:** all loaders are generic blue/gray; nothing reflects a WeLovePDF logo/brand mark.

## 5. Areas where the user may think the app is stuck 🚨

| Severity | Where | Why |
|---|---|---|
| **High** | **Language switch** | `window.location.href` triggers a full reload with **zero** visual feedback. On a slow network the page just sits there. |
| **High** | **Long renders (pdf-to-jpg @300DPI, OCR, conversions)** | Backend can take minutes. Elapsed timer exists in `useToolProcessing` ✅ but the AI/sign-pdf bespoke flows and any tool not on the shared hook don't show it. |
| Medium | **Route navigation to non-tool pages** | Wrong (tool-shaped) skeleton flashes, which is disorienting rather than reassuring. |
| Medium | **Dashboard first load on slow network** | Skeleton exists but is bespoke; if `authLoading` resolves before data, there can be a brief empty state. |
| Medium | **AI report download** (`ai-tools-section handleDownload`) | Spinner exists ✅ but report generation is slow and there's no elapsed/stage feedback. |
| Low | **File upload validation** | Oversize files toast immediately ✅ (good), but very large valid uploads have no upload-progress bar (fetch has no `onUploadProgress`). |

## 6. Notification / alert audit (feeds Task 3)

- **Toaster mounted:** ✅ `app/layout.tsx:103`, sonner, `position="bottom-right"`, `richColors`, `closeButton`, `duration={4000}`, `visibleToasts={3}`.
- **Inconsistency:** a `notify` helper exists (`toaster.tsx:35`) but is **essentially unused** — ~109 call sites across 23 files import `toast` **directly from "sonner"** instead. Two competing conventions.
- **Native dialogs:** one `window.confirm()` (`pdf-to-jpg-client.tsx:100`) for heavy-render confirmation — breaks visual consistency.
- **Vague messages** (no "why"/"what next"):
  - `use-tool-processing.ts` fallbacks: `"Processing failed. Please try again."`, `"Processing completed successfully!"`, `"Please upload files first"`
  - `dashboard/page.tsx:58`: `"Something went wrong"`
  - Several `Analysis failed (HTTP {status})` / `Report generation failed (HTTP {status})` in `ai-tools-section.tsx`
- **Descriptions rarely used:** most `toast.success(...)` / `toast.error(...)` calls pass a single line with no `description`, so they don't explain cause or next step.

## 7. Recommended scope for Task 2 & 3 (preview)

- **Task 2:** Build a branded `WeLovePDFLoader` (logo mark + animation) and a small set of wrappers — `FullPageLoader`, `ToolProcessingLoader`, `FileUploadLoader`, `AIProcessingLoader`, `ButtonLoader` — then (a) swap the generic spinner inside existing infra, (b) add per-route `loading.tsx` (correct skeleton per route group), (c) **fix the language-switch no-feedback gap**, (d) verify double-click guards everywhere.
- **Task 3:** Standardize on the `notify` helper (or a thin wrapper), give it Success/Error/Warning/Info/Processing variants with `description` ("what happened / why / what next"), replace the `window.confirm` with a branded dialog, and migrate the ~109 direct `toast.*` calls.

---
**Bottom line:** Loaders mostly *exist* but are *inconsistent and unbranded*, route-level loading is tool-shaped for all routes, and the **language switcher has no feedback at all**. Notifications work but are fragmented across two conventions with several vague messages.
