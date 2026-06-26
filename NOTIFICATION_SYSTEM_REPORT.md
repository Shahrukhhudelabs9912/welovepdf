# Notification System Report

_Generated: 2026-06-21_

## Summary

WeLovePDF uses **Sonner** (`import { toast } from "sonner"`) as the single, app-wide toast/notification system. Every PDF tool surfaces user feedback — upload confirmations, success, errors, and informational hints — through `toast`, keeping notification behaviour consistent across the app.

## The library

- **Package:** `sonner`
- **Import:** `import { toast } from "sonner";`
- Mounted once at the app root (Toaster), then called imperatively from any client component.

## Notification types in use

| Method | Purpose | Example usage |
|--------|---------|---------------|
| `toast.success(...)` | Successful operations | upload complete, conversion/merge/split/compress success |
| `toast.error(...)` | Failures & validation | "upload PDF first", "conversion failed", API errors |
| `toast.info(...)` | Neutral hints | "file removed", "all fields cleared", reorder hints |

## Coverage by tool

| Tool | File | Notifications |
|------|------|---------------|
| Add Watermark | `frontend/app/add-watermark/add-watermark-client.tsx` | upload, success, error, validation, cleared |
| JPG → PDF | `frontend/app/jpg-to-pdf/jpg-to-pdf-client.tsx` | added files, success (implicit), error, file removed |
| Split PDF | `frontend/app/split-pdf/split-pdf-client.tsx` | added files, split success/failed, file removed |
| Compress PDF | `frontend/components/tools/compress-pdf-tool.tsx` | uploaded, success, error, download status, file removed |
| Merge PDF | `frontend/components/tools/merge-pdf-tool.tsx` | added files, success, error, file removed, reorder hint |

## Localisation

All notification strings are routed through `next-intl` translations (`useTranslations(...)`), e.g. `toast.success(t("split_success"))` and the shared `tool_pages` namespace for common strings like `tp("file_removed")`. This means notifications are fully translatable rather than hard-coded English.

## Centralised API error handling

API-layer failures are funnelled through `handleApiError` (from `@/lib/api-client`), which in turn raises a `toast.error`. This gives a single, consistent error-notification path for all network/processing failures, separate from inline validation toasts raised directly in components.

## Relationship to loading feedback

Notifications (transient toasts) complement the **in-button loading feedback** documented in `LOADING_EXPERIENCE_REPORT.md`:
- **During** processing → branded `ButtonLoader` inside the disabled action button.
- **On completion / failure** → a Sonner `toast.success` / `toast.error`.

Together they give the user continuous feedback: visible progress while working, and a clear outcome message when done.
