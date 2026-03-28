"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Plus, Search, CheckCircle, XCircle,
  Star, Eye, Pencil, MoreHorizontal, Loader2,
  Building2, MapPin, BadgeCheck, Globe2,
} from "lucide-react";
import { toast } from "sonner";
import { togglePropertyStatus, toggleFeatured } from "@/lib/db/actions/property.actions";
import { formatINR } from "@/lib/utils/constants";
import type { IProperty } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface PropertyTableProps {
  properties: IProperty[];
  stats?: { total: number; active: number; sold: number; blocked: number; featured: number } | null;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  currentFilters: { status: string; type: string; search: string };
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  blocked: "bg-secondary/10 text-secondary border-secondary/20",
  sold: "bg-accent text-foreground border-border",
  archived: "bg-accent text-muted-foreground border-border",
};

// ─── ROW ACTIONS MENU ─────────────────────────────────────────────────────────

function RowActions({ property, onAction }: { property: IProperty; onAction: () => void }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleStatus = (status: "active" | "blocked" | "sold" | "archived") => {
    setOpen(false);
    startTransition(async () => {
      const res = await togglePropertyStatus(property._id!, status);
      if (res.success) { toast.success(res.message ?? "Updated"); onAction(); }
      else toast.error(res.error);
    });
  };

  const handleFeatured = () => {
    setOpen(false);
    startTransition(async () => {
      const res = await toggleFeatured(property._id!, !property.isFeatured);
      if (res.success) { toast.success(res.message ?? "Updated"); onAction(); }
      else toast.error(res.error);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 bg-card border border-border rounded-xl p-1.5 z-20 w-48 shadow-xl">
            <Link href={`/admin/properties/${property._id}/edit`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Pencil className="w-3.5 h-3.5" /> Edit Property
            </Link>
            <Link href={`/projects/${property.slug}`} target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Eye className="w-3.5 h-3.5" /> View Listing
            </Link>
            <Link href={`/admin/property-sites/new?propertyId=${property._id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Globe2 className="w-3.5 h-3.5" /> Manage Microsite
            </Link>
            <button onClick={handleFeatured} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Star className={`w-3.5 h-3.5 ${property.isFeatured ? "fill-primary text-primary" : ""}`} />
              {property.isFeatured ? "Remove Featured" : "Mark Featured"}
            </button>
            <div className="border-t border-border my-1" />
            {property.status !== "active" && (
              <button onClick={() => handleStatus("active")} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/10">
                <CheckCircle className="w-3.5 h-3.5" /> Set Active
              </button>
            )}
            {property.status === "active" && (
              <button onClick={() => handleStatus("blocked")} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:bg-secondary/10">
                <XCircle className="w-3.5 h-3.5" /> Block Listing
              </button>
            )}
            <button onClick={() => handleStatus("sold")} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent">
              <BadgeCheck className="w-3.5 h-3.5" /> Mark as Sold
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function PropertyTable({ properties, stats, pagination, currentFilters }: PropertyTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.search);

  const refresh = () => router.refresh();

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key !== "status") params.set("status", currentFilters.status);
    if (key !== "type") params.set("type", currentFilters.type);
    if (key !== "search") params.set("search", currentFilters.search);
    if (value) params.set(key, value);
    router.push(`/admin/properties?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter("search", search);
  };

  const STATUS_TABS = [
    { key: "active", label: "Active", count: stats?.active },
    { key: "sold", label: "Sold", count: stats?.sold },
    { key: "blocked", label: "Blocked", count: stats?.blocked },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-foreground">Properties</h1>
          <p className="mt-1 text-sm text-muted-foreground">{stats?.total ?? 0} total properties across all statuses.</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-foreground text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Active", value: stats.active, color: "text-primary" },
            { label: "Sold", value: stats.sold, color: "text-secondary" },
            { label: "Blocked", value: stats.blocked, color: "text-muted-foreground" },
            { label: "Featured", value: stats.featured, color: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-xl font-serif font-medium ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => applyFilter("status", tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentFilters.status === tab.key ? "bg-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
              {tab.count !== undefined && <span className="ml-1 opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties…"
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </form>
      </div>

      {/* Table */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
          <Building2 className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">No properties found</p>
          <p className="text-sm text-muted-foreground mt-1">Try changing your filters or add a new property.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Property", "Type", "Location", "Price", "Status", "Views", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] text-muted-foreground uppercase tracking-widest font-medium px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((property, i) => (
                <tr
                  key={property._id}
                  className={`border-b border-border transition-colors hover:bg-accent/40 ${i === properties.length - 1 ? "border-b-0" : ""}`}
                >
                  {/* Property name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Home className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="max-w-[200px] truncate text-sm font-medium leading-tight text-foreground">
                          {property.projectName || property.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-xs text-muted-foreground">{property.developerName}</p>
                          {property.isFeatured && (
                            <Star className="w-3 h-3 text-primary fill-primary" />
                          )}
                          {property.legalInfo?.reraRegistered && (
                            <BadgeCheck className="w-3 h-3 text-secondary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-md">
                      {property.specifications?.propertyType}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">{property.location?.locality}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-primary">
                      {property.financials?.listedPrice
                        ? formatINR(property.financials.listedPrice)
                        : "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-medium px-2 py-1 rounded-full border capitalize ${STATUS_STYLES[property.status] ?? STATUS_STYLES.archived}`}>
                      {property.status}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {property.viewCount ?? 0}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <RowActions property={property} onAction={refresh} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => router.push(`/admin/properties?status=${currentFilters.status}&page=${pagination.page - 1}`)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => router.push(`/admin/properties?status=${currentFilters.status}&page=${pagination.page + 1}`)}
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
