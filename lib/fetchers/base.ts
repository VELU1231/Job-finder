import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  retries = 3
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        next: { revalidate: 0 }
      });

      if (response.ok) {
        return response;
      }

      if (response.status < 500 && response.status !== 429) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status} for ${url}`);
    } catch (error) {
      lastError = error;
    }

    const backoffMs = 1000 * 2 ** attempt;
    await delay(backoffMs);
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown fetch error");
}

export async function getFromRedis<T>(key: string): Promise<T | null> {
  if (!redis) {
    return null;
  }

  try {
    const value = await redis.get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function setInRedis<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // cache write failures should not fail sync
  }
}

export interface FetcherResult<T> {
  source: string;
  jobs: T[];
  error?: string;
}
