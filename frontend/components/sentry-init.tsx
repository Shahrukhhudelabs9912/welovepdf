"use client";

/**
 * Mounts the Sentry browser client once at app startup.
 *
 * This component is a thin wrapper around `initSentryBrowser()` that runs
 * inside a `useEffect` so it doesn't interfere with SSR. Import in
 * `app/layout.tsx` to activate.
 */
import { useEffect } from "react";

import { initSentryBrowser } from "@/lib/sentry-browser";

export function SentryInit() {
  useEffect(() => {
    initSentryBrowser();
  }, []);
  return null;
}
