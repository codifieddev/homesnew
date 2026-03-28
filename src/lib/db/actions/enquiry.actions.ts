"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db/connection";
import Enquiry from "@/lib/db/models/Enquiry";
import Lead from "@/lib/db/models/Lead";
import Property from "@/lib/db/models/Property";
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
  EnquiryValidator,
  EnquiryStatusUpdateValidator,
  type EnquiryInput,
} from "@/lib/utils/validators";
import type { ApiResponse, IEnquiry, ILead } from "@/types";

type EnquiryListQuery = Record<string, unknown>;
type EnquiryFilters = {
  status?: string;
  propertyId?: string;
  companyId?: string;
  propertySiteId?: string;
  source?: string;
  page?: number;
  limit?: number;
};

function getActorId(userId: string, actionName: string) {
  return requireObjectId(userId, `${actionName}: session user id`).toString();
}

function sanitizeEnquiryProperty(
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
    console.error(`[${actionName}] Invalid propertyId received`, {
      propertyId,
      propertyName,
      propertySlug,
    });
  }
  if (companyId && !companyObjectId) {
    console.error(`[${actionName}] Invalid companyId received`, {
      companyId,
      propertyName,
      propertySlug,
    });
  }
  if (propertySiteId && !propertySiteObjectId) {
    console.error(`[${actionName}] Invalid propertySiteId received`, {
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

function canAccessEnquiry(
  access: Awaited<ReturnType<typeof getScopedDashboardAccess>>,
  enquiry: {
    propertyId?: unknown;
    companyId?: unknown;
  }
) {
  if (!access.isCompanyManager) return true;

  const propertyId = toObjectId(enquiry.propertyId);
  if (propertyId) {
    return access.propertyIds.includes(propertyId.toString());
  }

  const companyId = toObjectId(enquiry.companyId);
  if (companyId) {
    return access.companyIds.includes(companyId.toString());
  }

  return false;
}

function applyEnquiryScope(
  query: EnquiryListQuery,
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

function applyEnquiryFilters(query: EnquiryListQuery, filters: EnquiryFilters) {
  const { status, propertyId, companyId, propertySiteId, source } = filters;

  if (status && status !== "all") query.status = status;
  if (source && source !== "all") query.source = source;

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

  return true;
}

// ─── SUBMIT ENQUIRY (public — no auth required) ───────────────────────────────

/**
 * Called from public property pages and contact forms.
 * Validates input, captures IP for dedup, writes to enquiries collection.
 * Never fails silently — always returns a structured response.
 */
export async function submitEnquiry(
  rawData: EnquiryInput
): Promise<ApiResponse<{ enquiryId: string }>> {
  try {
    await connectDB();

    const data = EnquiryValidator.parse(rawData);
    const propertyRef = sanitizeEnquiryProperty(
      data.propertyId,
      data.companyId,
      data.propertySiteId,
      data.propertyName,
      data.propertySlug,
      data.pageContext,
      data.tracking,
      "submitEnquiry"
    );

    if (propertyRef.propertyId && !propertyRef.companyId) {
      const property = await Property.findById(propertyRef.propertyId)
        .select("companyId")
        .lean();
      if (property?.companyId) {
        propertyRef.companyId = property.companyId.toString();
      }
    }

    // Capture request metadata for spam detection and dedup
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Basic duplicate guard — same phone + same property in last 24h
    if (propertyRef.propertyId) {
      const recentDuplicate = await Enquiry.findOne({
        phone: data.phone,
        propertyId: propertyRef.propertyId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (recentDuplicate) {
        // Silently succeed — don't tell spammers they've been blocked,
        // but also don't create a duplicate record
        return {
          success: true,
          data: { enquiryId: recentDuplicate._id.toString() },
          message: "Your enquiry has already been received. We'll be in touch shortly.",
        };
      }
    }

    const enquiry = await Enquiry.create({
      ...data,
      ...propertyRef,
      status: "new",
      ipAddress,
      userAgent,
    });

    // Increment enquiry count on the property (fire and forget)
    if (propertyRef.propertyId) {
      Property.findByIdAndUpdate(propertyRef.propertyId, {
        $inc: { enquiryCount: 1 },
      }).catch(console.error);
    }

    return {
      success: true,
      data: { enquiryId: enquiry._id.toString() },
      message: "Thank you! We'll reach out within 2–4 hours.",
    };
  } catch (error) {
    console.error("[submitEnquiry]", error);
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, error: "Please fill in all required fields correctly" };
    }
    return {
      success: false,
      error: "Something went wrong. Please try calling us directly.",
    };
  }
}

// ─── GET ENQUIRIES (admin inbox) ──────────────────────────────────────────────

export async function getEnquiries(filters: {
  status?: string;
  propertyId?: string;
  companyId?: string;
  propertySiteId?: string;
  source?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ApiResponse<IEnquiry[]>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getEnquiries");

    const { page = 1, limit = 20 } = filters;
    const query: EnquiryListQuery = {};
    const isValid =
      applyEnquiryScope(query, access) && applyEnquiryFilters(query, filters);

    if (!isValid) {
      return {
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const skip = (page - 1) * limit;

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(query),
    ]);

    return {
      success: true,
      data: enquiries.map((e) => serialize<IEnquiry>(e)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getEnquiries]", error);
    return { success: false, error: "Failed to fetch enquiries" };
  }
}

// ─── GET ENQUIRY COUNT BY STATUS (dashboard stats) ───────────────────────────

export async function getEnquiryStats(
  filters: Pick<
    EnquiryFilters,
    "status" | "propertyId" | "companyId" | "propertySiteId" | "source"
  > = {}
): Promise<
  ApiResponse<{ new: number; reviewed: number; converted: number; total: number }>
> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getEnquiryStats");
    const match: EnquiryListQuery = {};
    const isValid =
      applyEnquiryScope(match, access) && applyEnquiryFilters(match, filters);

    if (!isValid) {
      return {
        success: true,
        data: {
          new: 0,
          reviewed: 0,
          converted: 0,
          total: 0,
        },
      };
    }

    const counts = await Enquiry.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const map: Record<string, number> = {};
    counts.forEach(({ _id, count }: { _id: string; count: number }) => {
      map[_id] = count;
    });

    return {
      success: true,
      data: {
        new: map.new ?? 0,
        reviewed: map.reviewed ?? 0,
        converted: map.converted ?? 0,
        total: Object.values(map).reduce((a, b) => a + b, 0),
      },
    };
  } catch (error) {
    console.error("[getEnquiryStats]", error);
    return { success: false, error: "Failed to fetch enquiry stats" };
  }
}

// ─── MARK ENQUIRY AS REVIEWED ─────────────────────────────────────────────────

export async function markEnquiryReviewed(
  id: string
): Promise<ApiResponse<IEnquiry>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("markEnquiryReviewed");
    const actorId = getActorId(access.user.id, "markEnquiryReviewed");

    const validated = EnquiryStatusUpdateValidator.parse({
      id,
      status: "reviewed",
    });

    const existing = await Enquiry.findById(validated.id).lean();
    if (!existing) return { success: false, error: "Enquiry not found" };
    if (!canAccessEnquiry(access, existing)) {
      return { success: false, error: "You do not have access to this enquiry" };
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      validated.id,
      {
        status: "reviewed",
        reviewedBy: actorId,
        reviewedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!enquiry) return { success: false, error: "Enquiry not found" };

    revalidatePath("/admin/enquiries");

    return {
      success: true,
      data: serialize<IEnquiry>(enquiry),
      message: "Enquiry marked as reviewed",
    };
  } catch (error) {
    console.error("[markEnquiryReviewed]", error);
    return { success: false, error: "Failed to update enquiry" };
  }
}

// ─── MARK ENQUIRY AS SPAM ─────────────────────────────────────────────────────

export async function markEnquirySpam(id: string): Promise<ApiResponse<null>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("markEnquirySpam");
    if (!["super_admin", "admin", "company_manager"].includes(access.user.role)) {
      return { success: false, error: "You do not have permission to update enquiries" };
    }

    const enquiry = await Enquiry.findById(id).lean();
    if (!enquiry) return { success: false, error: "Enquiry not found" };
    if (!canAccessEnquiry(access, enquiry)) {
      return { success: false, error: "You do not have access to this enquiry" };
    }

    await Enquiry.findByIdAndUpdate(id, { status: "spam" });

    revalidatePath("/admin/enquiries");

    return { success: true, data: null, message: "Marked as spam" };
  } catch (error) {
    console.error("[markEnquirySpam]", error);
    return { success: false, error: "Failed to update enquiry" };
  }
}

// ─── CONVERT ENQUIRY TO LEAD ──────────────────────────────────────────────────

/**
 * The core pipeline entry point.
 * Agent clicks "Convert to Lead" in the inbox.
 * Creates a Lead document, links it back to the enquiry,
 * and updates the enquiry status to "converted".
 */
export async function convertEnquiryToLead(
  enquiryId: string
): Promise<ApiResponse<ILead>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("convertEnquiryToLead");
    const actorId = getActorId(access.user.id, "convertEnquiryToLead");

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) return { success: false, error: "Enquiry not found" };
    if (!canAccessEnquiry(access, enquiry)) {
      return { success: false, error: "You do not have access to this enquiry" };
    }

    if (enquiry.status === "converted") {
      return {
        success: false,
        error: "This enquiry has already been converted to a lead",
      };
    }

    const propertyRef = sanitizeEnquiryProperty(
      enquiry.propertyId?.toString(),
      enquiry.companyId?.toString(),
      enquiry.propertySiteId?.toString(),
      enquiry.propertyName,
      enquiry.propertySlug,
      enquiry.pageContext,
      enquiry.tracking as Record<string, string | undefined> | undefined,
      "convertEnquiryToLead"
    );

    if (propertyRef.propertyId && !propertyRef.companyId) {
      const property = await Property.findById(propertyRef.propertyId)
        .select("companyId")
        .lean();
      if (property?.companyId) {
        propertyRef.companyId = property.companyId.toString();
      }
    }
    const interestedIn =
      Array.isArray(enquiry.interestedIn) && enquiry.interestedIn.length > 0
        ? enquiry.interestedIn
        : ["general"];

    // Create the lead
    const lead = await Lead.create({
      name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email,
      stage: "new",
      source: enquiry.source || "website",
      ...propertyRef,
      requirements: enquiry.budgetRange
        ? `${interestedIn.join(", ")} (Budget: ${enquiry.budgetRange})`
        : interestedIn.join(", "),
      convertedFromEnquiryId: enquiry._id,
      interestedIn,
      activityLog: [
        {
          action: "Lead created from enquiry",
          note: `Converted from enquiry by ${access.user.name}. Original message: ${enquiry.message || "No message"}${enquiry.budgetRange ? `. Budget: ${enquiry.budgetRange}` : ""}`,
          performedBy: actorId,
          performedAt: new Date(),
          stage: "new",
        },
      ],
    });

    // Update the enquiry
    await Enquiry.findByIdAndUpdate(enquiryId, {
      status: "converted",
      convertedLeadId: lead._id,
      reviewedBy: actorId,
      reviewedAt: new Date(),
    });

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin/leads");

    return {
      success: true,
      data: serialize<ILead>(lead.toObject()),
      message: `Lead created for ${lead.name}`,
    };
  } catch (error) {
    console.error("[convertEnquiryToLead]", {
      enquiryId,
      error,
    });
    return { success: false, error: "Failed to convert enquiry to lead" };
  }
}
