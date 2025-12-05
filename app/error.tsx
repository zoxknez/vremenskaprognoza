'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-6">
          <AlertTriangle className="text-red-500" size={40} />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-white mb-4">
          Ups! Nešto je pošlo po zlu
        </h1>
        
        <p className="text-slate-400 mb-8">
          {error.message || 'Došlo je do neočekivane greške. Molimo pokušajte ponovo.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary"
          >
            <RefreshCw size={18} />
            Pokušaj ponovo
          </button>
          
          <Link href="/" className="btn-secondary">
            <Home size={18} />
            Početna stranica
          </Link>
        </div>
      </div>
    </div>
  );
}

