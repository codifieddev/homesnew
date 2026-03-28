"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import Lead from "@/lib/db/models/Lead";
import Property from "@/lib/db/models/Property";
import User from "@/lib/db/models/User";
import { requireAuth } from "@/lib/auth/utils";
import {
  requireObjectId,
  serialize,
  toObjectId,
} from "@/lib/db/actions/helpers";
import {
  getScopedDashboardAccess,
  scopedIdsFilter,
} from "@/lib/db/actions/access";
import {
  LeadValidator,
  LeadStageUpdateValidator,
  LeadAssignValidator,
  ActivityLogValidator,
  type LeadInput,
  type LeadStageUpdateInput,
} from "@/lib/utils/validators";
import type { ApiResponse, ILead, LeadStage } from "@/types";
import { LEAD_STAGE_LABELS } from "@/lib/utils/constants";

type LeadListQuery = Record<string, unknown>;
type LeadFilters = {
  stage?: LeadStage | "all";
  assignedTo?: string;
  propertyId?: string;
  companyId?: string;
  propertySiteId?: string;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
};

function createEmptyLeadBoard(): Record<LeadStage, ILead[]> {
  return {
    new: [],
    contacted: [],
    qualified: [],
    site_visit_scheduled: [],
    negotiation: [],
    converted: [],
    lost: [],
  };
}

function getActorId(userId: string, actionName: string) {
  return requireObjectId(userId, `${actionName}: session user id`).toString();
}

function sanitizeLeadProperty(
  propertyId: string | undefined,
  companyId: string | undefined,
  propertySiteId: string | undefined,
  propertyName: string | undefined,
  propertySlug: string | undefined,
  pageContext: string | undefined,
  tracking: Record<string, string | undefined> | undefined,
  actionName: string
) {
  const propertyObjectId = toObjectId(propertyId);
  const companyObjectId = toObjectId(companyId);
  const propertySiteObjectId = toObjectId(propertySiteId);

  if (propertyId && !propertyObjectId) {
    console.error(`[${actionName}] Invalid propertyId received for lead write`, {
      propertyId,
      propertyName,
      propertySlug,
    });
  }
  if (companyId && !companyObjectId) {
    console.error(`[${actionName}] Invalid companyId received for lead write`, {
      companyId,
      propertyName,
      propertySlug,
    });
  }
  if (propertySiteId && !propertySiteObjectId) {
    console.error(`[${actionName}] Invalid propertySiteId received for lead write`, {
      propertySiteId,
      propertyName,
      propertySlug,
    });
  }

  return {
    propertyId: propertyObjectId?.toString(),
    companyId: companyObjectId?.toString(),
    propertySiteId: propertySiteObjectId?.toString(),
    propertyName,
    propertySlug,
    pageContext,
    tracking,
  };
}

function canAccessLead(
  access: Awaited<ReturnType<typeof getScopedDashboardAccess>>,
  lead: {
    propertyId?: unknown;
    companyId?: unknown;
  }
) {
  if (!access.isCompanyManager) return true;

  const propertyId = toObjectId(lead.propertyId);
  if (propertyId) {
    return access.propertyIds.includes(propertyId.toString());
  }

  const companyId = toObjectId(lead.companyId);
  if (companyId) {
    return access.companyIds.includes(companyId.toString());
  }

  return false;
}

function applyLeadScope(
  query: LeadListQuery,
  access: Awaited<ReturnType<typeof getScopedDashboardAccess>>
) {
  if (!access.isCompanyManager) return true;
  if (!access.companyIds.length && !access.propertyIds.length) return false;

  query.$and = [
    {
      $or: [
        { propertyId: scopedIdsFilter(access.propertyIds) },
        { companyId: scopedIdsFilter(access.companyIds) },
      ],
    },
  ];

  return true;
}

function applyLeadFilters(query: LeadListQuery, filters: LeadFilters) {
  const {
    stage,
    assignedTo,
    propertyId,
    companyId,
    propertySiteId,
    source,
    search,
  } = filters;

  if (stage && stage !== "all") query.stage = stage;
  if (source && source !== "all") query.source = source;

  if (assignedTo) {
    const assignedObjectId = toObjectId(assignedTo);
    if (!assignedObjectId) return false;
    query.assignedTo = assignedObjectId;
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

  if (search?.trim()) {
    const rx = new RegExp(search.trim(), "i");
    query.$or = [{ name: rx }, { phone: rx }, { email: rx }];
  }

  return true;
}

// ─── GET LEADS (admin) ────────────────────────────────────────────────────────

export async function getLeads(filters: LeadFilters = {}): Promise<ApiResponse<ILead[]>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getLeads");

    const { page = 1, limit = 50 } = filters;
    const query: LeadListQuery = {};
    const isValid = applyLeadScope(query, access) && applyLeadFilters(query, filters);

    if (!isValid) {
      return {
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return {
      success: true,
      data: leads.map((l) => serialize<ILead>(l)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error("[getLeads]", error);
    return { success: false, error: "Failed to fetch leads" };
  }
}

// ─── GET LEADS GROUPED BY STAGE (Kanban board) ───────────────────────────────

/**
 * Returns leads bucketed by pipeline stage for the Kanban board.
 * Each stage returns the most recent 20 leads to keep payload manageable.
 */
export async function getLeadsKanban(filters: {
  assignedTo?: string;
  companyId?: string;
  propertySiteId?: string;
  source?: string;
} = {}): Promise<ApiResponse<Record<LeadStage, ILead[]>>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getLeadsKanban");

    const baseQuery: Record<string, unknown> = {};
    const isValid = applyLeadScope(baseQuery, access) && applyLeadFilters(baseQuery, filters);

    if (!isValid) {
      return {
        success: true,
        data: createEmptyLeadBoard(),
      };
    }

    const leads = await Lead.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(500) // cap for performance
      .lean();

    // Group by stage
    const grouped: Record<string, ILead[]> = createEmptyLeadBoard();

    leads.forEach((lead) => {
      const stage = lead.stage as string;
      if (grouped[stage]) {
        grouped[stage].push(serialize<ILead>(lead));
      }
    });

    return {
      success: true,
      data: grouped as Record<LeadStage, ILead[]>,
    };
  } catch (error) {
    console.error("[getLeadsKanban]", error);
    return { success: false, error: "Failed to fetch Kanban data" };
  }
}

// ─── GET SINGLE LEAD ─────────────────────────────────────────────────────────

export async function getLeadById(id: string): Promise<ApiResponse<ILead>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getLeadById");

    const lead = await Lead.findById(id).lean();
    if (!lead) return { success: false, error: "Lead not found" };
    if (!canAccessLead(access, lead)) {
      return { success: false, error: "You do not have access to this lead" };
    }

    return { success: true, data: serialize<ILead>(lead) };
  } catch (error) {
    console.error("[getLeadById]", error);
    return { success: false, error: "Failed to fetch lead" };
  }
}

// ─── CREATE LEAD (manual — agent creates directly) ───────────────────────────

export async function createLead(rawData: LeadInput): Promise<ApiResponse<ILead>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("createLead");

    const data = LeadValidator.parse(rawData);
    const actorId = getActorId(access.user.id, "createLead");
    const propertyRef = sanitizeLeadProperty(
      data.propertyId,
      data.companyId,
      data.propertySiteId,
      data.propertyName,
      data.propertySlug,
      data.pageContext,
      data.tracking as Record<string, string | undefined> | undefined,
      "createLead"
    );

    if (propertyRef.propertyId && !propertyRef.companyId) {
      const property = await Property.findById(propertyRef.propertyId)
        .select("companyId")
        .lean();
      if (property?.companyId) {
        propertyRef.companyId = property.companyId.toString();
      }
    }

    if (
      access.isCompanyManager &&
      !(
        (propertyRef.propertyId &&
          access.propertyIds.includes(propertyRef.propertyId)) ||
        (propertyRef.companyId &&
          access.companyIds.includes(propertyRef.companyId))
      )
    ) {
      return {
        success: false,
        error: "Company managers can create leads only for their assigned properties or companies",
      };
    }

    const lead = await Lead.create({
      ...data,
      ...propertyRef,
      activityLog: [
        {
          action: "Lead created manually",
          note: `Created by ${access.user.name}`,
          performedBy: actorId,
          performedAt: new Date(),
          stage: "new",
        },
      ],
    });

    revalidatePath("/admin/leads");

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead created for ${lead.name}`,
    };
  } catch (error) {
    console.error("[createLead]", error);
    return { success: false, error: "Failed to create lead" };
  }
}

// ─── UPDATE LEAD STAGE (drag-drop Kanban / manual) ───────────────────────────

export async function updateLeadStage(
  rawData: LeadStageUpdateInput
): Promise<ApiResponse<ILead>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("updateLeadStage");
    const actorId = getActorId(access.user.id, "updateLeadStage");

    const { leadId, stage, note } = LeadStageUpdateValidator.parse(rawData);

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };
    if (!canAccessLead(access, lead)) {
      return { success: false, error: "You do not have access to this lead" };
    }

    const previousStage = lead.stage;

    // Push to activity log
    lead.activityLog.push({
      action: `Stage changed: ${LEAD_STAGE_LABELS[previousStage]} → ${LEAD_STAGE_LABELS[stage]}`,
      note: note || undefined,
      performedBy: actorId,
      performedAt: new Date(),
      stage,
    });

    lead.stage = stage;
    await lead.save(); // triggers pre-save middleware (sets closedAt)

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead moved to "${LEAD_STAGE_LABELS[stage]}"`,
    };
  } catch (error) {
    console.error("[updateLeadStage]", error);
    return { success: false, error: "Failed to update lead stage" };
  }
}

// ─── ASSIGN LEAD TO AGENT ─────────────────────────────────────────────────────

export async function assignLead(rawData: {
  leadId: string;
  agentId: string;
  agentName: string;
}): Promise<ApiResponse<ILead>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("assignLead");
    const actorId = getActorId(access.user.id, "assignLead");

    const { leadId, agentId, agentName } = LeadAssignValidator.parse(rawData);
    const agentObjectId = requireObjectId(
      agentId,
      "assignLead: agent id"
    ).toString();

    // Verify agent exists and is active
    const agent = await User.findOne({ _id: agentObjectId, isActive: true });
    if (!agent) return { success: false, error: "Agent not found or inactive" };

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };
    if (!canAccessLead(access, lead)) {
      return { success: false, error: "You do not have access to this lead" };
    }

    const previousAgent = lead.assignedAgentName || "Unassigned";

    lead.assignedTo = agentObjectId;
    lead.assignedAgentName = agentName;
    lead.activityLog.push({
      action: `Lead assigned to ${agentName}`,
      note: `Previously: ${previousAgent}. Assigned by ${access.user.name}`,
      performedBy: actorId,
      performedAt: new Date(),
      stage: lead.stage,
    });

    await lead.save();

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead assigned to ${agentName}`,
    };
  } catch (error) {
    console.error("[assignLead]", error);
    return { success: false, error: "Failed to assign lead" };
  }
}

// ─── ADD ACTIVITY LOG ENTRY ───────────────────────────────────────────────────

export async function addLeadActivity(rawData: {
  leadId: string;
  action: string;
  note?: string;
}): Promise<ApiResponse<ILead>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("addLeadActivity");
    const actorId = getActorId(access.user.id, "addLeadActivity");

    const { leadId, action, note } = ActivityLogValidator.parse(rawData);

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };
    if (!canAccessLead(access, lead)) {
      return { success: false, error: "You do not have access to this lead" };
    }

    lead.activityLog.push({
      action,
      note: note || undefined,
      performedBy: actorId,
      performedAt: new Date(),
      stage: lead.stage,
    });

    await lead.save();

    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: "Activity logged",
    };
  } catch (error) {
    console.error("[addLeadActivity]", error);
    return { success: false, error: "Failed to log activity" };
  }
}

// ─── UPDATE LEAD SCORE ────────────────────────────────────────────────────────

export async function updateLeadScore(
  leadId: string,
  score: number
): Promise<ApiResponse<ILead>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("updateLeadScore");
    const actorId = getActorId(access.user.id, "updateLeadScore");

    if (score < 0 || score > 100) {
      return { success: false, error: "Score must be between 0 and 100" };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };
    if (!canAccessLead(access, lead)) {
      return { success: false, error: "You do not have access to this lead" };
    }

    const previousScore = lead.score || 0;
    lead.score = score;
    lead.activityLog.push({
      action: `Lead score updated: ${previousScore} → ${score}`,
      performedBy: actorId,
      performedAt: new Date(),
      stage: lead.stage,
    });

    await lead.save();

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead score updated to ${score}`,
    };
  } catch (error) {
    console.error("[updateLeadScore]", error);
    return { success: false, error: "Failed to update lead score" };
  }
}

// ─── MARK LEAD LOST ───────────────────────────────────────────────────────────

export async function markLeadLost(
  leadId: string,
  reason: string
): Promise<ApiResponse<ILead>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("markLeadLost");
    const actorId = getActorId(access.user.id, "markLeadLost");

    const lead = await Lead.findById(leadId);
    if (!lead) return { success: false, error: "Lead not found" };
    if (!canAccessLead(access, lead)) {
      return { success: false, error: "You do not have access to this lead" };
    }

    lead.stage = "lost";
    lead.lostReason = reason;
    lead.activityLog.push({
      action: "Lead marked as lost",
      note: `Reason: ${reason}`,
      performedBy: actorId,
      performedAt: new Date(),
      stage: "lost",
    });

    await lead.save(); // pre-save sets closedAt

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: "Lead marked as lost",
    };
  } catch (error) {
    console.error("[markLeadLost]", error);
    return { success: false, error: "Failed to update lead" };
  }
}

// ─── GET LEAD STATS (dashboard) ───────────────────────────────────────────────

export async function getLeadStats(
  filters: Pick<
    LeadFilters,
    "assignedTo" | "propertyId" | "companyId" | "propertySiteId" | "source"
  > = {}
): Promise<
  ApiResponse<{
    total: number;
    active: number;
    converted: number;
    lost: number;
    conversionRate: number;
    byStage: Record<string, number>;
    bySource: Record<string, number>;
  }>
> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getLeadStats");
    const match: LeadListQuery = {};
    const isValid = applyLeadScope(match, access) && applyLeadFilters(match, filters);

    if (!isValid) {
      return {
        success: true,
        data: {
          total: 0,
          active: 0,
          converted: 0,
          lost: 0,
          conversionRate: 0,
          byStage: {},
          bySource: {},
        },
      };
    }

    const [stageCounts, sourceCounts] = await Promise.all([
      Lead.aggregate([
        { $match: match },
        { $group: { _id: "$stage", count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: match },
        { $group: { _id: "$source", count: { $sum: 1 } } },
      ]),
    ]);

    const byStage: Record<string, number> = {};
    stageCounts.forEach(({ _id, count }: { _id: string; count: number }) => {
      byStage[_id] = count;
    });

    const bySource: Record<string, number> = {};
    sourceCounts.forEach(({ _id, count }: { _id: string; count: number }) => {
      bySource[_id] = count;
    });

    const total = Object.values(byStage).reduce((a, b) => a + b, 0);
    const converted = byStage.converted ?? 0;
    const lost = byStage.lost ?? 0;
    const active = total - converted - lost;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    return {
      success: true,
      data: { total, active, converted, lost, conversionRate, byStage, bySource },
    };
  } catch (error) {
    console.error("[getLeadStats]", error);
    return { success: false, error: "Failed to fetch lead stats" };
  }
}

// ─── GET AGENTS LIST (for assignment dropdown) ────────────────────────────────

export async function getAgents(): Promise<
  ApiResponse<{ id: string; name: string; email: string; role: string }[]>
> {
  try {
    await requireAuth();
    await connectDB();

    const agents = await User.find({
      isActive: true,
      role: { $in: ["agent", "admin", "company_manager"] },
    })
      .select("name email role")
      .lean();

    return {
      success: true,
      data: agents.map((a) => ({
        id: (a._id as { toString(): string }).toString(),
        name: a.name as string,
        email: a.email as string,
        role: a.role as string,
      })),
    };
  } catch (error) {
    console.error("[getAgents]", error);
    return { success: false, error: "Failed to fetch agents" };
  }
}
