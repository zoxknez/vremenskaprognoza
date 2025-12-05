'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-gray-800/50 rounded-full">
            <WifiOff className="w-16 h-16 text-gray-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Niste povezani
        </h1>
        
        <p className="text-gray-400 mb-8">
          Izgleda da nemate internet konekciju. Proverite svoju mrežu i pokušajte ponovo.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Pokušaj ponovo
        </button>
        
        <div className="mt-12 p-4 bg-gray-800/30 rounded-lg">
          <h2 className="text-sm font-medium text-gray-300 mb-2">
            Dok ste offline:
          </h2>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Keširani podaci su možda dostupni</li>
            <li>• Prethodno posećene stranice mogu raditi</li>
            <li>• Novi podaci će se učitati kad se povežete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
