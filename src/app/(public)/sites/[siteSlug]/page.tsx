import { notFound } from "next/navigation";
import {
  getAllPublishedPropertySiteSlugs,
  getPublishedPropertySiteBySlug,
} from "@/lib/db/actions/property-site.actions";
import { PropertySiteLanding } from "@/components/public/property-sites/PropertySiteLanding";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = await getAllPublishedPropertySiteSlugs();
  return slugs.map((siteSlug) => ({ siteSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}): Promise<Metadata> {
  const { siteSlug } = await params;
  const siteRes = await getPublishedPropertySiteBySlug(siteSlug);
  if (!siteRes.success || !siteRes.data) {
    return { title: "Microsite Not Found" };
  }

  const { site, property } = siteRes.data;
  const title = site.seo?.title || site.heroTitle || property.projectName || property.title;
  const description =
    site.seo?.description || property.tagline || property.description?.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.mediaAssets?.find((asset) => asset.isCover)?.url
        ? [{ url: property.mediaAssets.find((asset) => asset.isCover)!.url }]
        : [],
    },
  };
}

export default async function PropertySitePage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const siteRes = await getPublishedPropertySiteBySlug(siteSlug);

  if (!siteRes.success || !siteRes.data) notFound();

  return <PropertySiteLanding {...siteRes.data} />;
}
