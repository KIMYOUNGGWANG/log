import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  // We need to carefully exclude API routes, _next, and public files.
  // Wait, if we use this matcher, it forces all non-excluded routes to have a locale.
  // We should only match the specific routes we want to internationalize to avoid breaking existing pages that are NOT inside [locale] yet.
  matcher: ['/', '/(ko|ja)/:path*']
};
