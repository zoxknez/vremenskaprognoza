import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <h2 className="text-2xl font-bold mb-2">Lokacija nije pronađena</h2>
      <p className="text-muted-foreground mb-4">
        Tražena lokacija ne postoji ili je uklonjena.
      </p>
      <Link href="/dashboard">
        <Button>Nazad na dashboard</Button>
      </Link>
    </div>
  );
}

