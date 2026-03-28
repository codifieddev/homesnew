import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Globe2,
  MapPin,
  Phone,
} from "lucide-react";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { getCompanyProfileBySlug } from "@/lib/db/actions/company.actions";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { PropertyCard } from "@/components/public/properties/PropertyCard";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const companyRes = await getCompanyProfileBySlug(slug);
  if (!companyRes.success || !companyRes.data) {
    return { title: "Company Not Found" };
  }

  return {
    title: `${companyRes.data.company.name} — Company Profile`,
    description:
      companyRes.data.company.shortIntro ||
      companyRes.data.company.fullProfile?.slice(0, 160),
  };
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const companyRes = await getCompanyProfileBySlug(slug);

  if (!companyRes.success || !companyRes.data) notFound();

  const { company, properties, caseStudies } = companyRes.data;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-7 bg-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-primary">
                Company Profile
              </span>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card p-4">
                {company.logo ? (
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={80}
                    height={80}
                    className="max-h-14 w-auto object-contain"
                  />
                ) : (
                  <BriefcaseBusiness className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
                  {company.name}
                </h1>
                {company.shortIntro && (
                  <p className="mt-2 text-base text-muted-foreground">
                    {company.shortIntro}
                  </p>
                )}
              </div>
            </div>

            <div className="max-w-3xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                {company.fullProfile ||
                  "Homes uses company profiles to connect partner credibility with property listings, case studies, and buyer conversations across the main site and microsite network."}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  icon: Building2,
                  label: "Linked Properties",
                  value: properties.length,
                },
                {
                  icon: BadgeCheck,
                  label: "Published Case Studies",
                  value: caseStudies.length,
                },
                {
                  icon: Globe2,
                  label: "Microsite Ready",
                  value: "Yes",
                },
                {
                  icon: BriefcaseBusiness,
                  label: "Theme Preset",
                  value: company.themePreset.replace(/_/g, " "),
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <Icon className="mb-3 h-4 w-4 text-primary" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-medium text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-serif text-2xl font-medium text-foreground">
              Contact & Enquire
            </h2>
            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              {company.contact?.phone && (
                <a
                  href={`tel:${company.contact.phone}`}
                  className="flex items-center gap-3 transition-colors hover:text-foreground"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {company.contact.phone}
                </a>
              )}
              {company.address?.line1 && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    {[
                      company.address.line1,
                      company.address.locality,
                      company.address.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-background p-5">
              <EnquiryForm
                companyId={company._id}
                variant="inline"
                className="space-y-3"
              />
            </div>
          </aside>
        </section>

        {caseStudies.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px w-7 bg-primary" />
                  <span className="text-xs font-medium uppercase tracking-widest text-primary">
                    Case Studies
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-medium text-foreground">
                  Proof of Work
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {caseStudies.map((caseStudy) => (
                <Link
                  key={caseStudy._id}
                  href={`/case-studies/${caseStudy.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25"
                >
                  <h3 className="font-serif text-2xl font-medium text-foreground transition-colors group-hover:text-primary">
                    {caseStudy.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {caseStudy.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {caseStudy.outcomes.slice(0, 3).map((outcome) => (
                      <span
                        key={`${outcome.label}-${outcome.value}`}
                        className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary"
                      >
                        {outcome.label}: {outcome.value}
                      </span>
                    ))}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:text-primary-light">
                    Read case study <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {properties.length > 0 && (
          <section className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-7 bg-primary" />
                <span className="text-xs font-medium uppercase tracking-widest text-primary">
                  Linked Properties
                </span>
              </div>
              <h2 className="font-serif text-3xl font-medium text-foreground">
                Listings Connected To This Company
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
