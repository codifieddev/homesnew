export const SUPPORTED_LOCALES = ["en", "hi", "hr", "ar"] as const;
export const SITE_TEMPLATES = ["classic", "immersive"] as const;

export const TRANSLATION_NAMESPACES = [
  "common",
  "public-nav",
  "home",
  "about",
  "projects",
  "companies",
  "case-studies",
  "forms",
  "admin-common",
  "admin-nav",
  "admin-crm",
  "admin-properties",
  "admin-companies",
  "admin-microsites",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[number];
export type LocaleDirection = "ltr" | "rtl";
export type SiteTemplate = (typeof SITE_TEMPLATES)[number];

export type LocaleRegistryEntry = {
  code: Locale;
  label: string;
  nativeLabel: string;
  dir: LocaleDirection;
};

export type RuntimeLocaleSettings = {
  defaultLocale: Locale;
  enabledLocales: Locale[];
  localeOrder: Locale[];
};

export type RuntimePresentationSettings = {
  siteTemplate: SiteTemplate;
};

export const DEFAULT_LOCALE: Locale = "en";
export const DEFAULT_SITE_TEMPLATE: SiteTemplate = "classic";
export const FALLBACK_ENABLED_LOCALES: Locale[] = ["en", "hi"];
export const FALLBACK_LOCALE_ORDER: Locale[] = ["en", "hi", "hr", "ar"];

export const LOCALE_COOKIE_NAME = "homes-locale";
export const LOCALE_HEADER_NAME = "x-homes-locale";
export const EXTERNAL_PATH_HEADER_NAME = "x-homes-external-path";

export const STATIC_LOCALE_REGISTRY: Record<Locale, LocaleRegistryEntry> = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    dir: "ltr",
  },
  hi: {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिंदी",
    dir: "ltr",
  },
  hr: {
    code: "hr",
    label: "Croatian",
    nativeLabel: "Hrvatski",
    dir: "ltr",
  },
  ar: {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    dir: "rtl",
  },
};

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function isSiteTemplate(value: string): value is SiteTemplate {
  return SITE_TEMPLATES.includes(value as SiteTemplate);
}

export function shouldPrefixLocale(locale: Locale): boolean {
  return locale !== DEFAULT_LOCALE;
}

export function isTranslationNamespace(
  value: string
): value is TranslationNamespace {
  return TRANSLATION_NAMESPACES.includes(value as TranslationNamespace);
}

export function isRtlLocale(locale: Locale): boolean {
  return STATIC_LOCALE_REGISTRY[locale].dir === "rtl";
}

export function sortLocalesByRuntimeSettings(
  localeOrder: Locale[],
  enabledLocales: Locale[]
): Locale[] {
  const enabled = new Set(enabledLocales);
  return localeOrder.filter((locale) => enabled.has(locale));
}
