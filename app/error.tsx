'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-2xl font-bold mb-2">Nešto je pošlo po zlu</h2>
      <p className="text-muted-foreground mb-4">
        {error.message || 'Došlo je do greške'}
      </p>
      <Button onClick={reset}>Pokušaj ponovo</Button>
    </div>
  );
}

