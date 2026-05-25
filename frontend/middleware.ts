import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'hi'];
const defaultLocale = 'en';

/**
 * Extract the preferred locale from cookies, Accept-Language header,
 * falling back to the default locale.
 */
function detectLocale(request: NextRequest): string {
  // 1. Check cookie first (explicit user choice)
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(',')
      .map(lang => {
        const [code] = lang.trim().split(';');
        return code.split('-')[0]; // 'hi-IN' → 'hi'
      })
      .find(code => locales.includes(code));
    if (preferred) return preferred;
  }

  // 3. Fallback to default
  return defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js paths, API routes, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if the path starts with a locale prefix
  const pathLocale = pathname.split('/')[1];

  if (locales.includes(pathLocale)) {
    // The URL has a locale prefix (e.g., /hi/merge-pdf)
    const locale = pathLocale;

    if (locale === defaultLocale) {
      // Default locale prefix: redirect to unprefixed version
      // e.g., /en/merge-pdf → /merge-pdf
      const newPathname = pathname.replace(/^\/en/, '') || '/';
      const newUrl = new URL(newPathname, request.url);
      newUrl.search = request.nextUrl.search;
      const response = NextResponse.redirect(newUrl);
      response.cookies.set('NEXT_LOCALE', 'en', {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      });
      return response;
    }

    // Non-default locale prefix: strip locale, rewrite internally
    // e.g., /hi/merge-pdf → internally rewrites to /merge-pdf with NEXT_LOCALE=hi cookie
    const newPathname = pathname.replace(/^\/hi/, '') || '/';
    const newUrl = new URL(newPathname, request.url);
    newUrl.search = request.nextUrl.search;
    const response = NextResponse.rewrite(newUrl);
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
    return response;
  }

  // No locale prefix: detect locale from cookie/header
  const locale = detectLocale(request);

  if (locale !== defaultLocale) {
    // Non-default locale without prefix: redirect to prefixed version
    // e.g., /merge-pdf (with hi cookie) → /hi/merge-pdf
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    newUrl.search = request.nextUrl.search;
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
    return response;
  }

  // Default locale, no prefix: just set cookie and pass through
  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', 'en', {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|public|favicon\\.ico|.*\\..*).*)'],
};