import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/shared/AuthProvider";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestExternalPath, getRequestLocaleContext } from "@/lib/i18n/request";
import { replaceLocaleInPathname } from "@/lib/i18n/utils";
import { Toaster } from "sonner";
import "./globals.css";

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://lucknowhomes.in"
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Homes — Premium Real Estate Advisory",
    template: "%s | Homes",
  },
  description:
    "Discover RERA-verified residential plots, apartments, and villas in Lucknow. Trusted real estate advisory with transparent pricing and expert guidance.",
  keywords: [
    "real estate Lucknow",
    "residential plots Sushant Golf City",
    "RERA verified properties",
    "flats in Lucknow",
    "villas Lucknow",
    "property for sale Lucknow",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Homes",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localeContext = await getRequestLocaleContext();
  const [{ locale, registry, runtimeSettings, presentationSettings }, messages, externalPath] =
    await Promise.all([
      Promise.resolve(localeContext),
      getMessages(localeContext.locale),
      getRequestExternalPath(),
    ]);

  if (!runtimeSettings.enabledLocales.includes(locale)) {
    redirect(replaceLocaleInPathname(externalPath, runtimeSettings.defaultLocale));
  }

  return (
    <html lang={locale} dir={registry[locale].dir} suppressHydrationWarning>
      <body
        className="font-sans antialiased"
        data-site-template={presentationSettings.siteTemplate}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider
            locale={locale}
            dir={registry[locale].dir}
            messages={messages}
            runtimeSettings={runtimeSettings}
            presentationSettings={presentationSettings}
            registry={registry}
          >
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  },
                }}
              />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
