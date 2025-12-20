import { logger } from '@/lib/utils/logger';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public source?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Error response type
 */
export interface ErrorResponse {
  error: string;
  statusCode: number;
  source?: string;
  timestamp: string;
}

/**
 * Unified API error handler
 * Koristi u catch blokovima za konzistentan error handling
 */
export function handleAPIError(error: unknown, source?: string): APIError {
  // Ako je već APIError, vrati ga
  if (error instanceof APIError) {
    return error;
  }

  // Ako je Error objekat
  if (error instanceof Error) {
    logger.error(`[${source || 'API'}] Error:`, error.message);
    return new APIError(error.message, 500, source, error);
  }

  // Ako je fetch error sa statusom
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const fetchError = error as { status: number; statusText?: string };
    const message = fetchError.statusText || 'Request failed';
    logger.error(`[${source || 'API'}] HTTP ${fetchError.status}:`, message);
    return new APIError(message, fetchError.status, source, error);
  }

  // Generic error
  const message = String(error);
  logger.error(`[${source || 'API'}] Unknown error:`, message);
  return new APIError(message, 500, source, error);
}

/**
 * Create error response object
 */
export function createErrorResponse(error: APIError | Error | unknown, source?: string): ErrorResponse {
  if (error instanceof APIError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      source: error.source || source,
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
      source,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    error: String(error),
    statusCode: 500,
    source,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Wrapper funkcija za API requests sa error handling
 * 
 * @example
 * const data = await handleAPIRequest(
 *   async () => {
 *     const res = await fetch('https://api.example.com/data');
 *     if (!res.ok) throw new Error('Failed to fetch');
 *     return res.json();
 *   },
 *   'ExampleAPI'
 * );
 */
export async function handleAPIRequest<T>(
  request: () => Promise<T>,
  source: string
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    throw handleAPIError(error, source);
  }
}

/**
 * Retry logic za API requests
 */
export async function retryAPIRequest<T>(
  request: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    source?: string;
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, source = 'API' } = options;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        logger.warn(`[${source}] Attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }
  
  throw handleAPIError(lastError, source);
}

/**
 * Check da li je network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    );
  }
  return false;
}

/**
 * Check da li je timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('timeout') ||
      error.message.includes('timed out') ||
      error.name === 'AbortError'
    );
  }
  return false;
}
