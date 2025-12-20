"use client";

import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { logger } from "@/lib/utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Page-specific Error Boundary
 * Catch errors within a specific page without crashing entire app
 */
export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`[${this.props.pageName || 'Page'}] Error Boundary caught:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback ako je prosleđen
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-3">
                Greška na stranici
              </h2>

              {/* Message */}
              <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                {this.props.pageName 
                  ? `Stranica "${this.props.pageName}" je naišla na problem.`
                  : "Došlo je do greške pri učitavanju sadržaja."}
              </p>

              {/* Error details (dev only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  Pokušaj ponovo
                </button>

                <a
                  href="/"
                  className="w-full text-center px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all duration-300"
                >
                  Nazad na početnu
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
