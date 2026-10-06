/**
 * Safe local storage utility with QuotaExceededError protection
 * Handles iframe restrictions, quota limits, and private browsing modes gracefully.
 */

export function safeGetItem<T = any>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSetItem(key: string, value: any): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err: any) {
    // Check if it is a QuotaExceededError
    const isQuota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;

    if (isQuota) {
      console.warn(`[Storage] LocalStorage quota exceeded for key "${key}". Attempting cleanup of non-critical caches...`);
      try {
        // Remove less critical temporary keys to free up space
        const cleanupKeys = ['fujifinder_articles', 'fujifinder_cameras', 'FujiFinder_subscribers'];
        for (const k of cleanupKeys) {
          if (k !== key) {
            window.localStorage.removeItem(k);
          }
        }
        // Retry writing the essential key
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        window.localStorage.setItem(key, serialized);
        return true;
      } catch (retryErr) {
        console.warn(`[Storage] Failed to save key "${key}" even after cleanup. Skipping local cache.`, retryErr);
        return false;
      }
    }

    console.warn(`[Storage] Could not set localStorage key "${key}":`, err);
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] Could not remove localStorage key "${key}":`, err);
  }
}
