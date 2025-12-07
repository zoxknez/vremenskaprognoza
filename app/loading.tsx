import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Weather Icons */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <Cloud className="w-16 h-16 text-primary-500/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
            <Sun className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        
        {/* Loading text with dots animation */}
        <div className="flex items-center gap-2">
          <p className="text-slate-400 text-lg">Učitavanje</p>
          <span className="flex gap-1">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full animate-loading-bar" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

