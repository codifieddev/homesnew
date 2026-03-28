"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users2, Phone, Building2, ChevronRight,
  Loader2, Star, TrendingUp, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { updateLeadStage } from "@/lib/db/actions/lead.actions";
import {
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
} from "@/lib/utils/constants";
import type { ICompany, ILead, IPropertySite, LeadStage } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface LeadsKanbanProps {
  boardData: Record<LeadStage, ILead[]>;
  stats?: {
    total: number; active: number; converted: number;
    lost: number; conversionRate: number;
  } | null;
  currentCompanyId?: string;
  currentPropertySiteId?: string;
  currentSource?: string;
  companies: ICompany[];
  sites: IPropertySite[];
}

// ─── STAGE CONFIG ─────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<LeadStage, { color: string; dot: string; border: string }> = {
  new:                   { color: "text-primary",         dot: "bg-primary",         border: "border-primary/20" },
  contacted:             { color: "text-foreground",      dot: "bg-foreground",      border: "border-foreground/10" },
  qualified:             { color: "text-secondary",       dot: "bg-secondary",       border: "border-secondary/20" },
  site_visit_scheduled:  { color: "text-primary",         dot: "bg-primary-light",   border: "border-primary/25" },
  negotiation:           { color: "text-muted-foreground",dot: "bg-muted-foreground",border: "border-border" },
  converted:             { color: "text-secondary",       dot: "bg-secondary",       border: "border-secondary/20" },
  lost:                  { color: "text-red-400",         dot: "bg-red-400/60",      border: "border-red-500/20" },
};

const VISIBLE_STAGES: LeadStage[] = [
  "new", "contacted", "qualified",
  "site_visit_scheduled", "negotiation",
];

// ─── LEAD CARD ────────────────────────────────────────────────────────────────

function LeadCard({ lead, onAction }: {
  lead: ILead;
  onAction: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showMove, setShowMove] = useState(false);
  const [renderedAt] = useState(() => Date.now());

  const currentStageIndex = LEAD_STAGES.indexOf(lead.stage);
  const nextStage = LEAD_STAGES[currentStageIndex + 1] as LeadStage | undefined;
  const config = STAGE_CONFIG[lead.stage];

  const moveToNext = () => {
    if (!nextStage) return;
    startTransition(async () => {
      const res = await updateLeadStage({ leadId: lead._id!, stage: nextStage });
      if (res.success) {
        toast.success(res.message ?? "Stage updated");
        onAction();
      } else toast.error(res.error);
    });
  };

  const moveTo = (stage: LeadStage) => {
    startTransition(async () => {
      const res = await updateLeadStage({ leadId: lead._id!, stage });
      if (res.success) {
        toast.success(res.message ?? "Stage updated");
        setShowMove(false);
        onAction();
      } else toast.error(res.error);
    });
  };

  // Days since created
  const days = lead.createdAt
    ? Math.floor((renderedAt - new Date(lead.createdAt).getTime()) / 86400000)
    : 0;

  return (
    <div className={`bg-background border rounded-xl p-4 hover:border-border transition-all group relative ${config.border}`}>
      {/* Lead name + score */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-foreground">{lead.name}</p>
          <a href={`tel:${lead.phone}`} className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary">
            <Phone className="w-3 h-3" /> {lead.phone}
          </a>
        </div>
        {lead.score !== undefined && lead.score > 0 && (
          <div className="flex items-center gap-0.5 text-[11px] text-primary">
            <Star className="w-3 h-3 fill-primary" />
            {lead.score}
          </div>
        )}
      </div>

      {/* Property */}
      {lead.propertyName && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{lead.propertyName}</span>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-muted-foreground">
          {LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
        </span>
      </div>

      {/* Interests */}
      {lead.interestedIn && lead.interestedIn.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {lead.interestedIn.map((i) => (
            <span key={i} className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
              {i.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          {/* Agent avatar */}
          {lead.assignedAgentName ? (
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-primary">
                {lead.assignedAgentName.charAt(0)}
              </span>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <Users2 className="w-2.5 h-2.5 text-muted-foreground" />
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">{days}d</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Move menu */}
          <div className="relative">
            <button
              onClick={() => setShowMove((v) => !v)}
              className="rounded px-1.5 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Move
            </button>
            {showMove && (
              <div className="absolute right-0 bottom-7 bg-card border border-border rounded-xl p-1.5 z-20 w-44 shadow-xl">
                {LEAD_STAGES.filter((s) => s !== lead.stage && s !== "lost").map((s) => (
                  <button
                    key={s}
                    onClick={() => moveTo(s)}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${STAGE_CONFIG[s].dot}`} />
                    {LEAD_STAGE_LABELS[s]}
                  </button>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => moveTo("lost")}
                    disabled={isPending}
                    className="w-full text-left text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/60" />
                    Mark Lost
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Next stage shortcut */}
          {nextStage && nextStage !== "converted" && nextStage !== "lost" && (
            <button
              onClick={moveToNext}
              disabled={isPending}
              className="flex items-center gap-0.5 text-[10px] text-primary hover:text-primary-light font-medium transition-colors"
            >
              {isPending ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {/* Detail link */}
          <Link
            href={`/admin/leads/${lead._id}`}
            className="text-[10px] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── KANBAN COLUMN ────────────────────────────────────────────────────────────

function KanbanColumn({ stage, leads, onAction }: {
  stage: LeadStage;
  leads: ILead[];
  onAction: () => void;
}) {
  const config = STAGE_CONFIG[stage];
  return (
    <div className="flex flex-col min-w-[240px] w-[240px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-xs font-medium ${config.color}`}>
            {LEAD_STAGE_LABELS[stage]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 flex-1">
        {leads.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">No leads</p>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onAction={onAction} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── MAIN KANBAN BOARD ────────────────────────────────────────────────────────

export function LeadsKanban({
  boardData,
  stats,
  currentCompanyId,
  currentPropertySiteId,
  currentSource,
  companies,
  sites,
}: LeadsKanbanProps) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const navigate = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const next = {
      companyId: currentCompanyId,
      propertySiteId: currentPropertySiteId,
      source: currentSource,
      ...overrides,
    };

    Object.entries(next).forEach(([key, value]) => {
      if (!value) return;
      params.set(key, value);
    });

    router.push(`/admin/leads${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Leads Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track leads through your conversion pipeline.
          </p>
        </div>
        <Link
          href="/admin/leads/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-foreground text-sm font-medium rounded-lg transition-colors"
        >
          <Users2 className="w-4 h-4" /> Add Lead
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          value={currentCompanyId ?? ""}
          onChange={(event) =>
            navigate({ companyId: event.target.value || undefined })
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
            navigate({ propertySiteId: event.target.value || undefined })
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
            navigate({ source: event.target.value || undefined })
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
            })
          }
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Clear
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Active", value: stats.active, color: "text-primary" },
            { label: "Converted", value: stats.converted, color: "text-secondary" },
            { label: "Lost", value: stats.lost, color: "text-red-400" },
            { label: "Conv. Rate", value: `${stats.conversionRate}%`, color: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-xl font-serif font-medium ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Converted + Lost summary */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <div className="flex gap-4 flex-wrap">
            {["converted", "lost"].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${STAGE_CONFIG[s as LeadStage].dot}`} />
                <span className="text-xs capitalize text-muted-foreground">{LEAD_STAGE_LABELS[s]}</span>
                <span className="text-xs font-medium text-foreground">{boardData[s as LeadStage]?.length ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: `${VISIBLE_STAGES.length * 256}px` }}>
          {VISIBLE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={boardData[stage] ?? []}
              onAction={refresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
