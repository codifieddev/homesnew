import { getAdminProperties, getPropertyStats } from "@/lib/db/actions/property.actions";
import { PropertyTable } from "@/components/dashboard/properties/PropertyTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Properties" };

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [propertiesRes, statsRes] = await Promise.all([
    getAdminProperties({
      status: (params.status as "active" | "archived" | "sold" | "blocked") || "active",
      propertyType: params.type as never,
      search: params.search,
      page,
      limit: 15,
    }),
    getPropertyStats(),
  ]);

  return (
    <PropertyTable
      properties={propertiesRes.data ?? []}
      pagination={propertiesRes.pagination}
      stats={statsRes.data}
      currentFilters={{
        status: params.status || "active",
        type: params.type || "",
        search: params.search || "",
      }}
    />
  );
}
