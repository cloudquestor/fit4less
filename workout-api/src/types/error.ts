// src/types/error.ts
export interface ApiError {
    error: string;
    status?: number;
    details?: unknown;
  }