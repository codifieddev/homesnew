import { notFound } from "next/navigation";
import { withRole } from "@/lib/auth/utils";
import { getPropertySitePreviewById } from "@/lib/db/actions/property-site.actions";
import { PropertySiteLanding } from "@/components/public/property-sites/PropertySiteLanding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Microsite Preview",
};

export default async function PropertySitePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await withRole(["super_admin", "admin", "company_manager"]);
  const { id } = await params;
  const previewRes = await getPropertySitePreviewById(id);

  if (!previewRes.success || !previewRes.data) notFound();

  return <PropertySiteLanding {...previewRes.data} preview />;
}
