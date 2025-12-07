'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Bug, MessageSquare } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Animated Error Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          <div className="relative w-full h-full rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={48} />
          </div>
        </div>
        
        <h1 className="text-3xl font-display font-bold text-white mb-4">
          Ups! Nešto je pošlo po zlu
        </h1>
        
        <p className="text-slate-400 mb-4">
          {error.message || 'Došlo je do neočekivane greške. Molimo pokušajte ponovo.'}
        </p>

        {/* Error Details (collapsed) */}
        {error.digest && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-slate-500 text-sm hover:text-slate-400 transition-colors">
              Tehnički detalji
            </summary>
            <pre className="mt-2 p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-xs text-slate-500 overflow-auto">
              Error ID: {error.digest}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
          >
            <RefreshCw size={18} />
            Pokušaj ponovo
          </button>
          
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            <Home size={18} />
            Početna stranica
          </Link>
        </div>

        {/* Help Links */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link 
            href="https://github.com/zoxknez/vremenskaprognoza/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-400 transition-colors"
          >
            <Bug size={16} />
            Prijavite problem
          </Link>
          <Link 
            href="/kontakt"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-400 transition-colors"
          >
            <MessageSquare size={16} />
            Kontaktirajte nas
          </Link>
        </div>
      </div>
    </div>
  );
}

