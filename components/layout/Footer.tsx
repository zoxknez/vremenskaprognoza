import Link from 'next/link';
import { Github, ExternalLink, Cloud, Heart, MapPin, BarChart3, Wind, Mail } from 'lucide-react';

const footerLinks = {
  main: [
    { href: '/', label: 'Početna' },
    { href: '/prognoza', label: 'Prognoza' },
    { href: '/kvalitet-vazduha', label: 'Kvalitet vazduha' },
    { href: '/mapa', label: 'Mapa' },
  ],
  info: [
    { href: '/statistika', label: 'Statistika' },
    { href: '/o-autoru', label: 'O autoru' },
    { href: '/kontakt', label: 'Kontakt' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-800/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                <Cloud className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl text-white">
                VremeVazduh
              </span>
            </Link>
            <p className="text-slate-400 text-sm max-w-md mb-4">
              Pratite vremensku prognozu, kvalitet vazduha i UV indeks u realnom vremenu za gradove na Balkanu i širom sveta.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/zoxknez"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://mojportfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Portfolio"
              >
                <ExternalLink className="h-5 w-5" />
              </Link>
              <Link
                href="/kontakt"
                className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Kontakt"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navigacija</h4>
            <ul className="space-y-2">
              {footerLinks.main.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Informacije</h4>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Features Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-slate-800/50 mb-6">
          {[
            { icon: Cloud, label: 'Vremenska prognoza', desc: 'Precizni podaci' },
            { icon: Wind, label: 'Kvalitet vazduha', desc: 'AQI u realnom vremenu' },
            { icon: MapPin, label: 'Interaktivna mapa', desc: 'Balkanski gradovi' },
            { icon: BarChart3, label: 'Statistika', desc: 'Istorijski podaci' },
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800/50">
                <feature.icon className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{feature.label}</p>
                <p className="text-xs text-slate-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} VremeVazduh. Sva prava zadržana.
          </p>
          
          <p className="flex items-center gap-2 text-slate-500 text-sm">
            Napravljeno sa
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            od strane
            <Link
              href="https://mojportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              o0o0o0o
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

