import { browser } from 'wxt/browser';

/**
 * Response shape returned by the background-script fetch proxy.
 */
export interface BgFetchResponse<T = unknown> {
  ok: boolean;
  status: number;
  body: T | null;
}

/**
 * Proxies a GET request through the extension's background script.
 *
 * This avoids performing `fetch()` in the content script context, which would
 * cause network errors (e.g. 403) to appear in the page's DevTools console.
 * The Chrome Web Store review team flagged these visible console errors as a
 * reason for rejection.
 *
 * Usage:
 * ```ts
 * const result = await bgFetch<MyType>('https://genius.com/api/...');
 * if (result.ok && result.body) { ... }
 * ```
 */
export async function bgFetch<T = unknown>(url: string): Promise<BgFetchResponse<T>> {
  try {
    const response = await browser.runtime.sendMessage({ type: 'GFT_FETCH', url });
    return (response as BgFetchResponse<T>) ?? { ok: false, status: 0, body: null };
  } catch {
    return { ok: false, status: 0, body: null };
  }
}
