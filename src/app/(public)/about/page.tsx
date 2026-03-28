import Link from "next/link";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { BadgeCheck, Building2, Users2, Star, MapPin, ArrowRight } from "lucide-react";
import { getFeaturedCompanies } from "@/lib/db/actions/company.actions";
import { getFeaturedCaseStudies } from "@/lib/db/actions/case-study.actions";
import {
  MotionReveal,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/shared/motion/MotionReveal";
import { getServerI18n } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: `${t("public-nav", "links.about")} — Homes`,
    description:
      "Learn about Homes — a trusted real estate advisory firm serving buyers and investors across Lucknow and Uttar Pradesh since 2019.",
  };
}

const TEAM = [
  {
    name: "Maneesh Kumar Rai",
    role: "Founder & Principal Advisor",
    initials: "MR",
    bio: "With over a decade of experience in Uttar Pradesh real estate, Maneesh has guided hundreds of families and investors to the right property. Director at Shalu Homes Pvt. Ltd. and ESOS Tech LLP.",
  },
  {
    name: "Senior Advisory Team",
    role: "Property Consultants",
    initials: "SA",
    bio: "Our advisory team specialises in residential plots, high-rise apartments, and villa developments across Lucknow's fastest-growing corridors.",
  },
];

const VALUES = [
  { title: "Full Transparency",   desc: "Pricing, RERA IDs, stamp duty estimates, and legal clearance status — every listing is fully documented." },
  { title: "Zero Commission Conflict", desc: "We earn only when the right property matches the right buyer. No pressure, no inflated listings." },
  { title: "RERA-First",          desc: "We list only RERA-registered projects or verified resale properties with clear title. Compliance is non-negotiable." },
  { title: "Buyer Advocacy",      desc: "We work for the buyer, not the builder. Every recommendation is made with your long-term interest in mind." },
];

export default async function AboutPage() {
  const { t, locale } = await getServerI18n();
  const [companiesRes, caseStudiesRes] = await Promise.all([
    getFeaturedCompanies(6),
    getFeaturedCaseStudies(2),
  ]);
  const companies = companiesRes.data ?? [];
  const caseStudies = caseStudiesRes.data ?? [];

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {/* Hero */}
        <MotionReveal className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("about", "hero.eyebrow")}</span>
          </div>
            <h1 className="mb-6 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-5xl">
              {t("about", "hero.titleLine1")} <br className="hidden sm:block" />
              <span className="text-gradient-primary italic">{t("about", "hero.titleHighlight")}</span> {t("about", "hero.titleLine2")}
            </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {t("about", "hero.description")}
          </p>
        </MotionReveal>

        {/* Stats */}
        <MotionStagger className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users2,    num: "500+", label: t("about", "stats.families") },
            { icon: Building2, num: "7",    label: t("about", "stats.projects") },
            { icon: BadgeCheck,num: "100%", label: t("about", "stats.verified") },
            { icon: Star,      num: "5★",   label: t("about", "stats.rating") },
          ].map(({ icon: Icon, num, label }) => (
            <MotionStaggerItem key={label} className="surface-card rounded-2xl p-6 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-3" />
              <p className="mb-1 font-serif text-3xl font-semibold text-foreground">{num}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </MotionStaggerItem>
          ))}
        </MotionStagger>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <MotionReveal>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-px bg-primary" />
              <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("about", "story.eyebrow")}</span>
            </div>
            <h2 className="mb-6 font-serif text-3xl font-medium text-foreground">
              {t("about", "story.title")}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px]">
              <p>{t("about", "story.paragraphOne")}</p>
              <p>{t("about", "story.paragraphTwo")}</p>
              <p>{t("about", "story.paragraphThree")}</p>
            </div>
            <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              Royal Plaza, Sushant Golf City, Sultanpur Road, Lucknow – 226030
            </div>
          </MotionReveal>
          <MotionStagger className="space-y-3">
            {VALUES.map((value) => (
              <MotionStaggerItem key={value.title}>
                <div className="surface-card rounded-2xl p-5">
                  <p className="mb-2 text-sm font-medium text-foreground">{value.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{value.desc}</p>
                </div>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>

        {/* Team */}
        <MotionReveal>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("about", "team.eyebrow")}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="surface-card rounded-[1.6rem] p-7">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-lg font-semibold text-primary">{member.initials}</span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-primary mt-0.5">
                      {member.initials === "MR"
                        ? t("about", "team.founderRole")
                        : t("about", "team.advisoryRole")}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {member.initials === "MR"
                    ? t("about", "team.founderBio")
                    : t("about", "team.advisoryBio")}
                </p>
              </div>
            ))}
          </div>
        </MotionReveal>

        {/* Partner Proof */}
        <div className="space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("about", "proof.eyebrow")}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {companies.map((company) => (
              <Link
                key={company._id}
                href={localizeHref(locale, `/companies/${company.slug}`)}
                className="surface-card interactive-card group rounded-[1.6rem] p-5"
              >
                <div className="h-16 rounded-xl border border-border bg-background flex items-center justify-center p-4">
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={140}
                      height={48}
                      className="max-h-10 w-auto object-contain"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="mt-4 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {company.name}
                </p>
              </Link>
            ))}
          </div>

          {caseStudies.length > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {caseStudies.map((caseStudy) => (
                <Link
                  key={caseStudy._id}
                  href={localizeHref(locale, `/case-studies/${caseStudy.slug}`)}
                  className="surface-card interactive-card group rounded-[1.6rem] p-6"
                >
                  <p className="text-[10px] text-primary uppercase tracking-widest font-medium">{t("about", "proof.featuredStory")}</p>
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
                  <span className="mt-5 inline-flex items-center gap-2 text-sm text-primary group-hover:text-primary-light transition-colors">
                    {t("about", "proof.readCaseStudy")} <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Compliance */}
        <div className="surface-card rounded-[1.8rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <BadgeCheck className="h-5 w-5 text-secondary" />
            <h2 className="font-serif text-xl font-medium text-foreground">{t("about", "compliance.title")}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              t("about", "compliance.one"),
              t("about", "compliance.two"),
              t("about", "compliance.three"),
              t("about", "compliance.four"),
            ].map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
