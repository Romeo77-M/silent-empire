// services/analyticsService.ts

// Make gtag available globally
declare global {
  interface Window {
    gtag: (
      command: 'event',
      eventName: string,
      eventParams?: { [key: string]: any }
    ) => void;
  }
}

/**
 * Sends a custom event to Google Analytics.
 * @param {string} action - The name of the event (e.g., 'analyze_ticker').
 * @param {object} [params] - Optional parameters to send with the event.
 */
export const trackEvent = (action: string, params?: { [key: string]: any }): void => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  } else {
    console.log(`Analytics event (not sent): ${action}`, params);
  }
};
