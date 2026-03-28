"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import SiteVisit from "@/lib/db/models/SiteVisit";
import Lead from "@/lib/db/models/Lead";
import { getScopedDashboardAccess, scopedIdsFilter } from "@/lib/db/actions/access";
import {
  requireObjectId,
  serialize,
  toObjectId,
} from "@/lib/db/actions/helpers";
import {
  SiteVisitValidator,
  SiteVisitStatusUpdateValidator,
  type SiteVisitInput,
} from "@/lib/utils/validators";
import type { ApiResponse, ISiteVisit } from "@/types";

type SiteVisitFilters = {
  status?: string;
  agentId?: string;
  propertyId?: string;
  companyId?: string;
  propertySiteId?: string;
  source?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getActorId(userId: string, actionName: string) {
  return requireObjectId(userId, `${actionName}: session user id`).toString();
}

function canAccessSiteVisit(
  access: Awaited<ReturnType<typeof getScopedDashboardAccess>>,
  visit: {
    propertyId?: unknown;
    companyId?: unknown;
  }
) {
  if (!access.isCompanyManager) return true;

  const propertyId = String(visit.propertyId ?? "");
  if (propertyId) {
    return access.propertyIds.includes(propertyId);
  }

  const companyId = String(visit.companyId ?? "");
  if (companyId) {
    return access.companyIds.includes(companyId);
  }

  return false;
}

function applySiteVisitScope(
  query: Record<string, unknown>,
  access: Awaited<ReturnType<typeof getScopedDashboardAccess>>
) {
  if (!access.isCompanyManager) return true;
  if (!access.companyIds.length && !access.propertyIds.length) return false;

  query.$or = [
    { propertyId: scopedIdsFilter(access.propertyIds) },
    { companyId: scopedIdsFilter(access.companyIds) },
  ];

  return true;
}

function applySiteVisitFilters(
  query: Record<string, unknown>,
  filters: SiteVisitFilters
) {
  const {
    status,
    agentId,
    propertyId,
    companyId,
    propertySiteId,
    source,
    from,
    to,
  } = filters;

  if (status && status !== "all") query.status = status;
  if (source && source !== "all") query.source = source;

  if (agentId) {
    const agentObjectId = toObjectId(agentId);
    if (!agentObjectId) return false;
    query.assignedAgentId = agentObjectId;
  }

  if (propertyId) {
    const propertyObjectId = toObjectId(propertyId);
    if (!propertyObjectId) return false;
    query.propertyId = propertyObjectId;
  }

  if (companyId) {
    const companyObjectId = toObjectId(companyId);
    if (!companyObjectId) return false;
    query.companyId = companyObjectId;
  }

  if (propertySiteId) {
    const siteObjectId = toObjectId(propertySiteId);
    if (!siteObjectId) return false;
    query.propertySiteId = siteObjectId;
  }

  if (from || to) {
    const scheduledAtFilter: { $gte?: Date; $lte?: Date } = {};
    if (from) scheduledAtFilter.$gte = new Date(from);
    if (to) scheduledAtFilter.$lte = new Date(to);
    query.scheduledAt = scheduledAtFilter;
  }

  return true;
}

// ─── SCHEDULE SITE VISIT ─────────────────────────────────────────────────────

/**
 * Creates a SiteVisit document and updates the lead's stage
 * to "site_visit_scheduled" and links the visit ID.
 */
export async function scheduleSiteVisit(
  rawData: SiteVisitInput
): Promise<ApiResponse<ISiteVisit>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("scheduleSiteVisit");
    const actorId = getActorId(access.user.id, "scheduleSiteVisit");

    const data = SiteVisitValidator.parse(rawData);

    const scheduledDate = new Date(data.scheduledAt);
    if (scheduledDate < new Date()) {
      return {
        success: false,
        error: "Site visit cannot be scheduled in the past",
      };
    }

    const lead = await Lead.findById(data.leadId);
    if (!lead) return { success: false, error: "Lead not found" };
    if (!canAccessSiteVisit(access, lead)) {
      return { success: false, error: "You do not have access to this lead" };
    }

    // Create the site visit
    const visit = await SiteVisit.create({
      ...data,
      companyId: data.companyId || lead.companyId,
      propertySiteId: data.propertySiteId || lead.propertySiteId,
      source: data.source || lead.source,
      scheduledAt: scheduledDate,
      status: "scheduled",
    });

    // Update the lead — stage + siteVisitId + activity log
    if (lead) {
      lead.stage = "site_visit_scheduled";
      lead.siteVisitId = visit._id as unknown as string;
      lead.activityLog.push({
        action: "Site visit scheduled",
        note: `Visit scheduled for ${scheduledDate.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })} with agent ${data.assignedAgentName || "assigned agent"}`,
        performedBy: actorId,
        performedAt: new Date(),
        stage: "site_visit_scheduled",
      });
      await lead.save();
    }

    revalidatePath("/admin/site-visits");
    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${data.leadId}`);

    return {
      success: true,
      data: serialize<ISiteVisit>(visit.toObject()),
      message: `Site visit scheduled for ${scheduledDate.toLocaleDateString("en-IN")}`,
    };
  } catch (error) {
    console.error("[scheduleSiteVisit]", error);
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, error: "Please fill in all required fields" };
    }
    return { success: false, error: "Failed to schedule site visit" };
  }
}

// ─── GET SITE VISITS ──────────────────────────────────────────────────────────

export async function getSiteVisits(filters: {
  status?: string;
  agentId?: string;
  propertyId?: string;
  companyId?: string;
  propertySiteId?: string;
  source?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<ISiteVisit[]>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getSiteVisits");

    const { status, agentId, propertyId, from, to, page = 1, limit = 20 } = filters;

    const query: Record<string, unknown> = {};
    const isValid =
      applySiteVisitScope(query, access) &&
      applySiteVisitFilters(query, {
        status,
        agentId,
        propertyId,
        companyId: filters.companyId,
        propertySiteId: filters.propertySiteId,
        source: filters.source,
        from,
        to,
      });

    if (!isValid) {
      return {
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const skip = (page - 1) * limit;

    const [visits, total] = await Promise.all([
      SiteVisit.find(query)
        .sort({ scheduledAt: 1 }) // ascending — next visits first
        .skip(skip)
        .limit(limit)
        .lean(),
      SiteVisit.countDocuments(query),
    ]);

    return {
      success: true,
      data: visits.map((v) => serialize<ISiteVisit>(v)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("[getSiteVisits]", error);
    return { success: false, error: "Failed to fetch site visits" };
  }
}

// ─── GET UPCOMING VISITS (dashboard widget) ───────────────────────────────────

export async function getUpcomingVisits(
  limit = 5,
  filters: Pick<SiteVisitFilters, "agentId" | "propertyId" | "companyId" | "propertySiteId" | "source"> = {}
): Promise<ApiResponse<ISiteVisit[]>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getUpcomingVisits");

    const query: Record<string, unknown> = {
      scheduledAt: { $gte: new Date() },
      status: "scheduled",
    };
    const isValid =
      applySiteVisitScope(query, access) && applySiteVisitFilters(query, filters);

    if (!isValid) {
      return { success: true, data: [] };
    }

    const visits = await SiteVisit.find(query)
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: visits.map((v) => serialize<ISiteVisit>(v)),
    };
  } catch (error) {
    console.error("[getUpcomingVisits]", error);
    return { success: false, error: "Failed to fetch upcoming visits" };
  }
}

// ─── UPDATE SITE VISIT STATUS ─────────────────────────────────────────────────

export async function updateSiteVisitStatus(rawData: {
  visitId: string;
  status: string;
  outcome?: string;
  agentNotes?: string;
  rescheduledTo?: string;
}): Promise<ApiResponse<ISiteVisit>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("updateSiteVisitStatus");

    const data = SiteVisitStatusUpdateValidator.parse(rawData);

    const visit = await SiteVisit.findById(data.visitId);
    if (!visit) return { success: false, error: "Site visit not found" };
    if (!canAccessSiteVisit(access, visit)) {
      return { success: false, error: "You do not have access to this site visit" };
    }

    const actorId = getActorId(access.user.id, "updateSiteVisitStatus");
    const updateData: Record<string, unknown> = {
      status: data.status,
    };

    if (data.outcome) updateData.outcome = data.outcome;
    if (data.agentNotes) updateData.agentNotes = data.agentNotes;
    if (data.rescheduledTo) updateData.rescheduledTo = new Date(data.rescheduledTo);
    if (data.status === "completed") updateData.completedAt = new Date();

    const updated = await SiteVisit.findByIdAndUpdate(
      data.visitId,
      updateData,
      { new: true }
    ).lean();

    // Update lead activity log if visit is completed or no-show
    if (data.status === "completed" || data.status === "no_show") {
      const lead = await Lead.findById(visit.leadId);
      if (lead) {
        const actionText =
          data.status === "completed"
            ? `Site visit completed — Outcome: ${data.outcome || "Pending"}`
            : "Client did not show up for site visit";

        lead.activityLog.push({
          action: actionText,
          note: data.agentNotes || undefined,
          performedBy: actorId,
          performedAt: new Date(),
          stage: lead.stage,
        });
        await lead.save();
      }
    }

    revalidatePath("/admin/site-visits");
    revalidatePath("/admin/leads");

    return {
      success: true,
      data: serialize<ISiteVisit>(updated),
      message: `Site visit marked as ${data.status}`,
    };
  } catch (error) {
    console.error("[updateSiteVisitStatus]", error);
    return { success: false, error: "Failed to update site visit" };
  }
}

// ─── GET SITE VISIT STATS (dashboard) ────────────────────────────────────────

export async function getSiteVisitStats(
  filters: Pick<
    SiteVisitFilters,
    "status" | "agentId" | "propertyId" | "companyId" | "propertySiteId" | "source"
  > = {}
): Promise<
  ApiResponse<{
    total: number;
    scheduled: number;
    completed: number;
    noShow: number;
    thisWeek: number;
    conversionRate: number;
  }>
> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getSiteVisitStats");

    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const baseMatch: Record<string, unknown> = {};
    const isValid =
      applySiteVisitScope(baseMatch, access) && applySiteVisitFilters(baseMatch, filters);

    if (!isValid) {
      return {
        success: true,
        data: {
          total: 0,
          scheduled: 0,
          completed: 0,
          noShow: 0,
          thisWeek: 0,
          conversionRate: 0,
        },
      };
    }

    const [statusCounts, thisWeekCount, convertedVisits] = await Promise.all([
      SiteVisit.aggregate([
        { $match: baseMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      SiteVisit.countDocuments({
        ...baseMatch,
        scheduledAt: { $gte: weekStart, $lte: weekEnd },
      }),
      SiteVisit.countDocuments({
        ...baseMatch,
        status: "completed",
        outcome: "converted",
      }),
    ]);

    const map: Record<string, number> = {};
    statusCounts.forEach(({ _id, count }: { _id: string; count: number }) => {
      map[_id] = count;
    });

    const completed = map.completed ?? 0;
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    const conversionRate =
      completed > 0
        ? Math.round((convertedVisits / completed) * 100)
        : 0;

    return {
      success: true,
      data: {
        total,
        scheduled: map.scheduled ?? 0,
        completed,
        noShow: map.no_show ?? 0,
        thisWeek: thisWeekCount,
        conversionRate,
      },
    };
  } catch (error) {
    console.error("[getSiteVisitStats]", error);
    return { success: false, error: "Failed to fetch site visit stats" };
  }
}
