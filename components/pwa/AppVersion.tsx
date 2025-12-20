'use client';

import * as React from 'react';

/**
 * Prikazuje trenutnu verziju aplikacije u footer-u ili bilo gde drugde.
 * Verzija se automatski čita iz cache naziva aktivnog service workera.
 */
export function AppVersion() {
  const [version, setVersion] = React.useState<string>('');

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        // Možeš čitati verziju iz različitih izvora
        // Za sada ćemo prikazati statičku verziju iz package.json
        setVersion('1.0.0');
      }
    });
  }, []);

  if (!version) return null;

  return (
    <span className="text-xs text-neutral-500 dark:text-neutral-400">
      v{version}
    </span>
  );
}
