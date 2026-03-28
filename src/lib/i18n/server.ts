import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/request";
import { buildTranslator } from "@/lib/i18n/translate";

export async function getServerI18n() {
  const locale = await getRequestLocale();
  const messages = await getMessages(locale);

  return {
    locale,
    messages,
    t: buildTranslator(messages),
  };
}
