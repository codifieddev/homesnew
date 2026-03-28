"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Phone, Mail, Building2, CheckCircle,
  ArrowUpRight, Loader2, Clock, Filter
} from "lucide-react";
import { toast } from "sonner";
import {
  markEnquiryReviewed,
  markEnquirySpam,
  convertEnquiryToLead,
} from "@/lib/db/actions/enquiry.actions";
import { LEAD_SOURCES, LEAD_SOURCE_LABELS } from "@/lib/utils/constants";
import type { ICompany, IEnquiry, IPropertySite } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface EnquiryInboxProps {
  enquiries: IEnquiry[];
  stats?: { new: number; reviewed: number; converted: number; total: number } | null;
  currentStatus: string;
  currentCompanyId?: string;
  currentPropertySiteId?: string;
  currentSource?: string;
  companies: ICompany[];
  sites: IPropertySite[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "new", label: "New", color: "text-primary" },
  { key: "reviewed", label: "Reviewed", color: "text-secondary" },
  { key: "converted", label: "Converted", color: "text-foreground" },
  { key: "all", label: "All", color: "text-muted-foreground" },
];

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── ENQUIRY CARD ─────────────────────────────────────────────────────────────

function EnquiryCard({ enquiry, onAction }: {
  enquiry: IEnquiry;
  onAction: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleReview = () => {
    setLoadingAction("review");
    startTransition(async () => {
      const res = await markEnquiryReviewed(enquiry._id!);
      if (res.success) { toast.success("Marked as reviewed"); onAction(); }
      else toast.error(res.error);
      setLoadingAction(null);
    });
  };

  const handleConvert = () => {
    setLoadingAction("convert");
    startTransition(async () => {
      const res = await convertEnquiryToLead(enquiry._id!);
      if (res.success) { toast.success(res.message ?? "Converted to lead!"); onAction(); }
      else toast.error(res.error);
      setLoadingAction(null);
    });
  };

  const handleSpam = () => {
    setLoadingAction("spam");
    startTransition(async () => {
      const res = await markEnquirySpam(enquiry._id!);
      if (res.success) { toast.success("Marked as spam"); onAction(); }
      else toast.error(res.error);
      setLoadingAction(null);
    });
  };

  const isNew = enquiry.status === "new";
  const isConverted = enquiry.status === "converted";

  return (
    <div className={`bg-card border rounded-xl p-5 transition-all ${isNew ? "border-primary/20" : "border-border"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">
              {enquiry.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{enquiry.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-3 h-3" /> {enquiry.phone}
              </a>
              {enquiry.email && (
                <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-3 h-3" /> {enquiry.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isNew && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(enquiry.createdAt!)}
          </span>
        </div>
      </div>

      {/* Property reference */}
      {enquiry.propertyName && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-accent/40 p-2.5">
          <Building2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-xs text-muted-foreground">{enquiry.propertyName}</span>
        </div>
      )}

      {/* Interests */}
      {enquiry.interestedIn && enquiry.interestedIn.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {enquiry.interestedIn.map((interest) => (
            <span key={interest} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
              {interest.replace(/_/g, " ")}
            </span>
          ))}
          {enquiry.budgetRange && (
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-secondary/20 bg-secondary/10 text-secondary">
              {enquiry.budgetRange}
            </span>
          )}
        </div>
      )}

      {/* Message */}
      {enquiry.message && (
        <p className="mb-3 rounded-lg border border-border bg-accent/40 px-3 py-2.5 text-xs text-muted-foreground line-clamp-2">
          &quot;{enquiry.message}&quot;
        </p>
      )}

      {/* Source badge */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground capitalize bg-accent px-2 py-1 rounded-md">
          via {enquiry.source?.replace(/_/g, " ") ?? "website"}
        </span>

        {/* Actions */}
        {!isConverted ? (
          <div className="flex items-center gap-2">
            {isNew && (
              <button
                onClick={handleSpam}
                disabled={isPending}
                className="text-xs text-muted-foreground hover:text-red-400 transition-colors px-2 py-1"
              >
                Spam
              </button>
            )}
            {isNew && (
              <button
                onClick={handleReview}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              >
                {loadingAction === "review" && isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Review
              </button>
            )}
            <button
              onClick={handleConvert}
              disabled={isPending}
              className="text-xs font-medium bg-primary hover:bg-primary-light text-foreground px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              {loadingAction === "convert" && isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpRight className="w-3 h-3" />}
              Convert to Lead
            </button>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-primary">
            <CheckCircle className="w-3.5 h-3.5" /> Converted
          </span>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function EnquiryInbox({
  enquiries,
  stats,
  currentStatus,
  currentCompanyId,
  currentPropertySiteId,
  currentSource,
  companies,
  sites,
  pagination,
}: EnquiryInboxProps) {
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

    router.push(`/admin/enquiries${params.size ? `?${params.toString()}` : ""}`);
  };

  const setStatus = (status: string) => navigate({ status, page: undefined });
  const setFilter = (
    key: "companyId" | "propertySiteId" | "source",
    value: string
  ) => navigate({ [key]: value || undefined, page: undefined });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Enquiry Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review public form submissions and convert them to leads.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          {pagination?.total ?? 0} total
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          value={currentCompanyId ?? ""}
          onChange={(event) => setFilter("companyId", event.target.value)}
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
          onChange={(event) => setFilter("propertySiteId", event.target.value)}
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
          onChange={(event) => setFilter("source", event.target.value)}
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

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "New", value: stats.new, color: "text-primary", bg: "bg-primary/10" },
            { label: "Reviewed", value: stats.reviewed, color: "text-secondary", bg: "bg-secondary/10" },
            { label: "Converted", value: stats.converted, color: "text-foreground", bg: "bg-accent" },
            { label: "Total", value: stats.total, color: "text-foreground", bg: "bg-accent" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="mb-1 text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-serif font-medium ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => {
          const isActive = currentStatus === tab.key;
          const count = tab.key === "new" ? stats?.new : tab.key === "reviewed" ? stats?.reviewed : tab.key === "converted" ? stats?.converted : stats?.total;
          return (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`px-4 py-2.5 text-sm border-b-2 transition-all -mb-px ${isActive ? `${tab.color} border-current font-medium` : "text-muted-foreground border-transparent hover:text-foreground"}`}
            >
              {tab.label}
              {count !== undefined && (
                <span className={`ml-1.5 text-xs ${isActive ? "" : "text-muted-foreground"}`}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Enquiry list */}
      {enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">No enquiries here</p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentStatus === "new" ? "All caught up! New enquiries will appear here." : "No enquiries match this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <EnquiryCard key={enquiry._id} enquiry={enquiry} onAction={refresh} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => navigate({ page: String(pagination.page - 1) })}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => navigate({ page: String(pagination.page + 1) })}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
