import type { TranslationCatalog } from "@/lib/i18n/messages";

type MessageValue = string | number | boolean | null | undefined;

export function resolveNestedValue(
  source: Record<string, unknown>,
  key: string
): unknown {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
}

export function interpolateMessage(
  template: string,
  values?: Record<string, MessageValue>
): string {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = values[token];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function translateNamespace(
  namespaceMessages: Record<string, unknown>,
  key: string,
  values?: Record<string, MessageValue>
): string {
  const resolved = resolveNestedValue(namespaceMessages, key);
  if (typeof resolved !== "string") return key;
  return interpolateMessage(resolved, values);
}

export function buildTranslator(messages: TranslationCatalog) {
  return <
    TNamespace extends keyof TranslationCatalog
  >(
    namespace: TNamespace,
    key: string,
    values?: Record<string, MessageValue>
  ) => translateNamespace(messages[namespace] as Record<string, unknown>, key, values);
}
