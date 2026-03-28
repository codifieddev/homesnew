import Link from "next/link";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { Building2, CalendarCheck, BadgeCheck, MapPin, ArrowRight } from "lucide-react";
import { getFeaturedProperties } from "@/lib/db/actions/property.actions";
import { getFeaturedCompanies } from "@/lib/db/actions/company.actions";
import { getFeaturedCaseStudies } from "@/lib/db/actions/case-study.actions";
import { PropertyCard } from "@/components/public/properties/PropertyCard";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { HeroSection } from "@/components/public/hero/HeroSection";
import {
  MotionReveal,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/shared/motion/MotionReveal";
import { getServerI18n } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Homes — Premium Real Estate Advisory in Lucknow",
    description:
      "Discover RERA-verified residential plots, villas, and apartments in Lucknow. Expert advisory, transparent pricing, and hassle-free site visits.",
  };
}

export default async function HomePage() {
  const { t, locale } = await getServerI18n();
  const [featuredRes, companiesRes, caseStudiesRes] = await Promise.all([
    getFeaturedProperties(4),
    getFeaturedCompanies(6),
    getFeaturedCaseStudies(3),
  ]);
  const featured = featuredRes.data ?? [];
  const companies = companiesRes.data ?? [];
  const caseStudies = caseStudiesRes.data ?? [];

  return (
    <div className="bg-background">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── FEATURED PROJECTS ─────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-px bg-primary" />
              <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("home", "portfolio.eyebrow")}</span>
            </div>
            <h2 className="font-serif text-4xl font-medium text-foreground sm:text-5xl">{t("home", "portfolio.title")}</h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              {t("home", "portfolio.description")}
            </p>
          </div>
          <Link
            href={localizeHref(locale, "/projects")}
            className="secondary-cta flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-primary transition-all hover:text-primary-light"
          >
            {t("home", "portfolio.cta")} <ArrowRight className="w-4 h-4" />
          </Link>
        </MotionReveal>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((property, i) => (
              <PropertyCard
                key={property._id}
                property={property}
                featured={i === 0}
                className={i === 0 ? "md:col-span-2" : ""}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Skeleton placeholders */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-7 h-px bg-primary" />
              <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("home", "services.eyebrow")}</span>
              <div className="w-7 h-px bg-primary" />
            </div>
            <h2 className="mb-4 font-serif text-4xl font-medium text-foreground sm:text-5xl">
              {t("home", "services.title")}
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              {t("home", "services.description")}
            </p>
          </MotionReveal>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Building2,
                num: "01",
                title: t("home", "services.buy.title"),
                desc: t("home", "services.buy.desc"),
                cta: t("home", "services.buy.cta"),
                href: "/projects",
              },
              {
                icon: CalendarCheck,
                num: "02",
                title: t("home", "services.visit.title"),
                desc: t("home", "services.visit.desc"),
                cta: t("home", "services.visit.cta"),
                href: "/#enquire",
              },
              {
                icon: BadgeCheck,
                num: "03",
                title: t("home", "services.loan.title"),
                desc: t("home", "services.loan.desc"),
                cta: t("home", "services.loan.cta"),
                href: "/#enquire",
              },
            ].map((service) => {
              const Icon = service.icon;
              return (
                <MotionStaggerItem
                  key={service.num}
                  className="relative"
                >
                  <div className="surface-card interactive-card group relative overflow-hidden rounded-[1.8rem] p-8">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-light/0 to-transparent group-hover:via-primary-light/40 transition-all duration-500" />

                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{service.num}</p>
                  <h3 className="mb-3 font-serif text-2xl font-medium text-foreground">{service.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{service.desc}</p>
                  <Link
                    href={localizeHref(locale, service.href)}
                    className="flex items-center gap-2 text-sm text-primary group-hover:text-primary-light transition-colors font-medium"
                  >
                    {service.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  </div>
                </MotionStaggerItem>
              );
            })}
          </MotionStagger>
        </div>
      </section>

      {/* ── GOLD STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-primary py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { num: "500+", label: t("home", "statsStrip.families") },
              { num: "7",    label: t("home", "statsStrip.projects") },
              { num: "5★",   label: t("home", "statsStrip.rating") },
              { num: "48h",  label: t("home", "statsStrip.response") },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-4xl sm:text-5xl font-semibold text-foreground mb-2">{stat.num}</p>
                <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / COMPLIANCE ────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-px bg-primary" />
              <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("home", "trust.eyebrow")}</span>
            </div>
            <h2 className="mb-6 font-serif text-[clamp(2rem,4vw,3.5rem)] leading-tight text-foreground">
              {t("home", "trust.titleLine1")} <br className="hidden sm:block" />
              <span className="text-gradient-primary italic">{t("home", "trust.titleHighlight")}</span>
            </h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              {t("home", "trust.description")}
            </p>

            <div className="space-y-4">
              {[
                { title: t("home", "trust.cards.rera.title"), desc: t("home", "trust.cards.rera.desc") },
                { title: t("home", "trust.cards.legal.title"), desc: t("home", "trust.cards.legal.desc") },
                { title: t("home", "trust.cards.banks.title"), desc: t("home", "trust.cards.banks.desc") },
                { title: t("home", "trust.cards.pricing.title"), desc: t("home", "trust.cards.pricing.desc") },
              ].map((item) => (
                <div key={item.title} className="surface-card rounded-2xl flex items-start gap-4 p-4">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-secondary/20 bg-secondary/10">
                    <BadgeCheck className="h-3.5 w-3.5 text-secondary" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Process steps */}
          <div className="relative pl-6">
            <div className="absolute bottom-6 left-[11px] top-6 w-px bg-gradient-to-b from-primary/40 via-primary-light/25 to-transparent" />
            <div className="space-y-8">
              {[
                { n: "1", title: t("home", "trust.steps.oneTitle"), desc: t("home", "trust.steps.oneDesc") },
                { n: "2", title: t("home", "trust.steps.twoTitle"), desc: t("home", "trust.steps.twoDesc") },
                { n: "3", title: t("home", "trust.steps.threeTitle"), desc: t("home", "trust.steps.threeDesc") },
                { n: "4", title: t("home", "trust.steps.fourTitle"), desc: t("home", "trust.steps.fourDesc") },
              ].map((step) => (
                <div key={step.n} className="flex gap-5">
                  <div className="w-6 h-6 rounded-full bg-card border border-primary/40 flex items-center justify-center flex-shrink-0 z-10">
                    <span className="font-serif text-sm font-medium text-primary">{step.n}</span>
                  </div>
                  <div className="pb-2">
                    <p className="mb-1 text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST LAYER: COMPANIES + CASE STUDIES ───────────────────────────── */}
      <section className="border-t border-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-10 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-px bg-primary" />
                <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("home", "proof.eyebrow")}</span>
              </div>
              <h2 className="font-serif text-4xl font-medium text-foreground sm:text-5xl">
                {t("home", "proof.title")}
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
                {t("home", "proof.description")}
              </p>
              <Link
                href={localizeHref(locale, "/companies")}
                className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
              >
                {t("home", "proof.companyCta")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {companies.map((company) => (
                <Link
                  key={company._id}
                  href={localizeHref(locale, `/companies/${company.slug}`)}
                  className="surface-card interactive-card group rounded-[1.6rem] p-6"
                >
                  <div className="h-20 rounded-xl border border-border bg-background flex items-center justify-center p-4">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={140}
                        height={60}
                        className="max-h-12 w-auto object-contain"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {company.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {company.shortIntro}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {caseStudies.length > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {caseStudies.map((caseStudy) => (
                <Link
                  key={caseStudy._id}
                  href={localizeHref(locale, `/case-studies/${caseStudy.slug}`)}
                  className="surface-card interactive-card group rounded-[1.6rem] p-6"
                >
                  <p className="text-[10px] text-primary uppercase tracking-widest font-medium">{t("home", "proof.caseStudyLabel")}</p>
                  <h3 className="mt-3 font-serif text-2xl font-medium text-foreground group-hover:text-primary transition-colors">
                    {caseStudy.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {caseStudy.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {caseStudy.outcomes.slice(0, 3).map((outcome) => (
                      <span
                        key={`${outcome.label}-${outcome.value}`}
                        className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[11px] text-primary"
                      >
                        {outcome.label}: {outcome.value}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ENQUIRY CTA ───────────────────────────────────────────────────────── */}
      <section id="enquire" className="scroll-mt-20 border-t border-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left copy */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-px bg-primary" />
                <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("home", "enquiry.eyebrow")}</span>
              </div>
              <h2 className="mb-5 font-serif text-4xl font-medium text-foreground sm:text-5xl">
                {t("home", "enquiry.titleLine1")}<br />{t("home", "enquiry.titleLine2")}
              </h2>
              <p className="mb-10 leading-relaxed text-muted-foreground">
                {t("home", "enquiry.description")}
              </p>

              <div className="space-y-5">
                {[
                  { icon: Building2,     label: t("home", "enquiry.contact.call"),  value: "+91 88746 25303",        href: "tel:+918874625303" },
                  { icon: BadgeCheck,    label: t("home", "enquiry.contact.email"),    value: "info@homes.in",           href: "mailto:info@homes.in" },
                  { icon: MapPin,        label: t("home", "enquiry.contact.office"),   value: "Royal Plaza, Sushant Golf City, Sultanpur Road, Lucknow", href: null },
                ].map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.label}</p>
                        <p className="mt-0.5 text-sm text-foreground">{item.value}</p>
                      </div>
                    </div>
                  );
                  return item.href ? (
                    <a key={item.label} href={item.href} className="block hover:opacity-80 transition-opacity">{content}</a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* Form card */}
            <div className="surface-card rounded-[1.75rem] p-8">
              <h3 className="mb-6 font-serif text-xl font-medium text-foreground">{t("home", "enquiry.formTitle")}</h3>

              {/* Property selector */}
              <div className="mb-4">
                <select className="w-full rounded-lg border border-border bg-accent px-3.5 py-2.5 text-sm text-muted-foreground outline-none transition-all focus:border-primary/50">
                  <option value="">{t("home", "enquiry.selectorPlaceholder")}</option>
                  {["Okas Enclave","Attalika Palms","Stellar Okas Golf View","Kailasha Enclave","Greenberry Signature","Lavanya Enclave","Vikas Vihar"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <EnquiryForm variant="inline" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
