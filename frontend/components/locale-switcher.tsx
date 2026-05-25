'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Build target URL with proper locale prefixing
    // localePrefix: 'as-needed' → default locale (en) has no prefix, others get /{locale}/
    const targetUrl = newLocale === 'en'
      ? pathname
      : `/${newLocale}${pathname}`;
    // Set cookie BEFORE hard navigation so server middleware picks it up
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    // Hard navigation ensures full SSR with correct locale messages
    window.location.href = targetUrl;
  };

  const locales = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => handleLocaleChange(item.code)}
            className={locale === item.code ? 'bg-accent' : ''}
          >
            <span className="flex items-center gap-2">
              <span className="text-sm">{item.flag}</span>
              {item.label}
              {locale === item.code && (
                <span className="ml-2 text-xs text-blue-600">✓</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}