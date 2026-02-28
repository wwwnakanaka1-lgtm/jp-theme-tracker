/**
 * Client-side analytics helpers.
 * Provides a lightweight event tracking abstraction that can be wired
 * to any analytics provider (GA4, Plausible, PostHog, etc.).
 */

export interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
}

type EventHandler = (event: AnalyticsEvent) => void;

const handlers: EventHandler[] = [];
const eventQueue: AnalyticsEvent[] = [];
const MAX_QUEUE_SIZE = 100;

/** Register an event handler (e.g., to forward to GA4). */
export function registerHandler(handler: EventHandler): () => void {
  handlers.push(handler);
  return () => {
    const index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  };
}

/** Track an analytics event. Queues events and dispatches to all handlers. */
export function trackEvent(
  name: string,
  category: string,
  properties?: Record<string, string | number | boolean>,
): void {
  const event: AnalyticsEvent = {
    name,
    category,
    properties,
    timestamp: Date.now(),
  };

  eventQueue.push(event);
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    eventQueue.shift();
  }

  handlers.forEach((handler) => {
    try {
      handler(event);
    } catch (err) {
      console.warn('Analytics handler error:', err);
    }
  });
}

/** Pre-built event trackers for common actions. */
export const track = {
  pageView: (path: string) =>
    trackEvent('page_view', 'navigation', { path }),

  themeView: (themeId: string, themeName: string) =>
    trackEvent('theme_view', 'engagement', { themeId, themeName }),

  stockView: (stockCode: string, stockName: string) =>
    trackEvent('stock_view', 'engagement', { stockCode, stockName }),

  periodChange: (period: string) =>
    trackEvent('period_change', 'interaction', { period }),

  search: (query: string, resultCount: number) =>
    trackEvent('search', 'interaction', { query, resultCount }),

  watchlistAdd: (stockCode: string) =>
    trackEvent('watchlist_add', 'engagement', { stockCode }),

  watchlistRemove: (stockCode: string) =>
    trackEvent('watchlist_remove', 'engagement', { stockCode }),

  exportData: (format: string, itemCount: number) =>
    trackEvent('export_data', 'interaction', { format, itemCount }),
};

/** Return the recent event queue (useful for debugging). */
export function getEventQueue(): ReadonlyArray<AnalyticsEvent> {
  return [...eventQueue];
}

/** Clear the event queue. */
export function clearEventQueue(): void {
  eventQueue.length = 0;
}
