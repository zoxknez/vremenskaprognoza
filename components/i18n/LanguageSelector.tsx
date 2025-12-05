'use client';

import { useI18n } from '@/lib/i18n/context';
import { Locale, SUPPORTED_LOCALES } from '@/lib/i18n/translations';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { locale, setLocale, supportedLocales } = useI18n();
  const currentLocale = supportedLocales[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLocale.flag} {currentLocale.nativeName}</span>
          <span className="sm:hidden">{currentLocale.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(supportedLocales) as [Locale, typeof currentLocale][]).map(
          ([code, info]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLocale(code)}
              className={locale === code ? 'bg-accent' : ''}
            >
              <span className="mr-2">{info.flag}</span>
              <span>{info.nativeName}</span>
              <span className="ml-auto text-muted-foreground text-xs">
                {info.name}
              </span>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Jednostavan inline dropdown bez shadcn komponenti
export function SimpleLanguageSelector() {
  const { locale, setLocale, supportedLocales } = useI18n();
  
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="bg-background border rounded-md px-2 py-1 text-sm"
    >
      {(Object.entries(supportedLocales) as [Locale, { flag: string; nativeName: string }][]).map(
        ([code, info]) => (
          <option key={code} value={code}>
            {info.flag} {info.nativeName}
          </option>
        )
      )}
    </select>
  );
}
