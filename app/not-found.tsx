import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-2xl font-bold mb-2">Stranica nije pronađena</h2>
      <p className="text-muted-foreground mb-4">
        Tražena stranica ne postoji.
      </p>
      <Link href="/dashboard">
        <Button>Nazad na početnu</Button>
      </Link>
    </div>
  );
}

