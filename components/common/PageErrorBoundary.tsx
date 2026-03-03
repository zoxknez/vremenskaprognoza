"use client";

import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

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

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`[${this.props.pageName || "Page"}] Error Boundary caught:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-full border border-red-400/40 bg-red-500/15 p-4">
              <AlertTriangle className="h-12 w-12 text-red-300" />
            </div>
          </div>

          <h2 className="mb-3 text-center text-2xl font-bold text-white">Greska na stranici</h2>
          <p className="mb-6 text-center text-slate-300">
            {this.props.pageName
              ? `Stranica "${this.props.pageName}" je naisla na problem.`
              : "Doslo je do greske pri ucitavanju sadrzaja."}
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
              <p className="break-all font-mono text-xs text-red-200">{this.state.error.message}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            >
              <RefreshCw className="h-5 w-5" />
              Pokusaj ponovo
            </button>

            <a
              href="/"
              className="w-full rounded-xl border border-slate-700/70 bg-slate-800/70 px-6 py-3 text-center font-semibold text-slate-200 transition-all hover:border-slate-500 hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              Nazad na pocetnu
            </a>
          </div>
        </motion.div>
      </div>
    );
  }
}
