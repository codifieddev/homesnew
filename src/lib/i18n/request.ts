import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { connectDB } from "@/lib/db/connection";
import AppSettings from "@/lib/db/models/AppSettings";
import type {
  Locale,
  RuntimeLocaleSettings,
  RuntimePresentationSettings,
  SiteTemplate,
} from "@/lib/i18n/config";
import {
  DEFAULT_LOCALE,
  DEFAULT_SITE_TEMPLATE,
  EXTERNAL_PATH_HEADER_NAME,
  FALLBACK_ENABLED_LOCALES,
  FALLBACK_LOCALE_ORDER,
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  STATIC_LOCALE_REGISTRY,
  isLocale,
  isSiteTemplate,
  sortLocalesByRuntimeSettings,
} from "@/lib/i18n/config";

const getRuntimeAppSettings = cache(
  async (): Promise<{
    localization: RuntimeLocaleSettings;
    presentation: RuntimePresentationSettings;
  }> => {
    try {
      await connectDB();
      const settings = await AppSettings.findOne({ key: "app" }).lean();

      const enabledLocales = (settings?.localization?.enabledLocales ?? FALLBACK_ENABLED_LOCALES)
        .filter((locale: string) => isLocale(locale));

      const localeOrder = (settings?.localization?.localeOrder ?? FALLBACK_LOCALE_ORDER)
        .filter((locale: string) => isLocale(locale));

      const defaultLocale = isLocale(settings?.localization?.defaultLocale)
        ? settings.localization.defaultLocale
        : DEFAULT_LOCALE;

      const safeEnabledLocales = enabledLocales.length
        ? enabledLocales
        : FALLBACK_ENABLED_LOCALES;

      const sortedLocales = sortLocalesByRuntimeSettings(
        localeOrder.length ? localeOrder : FALLBACK_LOCALE_ORDER,
        safeEnabledLocales
      );

      return {
        localization: {
          defaultLocale: safeEnabledLocales.includes(defaultLocale)
            ? defaultLocale
            : safeEnabledLocales[0],
          enabledLocales: safeEnabledLocales,
          localeOrder: sortedLocales.length ? sortedLocales : safeEnabledLocales,
        },
        presentation: {
          siteTemplate: isSiteTemplate(settings?.presentation?.siteTemplate)
            ? (settings.presentation.siteTemplate as SiteTemplate)
            : DEFAULT_SITE_TEMPLATE,
        },
      };
    } catch (error) {
      console.error("[getRuntimeLocaleSettings]", error);
      return {
        localization: {
          defaultLocale: DEFAULT_LOCALE,
          enabledLocales: FALLBACK_ENABLED_LOCALES,
          localeOrder: FALLBACK_LOCALE_ORDER,
        },
        presentation: {
          siteTemplate: DEFAULT_SITE_TEMPLATE,
        },
      };
    }
  }
);

export const getRuntimeLocaleSettings = cache(
  async (): Promise<RuntimeLocaleSettings> =>
    (await getRuntimeAppSettings()).localization
);

export const getRuntimePresentationSettings = cache(
  async (): Promise<RuntimePresentationSettings> =>
    (await getRuntimeAppSettings()).presentation
);

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER_NAME)?.toLowerCase();

  if (headerLocale && isLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value?.toLowerCase();
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return DEFAULT_LOCALE;
}

export async function getRequestExternalPath(): Promise<string> {
  const headerStore = await headers();
  return headerStore.get(EXTERNAL_PATH_HEADER_NAME) || "/";
}

export async function getRequestLocaleContext() {
  const [locale, runtimeSettings, presentationSettings] = await Promise.all([
    getRequestLocale(),
    getRuntimeLocaleSettings(),
    getRuntimePresentationSettings(),
  ]);

  const availableLocales = sortLocalesByRuntimeSettings(
    runtimeSettings.localeOrder,
    runtimeSettings.enabledLocales
  );

  return {
    locale,
    runtimeSettings: {
      ...runtimeSettings,
      localeOrder: availableLocales,
    },
    presentationSettings,
    registry: STATIC_LOCALE_REGISTRY,
  };
}
