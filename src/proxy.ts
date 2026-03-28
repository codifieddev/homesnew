import {
  DEFAULT_LOCALE,
  EXTERNAL_PATH_HEADER_NAME,
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  isLocale,
} from "@/lib/i18n/config";
import {
  extractLocaleFromPathname,
  looksLikeUnsupportedLocale,
  stripLocaleFromPathname,
} from "@/lib/i18n/utils";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthSecret, isSecureAuthCookie } from "@/lib/auth/secret";

/**
 * Route protection matrix:
 *
 * /admin/*        → requires any authenticated user (admin or agent)
 * /auth/login     → redirects to /admin if already authenticated
 * /api/auth/*     → always public (NextAuth internals)
 * everything else → public
 */

const PROTECTED_PREFIXES = ["/admin"];
const AUTH_ROUTES = ["/auth/login", "/auth/error"];

function negotiateLocale(request: Request): string {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]+)`)
  );
  const cookieLocale = cookieMatch?.[1]?.toLowerCase();

  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const weighted = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag, quality = "q=1"] = entry.trim().split(";");
      const value = Number(quality.replace("q=", "")) || 1;
      return {
        tag: tag.toLowerCase(),
        quality: value,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const item of weighted) {
    const base = item.tag.split("-")[0];
    if (isLocale(item.tag)) return item.tag;
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

function buildLocalizedUrl(url: URL, locale: string, pathname: string) {
  const nextUrl = new URL(url.toString());
  nextUrl.pathname = locale !== DEFAULT_LOCALE
    ? pathname === "/"
      ? `/${locale}`
      : `/${locale}${pathname}`
    : pathname;
  return nextUrl;
}

function upsertCookieHeader(rawCookieHeader: string, name: string, value: string) {
  const entries = rawCookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => !entry.startsWith(`${name}=`));

  entries.push(`${name}=${value}`);
  return entries.join("; ");
}

function forwardWithLocaleContext(
  req: NextRequest,
  resolvedLocale: string,
  originalPathname: string,
  normalizedPathname: string
) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(LOCALE_HEADER_NAME, resolvedLocale);
  requestHeaders.set(EXTERNAL_PATH_HEADER_NAME, originalPathname);
  requestHeaders.set(
    "cookie",
    upsertCookieHeader(req.headers.get("cookie") ?? "", LOCALE_COOKIE_NAME, resolvedLocale)
  );

  const response =
    req.nextUrl.pathname !== normalizedPathname
      ? NextResponse.rewrite(new URL(normalizedPathname, req.url), {
          request: { headers: requestHeaders },
        })
      : NextResponse.next({
          request: { headers: requestHeaders },
        });

  response.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale, { path: "/" });
  return response;
}

async function getSessionUser(req: NextRequest) {
  const secret = getAuthSecret();

  if (!secret) {
    return null;
  }

  try {
    const token = await getToken({
      req,
      secret,
      secureCookie: isSecureAuthCookie(),
    });

    if (!token) {
      return null;
    }

    return {
      id: String(token.userId ?? token.sub ?? ""),
      role: String(token.role ?? "agent"),
      name: typeof token.name === "string" ? token.name : "",
      email: typeof token.email === "string" ? token.email : "",
    };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const originalPathname =
    req.headers.get(EXTERNAL_PATH_HEADER_NAME) ?? req.nextUrl.pathname;
  const locale = extractLocaleFromPathname(originalPathname);
  const requestedLocale = locale ?? negotiateLocale(req);
  const resolvedLocale = locale ?? requestedLocale;
  const normalizedPathname = locale
    ? stripLocaleFromPathname(originalPathname)
    : originalPathname;
  const sessionUser = await getSessionUser(req);

  if (locale === DEFAULT_LOCALE) {
    const redirectUrl = new URL(req.nextUrl.toString());
    redirectUrl.pathname = normalizedPathname;
    return NextResponse.redirect(redirectUrl);
  }

  if (!locale) {
    const firstSegment = originalPathname.split("/")[1]?.toLowerCase();
    if (firstSegment && looksLikeUnsupportedLocale(firstSegment)) {
      return NextResponse.next();
    }

    if (requestedLocale !== DEFAULT_LOCALE) {
      const redirectUrl = buildLocalizedUrl(
        req.nextUrl,
        requestedLocale,
        originalPathname
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ── Already logged in → redirect away from login page ──────────────────────
  if (AUTH_ROUTES.some((r) => normalizedPathname.startsWith(r))) {
    if (sessionUser) {
      return NextResponse.redirect(
        buildLocalizedUrl(req.nextUrl, resolvedLocale, "/admin")
      );
    }
    return forwardWithLocaleContext(
      req,
      resolvedLocale,
      originalPathname,
      normalizedPathname
    );
  }

  // ── Protected routes ────────────────────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    normalizedPathname.startsWith(prefix)
  );

  if (isProtected) {
    // No session → redirect to login with callbackUrl
    if (!sessionUser) {
      const loginUrl = buildLocalizedUrl(req.nextUrl, resolvedLocale, "/auth/login");
      loginUrl.searchParams.set(
        "callbackUrl",
        `${originalPathname}${req.nextUrl.search}`
      );
      return NextResponse.redirect(loginUrl);
    }

    // Role-based enforcement
    if (
      normalizedPathname.startsWith("/admin/analytics") &&
      !["super_admin", "admin"].includes(sessionUser.role)
    ) {
      return NextResponse.redirect(buildLocalizedUrl(req.nextUrl, resolvedLocale, "/admin"));
    }

    if (
      normalizedPathname.startsWith("/admin/settings") &&
      sessionUser.role !== "super_admin"
    ) {
      return NextResponse.redirect(buildLocalizedUrl(req.nextUrl, resolvedLocale, "/admin"));
    }

    if (
      (normalizedPathname.startsWith("/admin/companies") ||
        normalizedPathname.startsWith("/admin/case-studies") ||
        normalizedPathname.startsWith("/admin/property-sites")) &&
      !["super_admin", "admin", "company_manager"].includes(sessionUser.role)
    ) {
      return NextResponse.redirect(buildLocalizedUrl(req.nextUrl, resolvedLocale, "/admin"));
    }

    if (
      normalizedPathname.startsWith("/admin/properties") &&
      normalizedPathname !== "/admin/properties" &&
      sessionUser.role === "agent"
    ) {
      if (
        normalizedPathname.includes("/new") ||
        normalizedPathname.includes("/edit") ||
        normalizedPathname.includes("/delete")
      ) {
        return NextResponse.redirect(buildLocalizedUrl(req.nextUrl, resolvedLocale, "/admin"));
      }
    }
  }
  return forwardWithLocaleContext(
    req,
    resolvedLocale,
    originalPathname,
    normalizedPathname
  );
}

/**
 * Matcher config:
 * Runs middleware on all routes EXCEPT Next.js internals,
 * static files, and image optimisation routes.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|icons/).*)",
  ],
};
