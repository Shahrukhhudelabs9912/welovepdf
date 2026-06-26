/**
 * Sentry browser-side initialization — currently a no-op.
 *
 * Why no SDK import here:
 *   `@sentry/nextjs` is designed to be wired in via `withSentryConfig` in
 *   next.config.js. Importing it directly from a client component pulls in
 *   server-side OpenTelemetry instrumentation that breaks the browser bundle
 *   ("Cannot read properties of undefined (reading 'call')" at hydration).
 *
 *   Until we set a real DSN, we keep this file SDK-free so it can't damage
 *   the build. When ready to enable error tracking:
 *
 *   1. `npm install @sentry/react`
 *   2. Replace this stub with `import * as Sentry from "@sentry/react"`
 *      and a real Sentry.init({ dsn, ... }) call.
 *   3. Set NEXT_PUBLIC_SENTRY_DSN in .env.local / Vercel env vars.
 *
 *   For server-side error tracking, follow Sentry's Next.js wizard which
 *   sets up `withSentryConfig` properly — that's a separate concern.
 */
"use client";

let initialized = false;

export function initSentryBrowser(): void {
  if (initialized) return;
  initialized = true;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  // DSN configured but SDK not wired up — flag it loudly in dev so we don't
  // ship a "Sentry-enabled" build that silently captures nothing.
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[sentry] NEXT_PUBLIC_SENTRY_DSN is set but the SDK is not wired up. " +
        "Install @sentry/react and update lib/sentry-browser.ts to enable.",
    );
  }
}
