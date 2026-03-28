"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type {
  Locale,
  LocaleRegistryEntry,
  RuntimeLocaleSettings,
  RuntimePresentationSettings,
  SiteTemplate,
  TranslationNamespace,
} from "@/lib/i18n/config";
import type { TranslationCatalog } from "@/lib/i18n/messages";
import { translateNamespace } from "@/lib/i18n/translate";

type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  messages: TranslationCatalog;
  runtimeSettings: RuntimeLocaleSettings;
  presentationSettings: RuntimePresentationSettings;
  registry: Record<Locale, LocaleRegistryEntry>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  locale,
  dir,
  messages,
  runtimeSettings,
  presentationSettings,
  registry,
}: LocaleContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({
      locale,
      dir,
      messages,
      runtimeSettings,
      presentationSettings,
      registry,
    }),
    [dir, locale, messages, presentationSettings, registry, runtimeSettings]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleContext must be used within LocaleProvider");
  }
  return context;
}

export function useTranslations(namespace: TranslationNamespace) {
  const { messages } = useLocaleContext();

  return (
    key: string,
    values?: Record<string, string | number | boolean | null | undefined>
  ) =>
    translateNamespace(
      messages[namespace] as Record<string, unknown>,
      key,
      values
    );
}

export function useSiteTemplate(): SiteTemplate {
  const { presentationSettings } = useLocaleContext();
  return presentationSettings.siteTemplate;
}
