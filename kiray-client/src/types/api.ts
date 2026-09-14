export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  error?: string;
  message?: string;
  details?: string[];
}

export interface ApiError {
  status: number;
  message: string;
  details?: string[];
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  meta: PaginatedMeta;
}
