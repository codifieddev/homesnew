import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Quote } from "lucide-react";
import { getCaseStudyPageData } from "@/lib/db/actions/case-study.actions";
import { PropertyCard } from "@/components/public/properties/PropertyCard";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudyRes = await getCaseStudyPageData(slug);
  if (!caseStudyRes.success || !caseStudyRes.data) {
    return { title: "Case Study Not Found" };
  }

  return {
    title: `${caseStudyRes.data.caseStudy.title} — Case Study`,
    description: caseStudyRes.data.caseStudy.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudyRes = await getCaseStudyPageData(slug);

  if (!caseStudyRes.success || !caseStudyRes.data) notFound();

  const { caseStudy, company, properties } = caseStudyRes.data;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-6xl space-y-14 px-4 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-border bg-card p-8 sm:p-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-7 bg-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-primary">
              Case Study
            </span>
          </div>
          <div className="max-w-4xl">
            <Link
              href={`/companies/${company.slug}`}
              className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              {company.name}
            </Link>
            <h1 className="mt-5 font-serif text-4xl font-semibold text-foreground sm:text-5xl">
              {caseStudy.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {caseStudy.summary}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {caseStudy.outcomes.map((outcome) => (
              <div
                key={`${outcome.label}-${outcome.value}`}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {outcome.label}
                </p>
                <p className="mt-2 font-serif text-3xl font-medium text-foreground">
                  {outcome.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-2xl font-medium text-foreground">
                The Challenge
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {caseStudy.challenge ||
                "Homes structured a clearer positioning layer around the property inventory, builder credibility, and lead routing workflow."}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <ArrowRight className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-2xl font-medium text-foreground">
                The Solution
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {caseStudy.solution ||
                "We combined listing structure, advisory-led copy, proof-led content, and CRM-aware enquiry capture inside the Homes platform."}
            </p>
          </div>
        </section>

        {caseStudy.testimonialQuote && (
          <section className="rounded-3xl border border-primary/15 bg-primary/10 p-8">
            <Quote className="h-8 w-8 text-primary" />
            <p className="mt-5 max-w-4xl font-serif text-2xl leading-relaxed text-foreground">
              {caseStudy.testimonialQuote}
            </p>
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
                Inventory Connected To This Story
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
