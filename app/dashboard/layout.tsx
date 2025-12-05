import { ReactNode } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Footer } from '@/components/layout/Footer';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold">Zagadjenost vazduha na Balkanu</h1>
              <p className="text-sm text-muted-foreground">
                Praćenje kvaliteta vazduha u realnom vremenu
              </p>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 flex-1">{children}</main>
      <Footer />
    </div>
  );
}

