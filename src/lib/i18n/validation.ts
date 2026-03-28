import { getMessages, ENGLISH_CATALOG } from "@/lib/i18n/messages";
import {
  SUPPORTED_LOCALES,
  TRANSLATION_NAMESPACES,
  type Locale,
  type TranslationNamespace,
} from "@/lib/i18n/config";

function flattenKeys(
  value: Record<string, unknown>,
  prefix = ""
): string[] {
  return Object.entries(value).flatMap(([key, nested]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (
      nested &&
      typeof nested === "object" &&
      !Array.isArray(nested)
    ) {
      return flattenKeys(nested as Record<string, unknown>, nextKey);
    }

    return [nextKey];
  });
}

export type LocaleNamespaceDiagnostic = {
  namespace: TranslationNamespace;
  totalKeys: number;
  missingKeys: string[];
  extraKeys: string[];
};

export type LocaleDiagnostic = {
  locale: Locale;
  isValid: boolean;
  namespaces: LocaleNamespaceDiagnostic[];
};

export async function getLocaleDiagnostics(): Promise<LocaleDiagnostic[]> {
  const diagnostics = await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => {
      const catalog = await getMessages(locale);

      const namespaces = TRANSLATION_NAMESPACES.map((namespace) => {
        const referenceKeys = flattenKeys(
          ENGLISH_CATALOG[namespace] as Record<string, unknown>
        );
        const localeKeys = flattenKeys(catalog[namespace] as Record<string, unknown>);

        return {
          namespace,
          totalKeys: referenceKeys.length,
          missingKeys: referenceKeys.filter((key) => !localeKeys.includes(key)),
          extraKeys: localeKeys.filter((key) => !referenceKeys.includes(key)),
        };
      });

      return {
        locale,
        isValid: namespaces.every(
          (namespace) =>
            namespace.missingKeys.length === 0 && namespace.extraKeys.length === 0
        ),
        namespaces,
      };
    })
  );

  return diagnostics;
}
