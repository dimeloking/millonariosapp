'use client';

import { usePathname } from 'next/navigation';

// Renders nothing. Reading the pathname suspends only while a route's params are
// unresolved (the fallback-shell prerender of a catch-all route) and resolves
// immediately for concrete prerenders. Wrapped in <Suspense> it marks the shell
// as intentionally URL-dependent so the root metadata can stream for it.
export function UrlDataMarker(): null {
  usePathname();
  return null;
}
