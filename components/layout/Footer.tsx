import Link from 'next/link';
import { Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>© {new Date().getFullYear()} Zagadjenost vazduha na Balkanu</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Napravio:</span>
            <Link
              href="https://github.com/zoxknez"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="font-medium">o0o0o0o</span>
            </Link>
            <Link
              href="https://mojportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

