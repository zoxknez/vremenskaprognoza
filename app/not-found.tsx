import Link from 'next/link';
import { CloudOff, Home, Search, Map, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Animated 404 Icon */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-cyan-500/20 animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
            <CloudOff className="text-slate-400" size={64} />
          </div>
          {/* Floating particles */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-cyan-500/50 animate-bounce" style={{ animationDelay: '200ms' }} />
          <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-purple-500/50 animate-bounce" style={{ animationDelay: '400ms' }} />
        </div>
        
        <h1 className="text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-white mb-4">
          Stranica nije pronađena
        </h2>
        
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Nažalost, stranica koju tražite ne postoji ili je premeštena. 
          Možda ste pogrešno uneli adresu?
        </p>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/25"
          >
            <Home size={18} />
            Početna stranica
          </Link>
          
          <Link 
            href="/mapa" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            <Map size={18} />
            Pretraži mapu
          </Link>
        </div>

        {/* Suggested Pages */}
        <div className="pt-6 border-t border-slate-800">
          <p className="text-slate-500 text-sm mb-4">Možda tražite:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { href: '/prognoza', label: 'Prognoza' },
              { href: '/kvalitet-vazduha', label: 'Kvalitet vazduha' },
              { href: '/statistika', label: 'Statistika' },
              { href: '/kontakt', label: 'Kontakt' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

