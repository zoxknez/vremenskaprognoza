'use client';

import * as React from 'react';

/**
 * Prikazuje trenutnu verziju aplikacije.
 * Verzija se trenutno cita iz lokalne konstante dok ne uvedemo build metadata.
 */
export function AppVersion() {
  const [version, setVersion] = React.useState<string>('');

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        setVersion('1.0.0');
      }
    });
  }, []);

  if (!version) {
    return null;
  }

  return <span className="text-xs text-slate-500">{`v${version}`}</span>;
}
