"use client";

/**
 * useUploadLimit — fetches the current user's tier-based upload limit
 * from the backend (/api/limits) and caches it.
 *
 * Backend resolves the limit from the optional Authorization header:
 *   - Pro user → PRO_MAX_UPLOAD_SIZE (default 100 MB)
 *   - Free / anonymous → FREE_MAX_UPLOAD_SIZE (default 25 MB)
 *
 * Falls back to a sensible client-side default if the API is unreachable
 * (so file upload UIs don't break entirely on a network blip).
 */
import { useEffect, useState, useCallback } from "react";

export interface UploadLimit {
  maxBytes: number;
  maxMb: number;
  freeTierMb: number;
  proTierMb: number;
  tier: "free" | "pro";
  loaded: boolean;
}

const FALLBACK: UploadLimit = {
  maxBytes: 25 * 1024 * 1024,
  maxMb: 25,
  freeTierMb: 25,
  proTierMb: 100,
  tier: "free",
  loaded: false,
};

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  // Match whatever your auth-context uses — adjust if your storage key differs.
  return (
    localStorage.getItem("welovepdf_access_token") ||
    localStorage.getItem("access_token") ||
    null
  );
}

export function useUploadLimit(): UploadLimit {
  const [limit, setLimit] = useState<UploadLimit>(FALLBACK);

  const fetchLimit = useCallback(async () => {
    try {
      const token = readAuthToken();
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/limits", { headers });
      if (!res.ok) return;
      const data = await res.json();
      setLimit({
        maxBytes: data.max_upload_bytes,
        maxMb: data.max_upload_mb,
        freeTierMb: data.free_tier_mb,
        proTierMb: data.pro_tier_mb,
        tier: data.tier,
        loaded: true,
      });
    } catch {
      // Keep fallback. The backend middleware is the authoritative gate
      // anyway; client-side limit is purely a UX nicety.
    }
  }, []);

  useEffect(() => {
    fetchLimit();
  }, [fetchLimit]);

  return limit;
}
