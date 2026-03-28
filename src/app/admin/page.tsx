import Link from "next/link";
import { requireAuth } from "@/lib/auth/utils";
import { Building2, Users2, MessageSquare, CalendarCheck, TrendingUp, ArrowUpRight } from "lucide-react";
import { getPropertyStats } from "@/lib/db/actions/property.actions";
import { getLeadStats } from "@/lib/db/actions/lead.actions";
import { getEnquiryStats } from "@/lib/db/actions/enquiry.actions";
import { getUpcomingVisits, getSiteVisitStats } from "@/lib/db/actions/sitevisit.actions";
import { LEAD_STAGE_LABELS } from "@/lib/utils/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminPage() {
  const user = await requireAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [propertyStats, leadStats, enquiryStats, visitStats, upcomingVisits] =
    await Promise.all([
      getPropertyStats(),
      getLeadStats(),
      getEnquiryStats(),
      getSiteVisitStats(),
      getUpcomingVisits(5),
    ]);

  const ps = propertyStats.data;
  const ls = leadStats.data;
  const es = enquiryStats.data;
  const vs = visitStats.data;
  const uv = upcomingVisits.data ?? [];

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">
            {greeting}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Properties", value: ps?.active ?? "—", sub: `${ps?.total ?? 0} total`, icon: Building2, color: "text-primary", bg: "bg-primary/10" },
          { label: "New Enquiries", value: es?.new ?? "—", sub: `${es?.total ?? 0} total`, icon: MessageSquare, color: "text-foreground", bg: "bg-accent" },
          { label: "Active Leads", value: ls?.active ?? "—", sub: `${ls?.conversionRate ?? 0}% conversion`, icon: Users2, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Visits This Week", value: vs?.thisWeek ?? "—", sub: `${vs?.completed ?? 0} completed`, icon: CalendarCheck, color: "text-foreground", bg: "bg-accent" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="font-serif text-3xl font-medium text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Lead Pipeline
            </h2>
            <Link href="/admin/leads" className="flex items-center gap-1 text-xs text-primary hover:text-primary-light">
              View Kanban <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {ls?.byStage && Object.keys(ls.byStage).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(ls.byStage).filter(([, c]) => (c as number) > 0).sort(([, a], [, b]) => (b as number) - (a as number)).map(([stage, count]) => {
                const pct = Math.round(((count as number) / (ls.total || 1)) * 100);
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-36 flex-shrink-0 text-xs text-muted-foreground">{LEAD_STAGE_LABELS[stage] ?? stage}</span>
                    <div className="flex-1 bg-accent rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${stage === "converted" ? "bg-secondary" : stage === "lost" ? "bg-red-400/50" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs text-foreground">{count as number}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No leads yet. Convert your first enquiry to get started.</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> By Property Type
            </h2>
            <Link href="/admin/properties" className="flex items-center gap-1 text-xs text-primary hover:text-primary-light">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {ps?.byType && Object.keys(ps.byType).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(ps.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{type}</span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium text-foreground">{count as number}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-xs text-muted-foreground">Featured</span>
                <span className="text-xs text-primary font-medium">{ps.featured}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No properties yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" /> Upcoming Site Visits
            </h2>
            <Link href="/admin/site-visits" className="flex items-center gap-1 text-xs text-primary hover:text-primary-light">
              All visits <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {uv.length > 0 ? (
            <div className="space-y-3">
              {uv.map((visit) => (
                <div key={visit._id} className="flex items-start gap-3 rounded-lg border border-border bg-accent/40 p-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[9px] text-primary leading-none font-medium">{new Date(visit.scheduledAt).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</span>
                    <span className="text-sm text-primary font-semibold leading-tight">{new Date(visit.scheduledAt).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{visit.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{visit.propertyName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(visit.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}{visit.assignedAgentName ? ` · ${visit.assignedAgentName}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming site visits scheduled.</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Property", href: "/admin/properties/new", color: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" },
              { label: "View Enquiries", href: "/admin/enquiries", color: "bg-accent border-border text-foreground hover:bg-accent/80" },
              { label: "Leads Board", href: "/admin/leads", color: "bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/15" },
              { label: "Site Visits", href: "/admin/site-visits", color: "bg-accent border-border text-foreground hover:bg-accent/80" },
              ...(user.role !== "agent"
                ? [
                    { label: "Companies", href: "/admin/companies", color: "bg-accent border-border text-foreground hover:bg-accent/80" },
                    { label: "Microsites", href: "/admin/property-sites", color: "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" },
                  ]
                : []),
            ].map((a) => (
              <Link key={a.label} href={a.href} className={`flex items-center justify-center rounded-xl border px-3 py-4 text-sm font-medium transition-colors ${a.color}`}>{a.label}</Link>
            ))}
          </div>
          {ls?.bySource && Object.keys(ls.bySource).length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Lead Sources</p>
              <div className="space-y-1.5">
                {Object.entries(ls.bySource).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 4).map(([source, count]) => (
                  <div key={source} className="flex justify-between">
                    <span className="text-xs capitalize text-muted-foreground">{source.replace(/_/g, " ")}</span>
                    <span className="text-xs text-foreground">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
