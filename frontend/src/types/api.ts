/** API request and response type definitions. */

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    lastUpdated: string | null;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return 'error' in response;
}

/** Pagination request parameters. */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Theme list request parameters. */
export interface ThemeListParams extends PaginationParams {
  period?: string;
  category?: string;
  minReturn?: number;
  maxReturn?: number;
  search?: string;
}

/** Stock search request parameters. */
export interface StockSearchParams extends PaginationParams {
  query?: string;
  themeId?: string;
  marketCapCategory?: string;
  minPrice?: number;
  maxPrice?: number;
}

/** Export request parameters. */
export interface ExportParams {
  format: 'csv' | 'json' | 'xlsx';
  type: 'themes' | 'stocks' | 'watchlist';
  period?: string;
  themeIds?: string[];
  stockCodes?: string[];
}

/** Refresh response. */
export interface RefreshResult {
  status: 'success' | 'error';
  message: string;
  elapsedSeconds: number;
  timestamp: string;
}

/** Health check response. */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: {
    database: boolean;
    cache: boolean;
    externalApi: boolean;
  };
}

/** WebSocket message types. */
export type WsMessageType = 'price_update' | 'alert_triggered' | 'refresh_complete';

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  payload: T;
  timestamp: number;
}
