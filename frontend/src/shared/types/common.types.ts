export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message?: string;
    details?: any;
  };
}

export interface PaginatedResult<T> {
  success: boolean;
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
