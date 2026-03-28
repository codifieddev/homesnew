import type { Locale } from "@/lib/i18n/config";
import { isLocale, shouldPrefixLocale } from "@/lib/i18n/config";

const SPECIAL_HREF_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const LOCALE_LIKE_SEGMENT_PATTERN = /^[a-z]{2}(?:-[a-z]{2})?$/i;

function splitHref(href: string) {
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;

  const queryIndex = withoutHash.indexOf("?");
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

  return { pathname, query, hash };
}

export function looksLikeUnsupportedLocale(segment: string): boolean {
  return LOCALE_LIKE_SEGMENT_PATTERN.test(segment) && !isLocale(segment.toLowerCase());
}

export function stripLocaleFromPathname(pathname: string): string {
  if (!pathname.startsWith("/")) return pathname;

  const segments = pathname.split("/");
  const candidate = segments[1]?.toLowerCase();

  if (!candidate || !isLocale(candidate)) {
    return pathname === "" ? "/" : pathname;
  }

  const stripped = `/${segments.slice(2).join("/")}`;
  return stripped === "//" || stripped === "/" ? "/" : stripped.replace(/\/+/g, "/");
}

export function extractLocaleFromPathname(pathname: string): Locale | null {
  if (!pathname.startsWith("/")) return null;

  const candidate = pathname.split("/")[1]?.toLowerCase();
  return candidate && isLocale(candidate) ? candidate : null;
}

export function localizeHref(locale: Locale, href: string): string {
  if (!href || SPECIAL_HREF_PATTERN.test(href)) return href;
  if (!href.startsWith("/")) return href;

  const { pathname, query, hash } = splitHref(href);
  const normalizedPath = stripLocaleFromPathname(pathname);
  const localizedPath = shouldPrefixLocale(locale)
    ? normalizedPath === "/"
      ? `/${locale}`
      : `/${locale}${normalizedPath}`
    : normalizedPath;

  return `${localizedPath}${query}${hash}`;
}

export function replaceLocaleInPathname(pathname: string, locale: Locale): string {
  if (!pathname.startsWith("/")) return localizeHref(locale, `/${pathname}`);
  const stripped = stripLocaleFromPathname(pathname);
  if (!shouldPrefixLocale(locale)) {
    return stripped === "/" ? "/" : stripped;
  }
  return stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
}

export function formatLocaleLabel(locale: Locale): string {
  return locale.toUpperCase();
}
