/**
 * Shared fetch wrapper with error handling and retry logic.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class FetchError extends Error {
  status: number;
  statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.statusText = statusText;
  }
}

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

/** JSON fetcher for SWR and general use. */
export async function jsonFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new FetchError(`HTTP ${res.status}`, res.status, res.statusText);
  }
  return res.json();
}

/** Fetch with retry and timeout support. */
export async function fetchWithRetry<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { retries = 2, retryDelay = 1000, timeout = 10000, ...fetchOpts } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        ...fetchOpts,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new FetchError(`HTTP ${res.status}`, res.status, res.statusText);
      }

      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  throw new Error('Unreachable');
}

/** Build a URL with query parameters. */
export function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(path, API_BASE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}
