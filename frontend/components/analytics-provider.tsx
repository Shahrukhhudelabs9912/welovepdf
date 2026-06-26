"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Mock analytics provider for tracking page views and events
 * In a real implementation, this would integrate with Google Analytics, Mixpanel, etc.
 */

// Verbose analytics/web-vitals logging is debug-only. It's OFF by default so
// content-heavy pages (e.g. the blog) don't flood the console — the CLS/LCP
// PerformanceObservers below fire on every layout shift, which previously
// spammed the console hard enough to jank the main thread. Set
// NEXT_PUBLIC_DEBUG_ANALYTICS=true to re-enable.
const DEBUG_ANALYTICS = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS === "true";
const debugLog = (...args: unknown[]) => {
  if (DEBUG_ANALYTICS) console.log(...args);
};
const debugWarn = (...args: unknown[]) => {
  if (DEBUG_ANALYTICS) console.warn(...args);
};
export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view
    const trackPageView = () => {
      // Mock analytics - in real implementation, send to analytics service
      debugLog(`[Analytics] Page view: ${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`);
      
      // Simulate sending to analytics service
      if (typeof window !== "undefined") {
        // Mock Google Analytics
        const mockGA = (window as any).ga;
        if (mockGA) {
          mockGA("send", "pageview", pathname);
        }

        // Track custom event for PDF tools usage
        if (pathname.includes("/merge-pdf") || pathname.includes("/split-pdf") || 
            pathname.includes("/compress-pdf") || pathname.includes("/ai-tools")) {
          trackEvent("tool_visited", { tool: pathname.split("/").pop() });
        }
      }
    };

    trackPageView();
  }, [pathname, searchParams]);

  /**
   * Track custom event
   */
  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    debugLog(`[Analytics] Event: ${eventName}`, eventParams);
    
    // In real implementation:
    // - Send to Google Analytics via gtag
    // - Send to Mixpanel
    // - Send to custom analytics backend
  };

  /**
   * Track file upload event
   */
  const trackFileUpload = (fileCount: number, totalSize: number, tool: string) => {
    trackEvent("file_upload", {
      file_count: fileCount,
      total_size: totalSize,
      tool,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Track processing completion
   */
  const trackProcessingComplete = (tool: string, processingTime: number, success: boolean) => {
    trackEvent("processing_complete", {
      tool,
      processing_time: processingTime,
      success,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Track download event
   */
  const trackDownload = (tool: string, fileSize: number) => {
    trackEvent("file_download", {
      tool,
      file_size: fileSize,
      timestamp: new Date().toISOString(),
    });
  };

  // Export functions for use in other components
  return {
    trackEvent,
    trackFileUpload,
    trackProcessingComplete,
    trackDownload,
  };
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  private static measures: Map<string, number> = new Map();

  /**
   * Mark the start of an operation
   */
  static markStart(operation: string) {
    if (typeof window !== "undefined" && window.performance) {
      window.performance.mark(`${operation}_start`);
    }
    this.marks.set(operation, Date.now());
  }

  /**
   * Mark the end of an operation and measure duration
   */
  static markEnd(operation: string): number {
    const startTime = this.marks.get(operation);
    if (!startTime) return 0;

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (typeof window !== "undefined" && window.performance) {
      window.performance.mark(`${operation}_end`);
      window.performance.measure(operation, `${operation}_start`, `${operation}_end`);
    }

    this.measures.set(operation, duration);
    
    // Log performance data
    debugLog(`[Performance] ${operation}: ${duration}ms`);

    // Track slow operations
    if (duration > 1000) {
      debugWarn(`[Performance Warning] ${operation} took ${duration}ms`);
    }

    return duration;
  }

  /**
   * Get performance measure for an operation
   */
  static getMeasure(operation: string): number | undefined {
    return this.measures.get(operation);
  }

  /**
   * Clear all performance marks and measures
   */
  static clear() {
    this.marks.clear();
    this.measures.clear();
    if (typeof window !== "undefined" && window.performance) {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }
  }
}

/**
 * Web Vitals monitoring (Core Web Vitals)
 */
export function monitorWebVitals() {
  // These PerformanceObservers fire on every layout shift / paint and only
  // console.log in this mock implementation. Running them unconditionally
  // floods the console on content-heavy pages and steals main-thread time,
  // which made the blog page unresponsive. Only run when explicitly debugging.
  if (!DEBUG_ANALYTICS) return;

  if (typeof window !== "undefined") {
    // Mock web vitals monitoring
    // In real implementation, use web-vitals library
    const observeLCP = () => {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        debugLog(`[Web Vitals] LCP: ${lastEntry?.startTime || 0}`);
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    };

    const observeFID = () => {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          if (fidEntry.processingStart) {
            debugLog(`[Web Vitals] FID: ${fidEntry.processingStart - fidEntry.startTime}`);
          }
        });
      });
      observer.observe({ type: "first-input", buffered: true });
    };

    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            debugLog(`[Web Vitals] CLS: ${clsValue}`);
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
    };

    // Start observing
    observeLCP();
    observeFID();
    observeCLS();
  }
}

/**
 * Component that initializes analytics and performance monitoring
 */
export function AnalyticsInitializer() {
  useEffect(() => {
    // Initialize performance monitoring
    monitorWebVitals();

    // Mock Google Analytics initialization
    if (typeof window !== "undefined") {
      // Create mock ga function
      (window as any).ga = (window as any).ga || function() {
        ((window as any).ga.q = (window as any).ga.q || []).push(arguments);
      };
      (window as any).ga.l = +new Date();
      (window as any).ga("create", "UA-XXXXX-Y", "auto");
      (window as any).ga("send", "pageview");

      // Track initial page load performance
      const navigationTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        debugLog(`[Performance] Page load: ${navigationTiming.loadEventEnd - navigationTiming.startTime}ms`);
        debugLog(`[Performance] DOM Content Loaded: ${navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime}ms`);
      }
    }

    // Cleanup
    return () => {
      PerformanceMonitor.clear();
    };
  }, []);

  return null; // This component doesn't render anything
}