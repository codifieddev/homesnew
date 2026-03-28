import { MetadataRoute } from "next";
import { getAllPropertySlugs } from "@/lib/db/actions/property.actions";
import { getPublishedCompanies } from "@/lib/db/actions/company.actions";
import { getPublishedCaseStudies } from "@/lib/db/actions/case-study.actions";
import { getAllPublishedPropertySiteSlugs } from "@/lib/db/actions/property-site.actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://homes.in";

  const [slugs, companiesRes, caseStudiesRes, siteSlugs] = await Promise.all([
    getAllPropertySlugs(),
    getPublishedCompanies(),
    getPublishedCaseStudies(),
    getAllPublishedPropertySiteSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl,                priority: 1.0,  changeFrequency: "weekly" },
    { url: `${baseUrl}/projects`,  priority: 0.9,  changeFrequency: "daily" },
    { url: `${baseUrl}/companies`, priority: 0.7,  changeFrequency: "weekly" },
    { url: `${baseUrl}/case-studies`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${baseUrl}/about`,     priority: 0.6,  changeFrequency: "monthly" },
    { url: `${baseUrl}/contact`,   priority: 0.7,  changeFrequency: "monthly" },
    { url: `${baseUrl}/services`,  priority: 0.6,  changeFrequency: "monthly" },
    { url: `${baseUrl}/blogs`,     priority: 0.7,  changeFrequency: "weekly" },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    priority: 0.85,
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
  }));

  const companyRoutes: MetadataRoute.Sitemap = (companiesRes.data ?? []).map(
    (company) => ({
      url: `${baseUrl}/companies/${company.slug}`,
      priority: 0.75,
      changeFrequency: "weekly" as const,
      lastModified: company.updatedAt ?? new Date(),
    })
  );

  const caseStudyRoutes: MetadataRoute.Sitemap = (caseStudiesRes.data ?? []).map(
    (caseStudy) => ({
      url: `${baseUrl}/case-studies/${caseStudy.slug}`,
      priority: 0.75,
      changeFrequency: "weekly" as const,
      lastModified: caseStudy.updatedAt ?? new Date(),
    })
  );

  const siteRoutes: MetadataRoute.Sitemap = siteSlugs.map((siteSlug) => ({
    url: `${baseUrl}/sites/${siteSlug}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...propertyRoutes,
    ...companyRoutes,
    ...caseStudyRoutes,
    ...siteRoutes,
  ];
}
