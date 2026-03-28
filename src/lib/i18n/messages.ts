import type { Locale } from "@/lib/i18n/config";
import commonEn from "@/locales/en/common.json";
import publicNavEn from "@/locales/en/public-nav.json";
import homeEn from "@/locales/en/home.json";
import aboutEn from "@/locales/en/about.json";
import projectsEn from "@/locales/en/projects.json";
import companiesEn from "@/locales/en/companies.json";
import caseStudiesEn from "@/locales/en/case-studies.json";
import formsEn from "@/locales/en/forms.json";
import adminCommonEn from "@/locales/en/admin-common.json";
import adminNavEn from "@/locales/en/admin-nav.json";
import adminCrmEn from "@/locales/en/admin-crm.json";
import adminPropertiesEn from "@/locales/en/admin-properties.json";
import adminCompaniesEn from "@/locales/en/admin-companies.json";
import adminMicrositesEn from "@/locales/en/admin-microsites.json";

export const ENGLISH_CATALOG = {
  common: commonEn,
  "public-nav": publicNavEn,
  home: homeEn,
  about: aboutEn,
  projects: projectsEn,
  companies: companiesEn,
  "case-studies": caseStudiesEn,
  forms: formsEn,
  "admin-common": adminCommonEn,
  "admin-nav": adminNavEn,
  "admin-crm": adminCrmEn,
  "admin-properties": adminPropertiesEn,
  "admin-companies": adminCompaniesEn,
  "admin-microsites": adminMicrositesEn,
} as const;

export type TranslationCatalog = typeof ENGLISH_CATALOG;

type LoaderMap = Record<Locale, () => Promise<TranslationCatalog>>;

const LOCALE_LOADERS: LoaderMap = {
  en: async () => ENGLISH_CATALOG,
  hi: async () => ({
    common: (await import("@/locales/hi/common.json")).default,
    "public-nav": (await import("@/locales/hi/public-nav.json")).default,
    home: (await import("@/locales/hi/home.json")).default,
    about: (await import("@/locales/hi/about.json")).default,
    projects: (await import("@/locales/hi/projects.json")).default,
    companies: (await import("@/locales/hi/companies.json")).default,
    "case-studies": (await import("@/locales/hi/case-studies.json")).default,
    forms: (await import("@/locales/hi/forms.json")).default,
    "admin-common": (await import("@/locales/hi/admin-common.json")).default,
    "admin-nav": (await import("@/locales/hi/admin-nav.json")).default,
    "admin-crm": (await import("@/locales/hi/admin-crm.json")).default,
    "admin-properties": (await import("@/locales/hi/admin-properties.json")).default,
    "admin-companies": (await import("@/locales/hi/admin-companies.json")).default,
    "admin-microsites": (await import("@/locales/hi/admin-microsites.json")).default,
  }),
  hr: async () => ({
    common: (await import("@/locales/hr/common.json")).default,
    "public-nav": (await import("@/locales/hr/public-nav.json")).default,
    home: (await import("@/locales/hr/home.json")).default,
    about: (await import("@/locales/hr/about.json")).default,
    projects: (await import("@/locales/hr/projects.json")).default,
    companies: (await import("@/locales/hr/companies.json")).default,
    "case-studies": (await import("@/locales/hr/case-studies.json")).default,
    forms: (await import("@/locales/hr/forms.json")).default,
    "admin-common": (await import("@/locales/hr/admin-common.json")).default,
    "admin-nav": (await import("@/locales/hr/admin-nav.json")).default,
    "admin-crm": (await import("@/locales/hr/admin-crm.json")).default,
    "admin-properties": (await import("@/locales/hr/admin-properties.json")).default,
    "admin-companies": (await import("@/locales/hr/admin-companies.json")).default,
    "admin-microsites": (await import("@/locales/hr/admin-microsites.json")).default,
  }),
  ar: async () => ({
    common: (await import("@/locales/ar/common.json")).default,
    "public-nav": (await import("@/locales/ar/public-nav.json")).default,
    home: (await import("@/locales/ar/home.json")).default,
    about: (await import("@/locales/ar/about.json")).default,
    projects: (await import("@/locales/ar/projects.json")).default,
    companies: (await import("@/locales/ar/companies.json")).default,
    "case-studies": (await import("@/locales/ar/case-studies.json")).default,
    forms: (await import("@/locales/ar/forms.json")).default,
    "admin-common": (await import("@/locales/ar/admin-common.json")).default,
    "admin-nav": (await import("@/locales/ar/admin-nav.json")).default,
    "admin-crm": (await import("@/locales/ar/admin-crm.json")).default,
    "admin-properties": (await import("@/locales/ar/admin-properties.json")).default,
    "admin-companies": (await import("@/locales/ar/admin-companies.json")).default,
    "admin-microsites": (await import("@/locales/ar/admin-microsites.json")).default,
  }),
};

export async function getMessages(locale: Locale): Promise<TranslationCatalog> {
  return LOCALE_LOADERS[locale]();
}
