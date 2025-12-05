"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { I18nProvider } from "@/lib/i18n/context";
import { Toaster } from "@/components/ui/toaster";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vremenska-prognoza-theme">
      <I18nProvider>
        {children}
        <Toaster />
        <PWAInstallPrompt />
      </I18nProvider>
    </ThemeProvider>
  );
}
