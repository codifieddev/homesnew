import { getLeadStats } from "@/lib/db/actions/lead.actions";
import { getPropertyStats } from "@/lib/db/actions/property.actions";
import { getEnquiryStats } from "@/lib/db/actions/enquiry.actions";
import { getSiteVisitStats } from "@/lib/db/actions/sitevisit.actions";
import { AnalyticsDashboard } from "@/components/dashboard/analytics/AnalyticsDashboard";
import { withRole } from "@/lib/auth/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await withRole(["super_admin", "admin"]);

  const [leadStats, propertyStats, enquiryStats, visitStats] = await Promise.all([
    getLeadStats(),
    getPropertyStats(),
    getEnquiryStats(),
    getSiteVisitStats(),
  ]);

  return (
    <AnalyticsDashboard
      leadStats={leadStats.data ?? null}
      propertyStats={propertyStats.data ?? null}
      enquiryStats={enquiryStats.data ?? null}
      visitStats={visitStats.data ?? null}
    />
  );
}
