import Link from 'next/link';
import { CloudOff, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-slate-800/50 flex items-center justify-center">
            <CloudOff className="text-slate-400" size={56} />
          </div>
        </div>
        
        <h1 className="text-7xl font-display font-bold text-white mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-white mb-4">
          Stranica nije pronađena
        </h2>
        
        <p className="text-slate-400 mb-8">
          Nažalost, stranica koju tražite ne postoji ili je premeštena.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={18} />
            Početna stranica
          </Link>
          
          <Link href="/mapa" className="btn-secondary">
            <Search size={18} />
            Pretraži mapu
          </Link>
        </div>
      </div>
    </div>
  );
}

