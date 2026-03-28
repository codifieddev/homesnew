import Link from "next/link";
import { getProperties } from "@/lib/db/actions/property.actions";
import { PropertyCard } from "@/components/public/properties/PropertyCard";
import { ProjectsFilter } from "@/components/public/properties/ProjectsFilter";
import { MotionReveal } from "@/components/shared/motion/MotionReveal";
import { getServerI18n } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();

  return {
    title: t("projects", "page.eyebrow"),
    description:
      "Browse all RERA-verified residential plots, apartments, and villas in Lucknow. Filter by type, location, and budget.",
  };
}

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string; search?: string; minPrice?: string;
    maxPrice?: string; possession?: string; page?: string;
  }>;
}) {
  const params = await searchParams;
  const { t, locale } = await getServerI18n();
  const page = Number(params.page) || 1;

  const res = await getProperties({
    status: "active",
    propertyType: params.type as never,
    search: params.search,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    possessionStatus: params.possession as never,
    page,
    limit: 12,
    sortBy: "isFeatured",
    sortOrder: "desc",
  });

  const properties = res.data ?? [];
  const pagination = res.pagination;

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <MotionReveal className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">{t("projects", "page.eyebrow")}</span>
          </div>
          <h1 className="mb-3 font-serif text-4xl font-medium text-foreground sm:text-5xl">
            {t("projects", "page.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("projects", "page.countSummary", {
              count: pagination?.total ?? properties.length,
            })}
          </p>
        </MotionReveal>

        {/* Filters */}
        <ProjectsFilter currentFilters={params} />

        {/* Grid */}
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-5">
              <span className="text-2xl">🏠</span>
            </div>
            <p className="mb-2 text-lg font-medium text-foreground">{t("projects", "page.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or&nbsp;
              {t("projects", "page.emptyDescription")}{" "}
              <Link href={localizeHref(locale, "/projects")} className="text-primary hover:underline">{t("projects", "page.clearAllLink")}</Link>.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-14">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={localizeHref(
                      locale,
                      `/projects?page=${p}${params.type ? `&type=${params.type}` : ""}${params.search ? `&search=${params.search}` : ""}`
                    )}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                      p === pagination.page
                        ? "bg-primary text-foreground"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
