import Link from "next/link";
import { BriefcaseBusiness, ChevronRight } from "lucide-react";
import { getPublishedCompanies } from "@/lib/db/actions/company.actions";
import { MotionReveal } from "@/components/shared/motion/MotionReveal";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { getServerI18n } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("companies", "page.eyebrow"),
    description:
      "Explore the builders, developers, and listing partners Homes has worked with across Lucknow.",
  };
}

export default async function CompaniesPage() {
  const { t, locale } = await getServerI18n();
  const companiesRes = await getPublishedCompanies();
  const companies = companiesRes.data ?? [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        <MotionReveal className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-7 bg-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              {t("companies", "page.eyebrow")}
            </span>
          </div>
          <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            {t("companies", "page.title")}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {t("companies", "page.description")}
          </p>
        </MotionReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company._id}
              href={localizeHref(locale, `/companies/${company.slug}`)}
              className="surface-card interactive-card group rounded-[1.6rem] p-6"
            >
              <div className="mb-5 flex h-20 items-center justify-center rounded-2xl border border-border bg-background p-4">
                {company.logo ? (
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={180}
                    height={72}
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <BriefcaseBusiness className="h-7 w-7 text-primary" />
                )}
              </div>
              <h2 className="text-xl font-medium text-foreground">
                {company.name}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {company.shortIntro || t("companies", "card.fallbackIntro")}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:text-primary-light">
                {t("companies", "card.cta")} <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
