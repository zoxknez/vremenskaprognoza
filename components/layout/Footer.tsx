import Link from 'next/link';
import { Github, ExternalLink, Heart, Cloud } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-800/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <Cloud className="text-white" size={16} />
            </div>
            <span className="font-bold text-lg text-white">
              VremenskaPrognoza
            </span>
          </Link>

          {/* Author */}
          <p className="flex items-center gap-2 text-slate-400 text-sm">
            Napravio sa <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <Link
              href="https://mojportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 transition-colors font-semibold"
            >
              o0o0o0o
            </Link>
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/zoxknez"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
              title="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="https://mojportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
              title="Portfolio"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} VremenskaPrognoza. Sva prava zadržana.
          </p>
        </div>
      </div>
    </footer>
  );
}

