"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck, Phone, Building2, User,
  CheckCircle, XCircle, Clock, Loader2, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { updateSiteVisitStatus } from "@/lib/db/actions/sitevisit.actions";
import { LEAD_SOURCES, LEAD_SOURCE_LABELS } from "@/lib/utils/constants";
import type { ICompany, IPropertySite, ISiteVisit } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface SiteVisitsViewProps {
  visits: ISiteVisit[];
  upcoming: ISiteVisit[];
  stats?: {
    total: number; scheduled: number; completed: number;
    noShow: number; thisWeek: number; conversionRate: number;
  } | null;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  currentStatus: string;
  currentCompanyId?: string;
  currentPropertySiteId?: string;
  currentSource?: string;
  companies: ICompany[];
  sites: IPropertySite[];
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-secondary/10 text-secondary border-secondary/20",
  no_show: "bg-red-500/10 text-red-400 border-red-500/20",
  rescheduled: "bg-accent text-foreground border-border",
  cancelled: "bg-accent text-muted-foreground border-border",
};

const OUTCOME_STYLES: Record<string, string> = {
  positive: "text-secondary",
  converted: "text-foreground",
  neutral: "text-muted-foreground",
  negative: "text-red-400",
  pending: "text-muted-foreground",
};

// ─── VISIT CARD ───────────────────────────────────────────────────────────────

function VisitCard({ visit, onAction }: { visit: ISiteVisit; onAction: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [updating, setUpdating] = useState<string | null>(null);

  const handle = (status: string, outcome?: string) => {
    setUpdating(status);
    startTransition(async () => {
      const res = await updateSiteVisitStatus({ visitId: visit._id!, status, outcome });
      if (res.success) { toast.success(res.message ?? "Updated"); onAction(); }
      else toast.error(res.error);
      setUpdating(null);
    });
  };

  const scheduledDate = new Date(visit.scheduledAt);
  const isUpcoming = scheduledDate > new Date();
  const statusStyle = STATUS_STYLES[visit.status] ?? STATUS_STYLES.cancelled;

  return (
    <div className={`bg-card border rounded-xl p-5 transition-all ${visit.status === "scheduled" ? "border-primary/15" : "border-border"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          {/* Date block */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-[9px] text-primary font-medium leading-none">
              {scheduledDate.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
            </span>
            <span className="text-lg font-serif font-semibold text-primary leading-tight">
              {scheduledDate.getDate()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{visit.clientName}</p>
            <a href={`tel:${visit.clientPhone}`} className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
              <Phone className="w-3 h-3" /> {visit.clientPhone}
            </a>
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />
              {scheduledDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              {!isUpcoming && " · " + scheduledDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        <span className={`text-[11px] font-medium px-2 py-1 rounded-full border capitalize flex-shrink-0 ${statusStyle}`}>
          {visit.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Property + Agent */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {visit.propertyName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="w-3 h-3 flex-shrink-0 text-primary" />
            <span className="truncate">{visit.propertyName}</span>
          </div>
        )}
        {visit.assignedAgentName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{visit.assignedAgentName}</span>
          </div>
        )}
      </div>

      {visit.source && (
        <div className="mb-4">
          <span className="rounded-full bg-accent px-2 py-1 text-[11px] text-muted-foreground">
            {LEAD_SOURCE_LABELS[visit.source] ?? visit.source}
          </span>
        </div>
      )}

      {/* Outcome */}
      {visit.outcome && visit.outcome !== "pending" && (
        <p className={`text-xs font-medium mb-3 capitalize ${OUTCOME_STYLES[visit.outcome]}`}>
          Outcome: {visit.outcome}
        </p>
      )}

      {/* Agent notes */}
      {visit.agentNotes && (
        <p className="mb-3 rounded-lg border border-border bg-accent/40 px-3 py-2 text-xs text-muted-foreground line-clamp-2">
          {visit.agentNotes}
        </p>
      )}

      {/* Actions for scheduled visits */}
      {visit.status === "scheduled" && (
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <button
            onClick={() => handle("completed", "positive")}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-medium bg-secondary/10 hover:bg-secondary/15 text-secondary border border-secondary/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            {updating === "completed" && isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Completed
          </button>
          <button
            onClick={() => handle("no_show")}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            {updating === "no_show" && isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
            No Show
          </button>
          <button
            onClick={() => handle("cancelled")}
            disabled={isPending}
            className="ml-auto px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "no_show", label: "No Show" },
  { key: "all", label: "All" },
];

export function SiteVisitsView({
  visits,
  upcoming,
  stats,
  pagination,
  currentStatus,
  currentCompanyId,
  currentPropertySiteId,
  currentSource,
  companies,
  sites,
}: SiteVisitsViewProps) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const navigate = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const next = {
      status: currentStatus,
      companyId: currentCompanyId,
      propertySiteId: currentPropertySiteId,
      source: currentSource,
      ...overrides,
    };

    Object.entries(next).forEach(([key, value]) => {
      if (!value) return;
      if (key === "page" && value === "1") return;
      params.set(key, value);
    });

    router.push(`/admin/site-visits${params.size ? `?${params.toString()}` : ""}`);
  };

  const setStatus = (status: string) => navigate({ status, page: undefined });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Site Visits</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage scheduled property walkthroughs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          value={currentCompanyId ?? ""}
          onChange={(event) =>
            navigate({ companyId: event.target.value || undefined, page: undefined })
          }
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
        >
          <option value="">All companies</option>
          {companies.map((company) => (
            <option key={company._id} value={company._id}>
              {company.name}
            </option>
          ))}
        </select>
        <select
          value={currentPropertySiteId ?? ""}
          onChange={(event) =>
            navigate({
              propertySiteId: event.target.value || undefined,
              page: undefined,
            })
          }
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
        >
          <option value="">All microsites</option>
          {sites.map((site) => (
            <option key={site._id} value={site._id}>
              /sites/{site.siteSlug}
            </option>
          ))}
        </select>
        <select
          value={currentSource ?? ""}
          onChange={(event) =>
            navigate({ source: event.target.value || undefined, page: undefined })
          }
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
        >
          <option value="">All sources</option>
          {LEAD_SOURCES.map((source) => (
            <option key={source} value={source}>
              {LEAD_SOURCE_LABELS[source]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            navigate({
              companyId: undefined,
              propertySiteId: undefined,
              source: undefined,
              page: undefined,
            })
          }
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Clear
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: "Scheduled", value: stats.scheduled, color: "text-primary" },
            { label: "Completed", value: stats.completed, color: "text-secondary" },
            { label: "No Show", value: stats.noShow, color: "text-red-400" },
            { label: "This Week", value: stats.thisWeek, color: "text-foreground" },
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Conv. Rate", value: `${stats.conversionRate}%`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-lg font-serif font-medium ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming quick view */}
      {upcoming.length > 0 && currentStatus === "scheduled" && (
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
          <p className="text-xs text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Next Up
          </p>
          <div className="flex gap-3 flex-wrap">
            {upcoming.map((v) => (
              <div key={v._id} className="bg-background border border-border rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-foreground">{v.clientName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(v.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {" at "}
                  {new Date(v.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-all -mb-px ${currentStatus === tab.key ? "text-primary border-primary font-medium" : "text-muted-foreground border-transparent hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visits list */}
      {visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <CalendarCheck className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">No site visits here</p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStatus === "scheduled" ? "No upcoming visits scheduled." : "No visits match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <VisitCard key={visit._id} visit={visit} onAction={refresh} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => navigate({ page: String(pagination.page - 1) })} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40">Previous</button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => navigate({ page: String(pagination.page + 1) })} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
