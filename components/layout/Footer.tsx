import Link from 'next/link';
import { Github, ExternalLink, Heart, Mail, User, Home, Cloud, Map } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-800/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                <Cloud className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl text-white">
                VremenskaPrognoza
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Moderna platforma za praćenje vremenskih uslova i kvaliteta vazduha na Balkanu.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigacija</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Početna
                </Link>
              </li>
              <li>
                <Link href="/prognoza" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Prognoza
                </Link>
              </li>
              <li>
                <Link href="/kvalitet-vazduha" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Kvalitet Vazduha
                </Link>
              </li>
              <li>
                <Link href="/mapa" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Mapa
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informacije</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/statistika" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Statistika
                </Link>
              </li>
              <li>
                <Link href="/o-autoru" className="text-slate-400 hover:text-white transition-colors text-sm">
                  O Autoru
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Povežite se</h4>
            <div className="space-y-3">
              <Link
                href="https://github.com/zoxknez"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Link>
              <Link
                href="https://mojportfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Portfolio
              </Link>
              <Link
                href="https://github.com/zoxknez/vremenskaprognoza"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                <Github className="h-4 w-4" />
                Izvorni kod
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} VremenskaPrognoza. Sva prava zadržana.
            </p>
            <p className="flex items-center gap-1 text-slate-500 text-sm">
              Napravljeno sa <Heart className="h-4 w-4 text-red-500 fill-red-500" /> od
              <Link
                href="https://mojportfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 transition-colors ml-1 font-medium"
              >
                zoxknez
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

