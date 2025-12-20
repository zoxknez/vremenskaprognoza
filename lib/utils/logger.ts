/**
 * Logger Utility - Development vs Production Logging
 * 
 * U development mode: svi logovi vidljivi u konzoli
 * U production mode: samo error logovi, ostalo isključeno
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Regular log - samo u development
   */
  log(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Info log - samo u development
   */
  info(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Debug log - samo u development
   */
  debug(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Warning log - samo u development
   */
  warn(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * Error log - uvek vidljiv (i u production)
   * Može se integrisati sa error tracking servisom (Sentry)
   */
  error(...args: unknown[]): void {
    console.error(...args);
    
    // TODO: Dodaj Sentry ili drugi error tracking
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(new Error(String(args[0])));
    // }
  }

  /**
   * Group logs - samo u development
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * Group end - samo u development
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Table log - samo u development
   */
  table(data: unknown): void {
    if (this.isDevelopment) {
      console.table(data);
    }
  }

  /**
   * Time tracking - samo u development
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  /**
   * Time tracking end - samo u development
   */
  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for TypeScript
export type { LogLevel };
