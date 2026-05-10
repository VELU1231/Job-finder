import { NextResponse } from "next/server";

export function jsonSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, { status: init?.status ?? 200, headers: init?.headers });
}

export function jsonError(message: string, status = 500, headers?: HeadersInit) {
  return NextResponse.json({ success: false, error: message }, { status, headers });
}

export function clampLimit(value: string | null, fallback = 20, max = 100) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, max);
}

export function parseOffset(value: string | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
}

export function csv(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function cacheHeaders(maxAgeSeconds = 60) {
  return {
    "Cache-Control": `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 4}`,
    "X-RateLimit-Limit": "60",
    "X-RateLimit-Remaining": "59"
  };
}
