"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      richColors
      expand={false}
      visibleToasts={3}
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          title: "group-[.toast]:text-foreground font-medium",
          success: "group-[.toaster]:[&>[data-icon]]:text-green-500",
          error: "group-[.toaster]:[&>[data-icon]]:text-red-500",
          warning: "group-[.toaster]:[&>[data-icon]]:text-amber-500",
        },
      }}
    />
  );
}

/**
 * Standardized toast helpers for consistent UX across the app
 */
export const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, { description }),
  error: (message: string, description?: string) =>
    toast.error(message, { description }),
  warning: (message: string, description?: string) =>
    toast.warning(message, { description }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  promise: (promise: Promise<any>, messages: { loading: string; success: string; error: string }) =>
    toast.promise(promise, messages),
  loading: (message: string) => toast.loading(message),
};