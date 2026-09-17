/**
 * Google Analytics 4 (GA4) helper for FujiFinder
 * Measurement ID: G-3934NW3CVC
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-3934NW3CVC';

/**
 * Log virtual pageview for Single Page Application navigation
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
}

/**
 * Log custom interaction events to Google Analytics
 */
export function trackEvent(action: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
}
