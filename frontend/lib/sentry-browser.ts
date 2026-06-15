/**
 * Sentry browser-side initialization.
 *
 * Activates only when NEXT_PUBLIC_SENTRY_DSN is configured — otherwise this
 * module is a no-op so feature work is never blocked. Imported once from
 * `app/layout.tsx` via the `useEffect` hook in components/sentry-init.tsx.
 *
 * Free tier supports 5k errors/month and is sufficient for early launch.
 */
"use client";

import * as Sentry from "@sentry/nextjs";

let initialized = false;

export function initSentryBrowser(): void {
  if (initialized) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // Disabled — keeps dev / unconfigured deploys silent
    return;
  }
  try {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 0.1,
      // Don't send PII by default — GDPR-friendly
      sendDefaultPii: false,
      // Filter out browser-extension / third-party noise
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "Non-Error promise rejection captured",
      ],
    });
    initialized = true;
  } catch {
    // Init failures must never break the app shell
  }
}
