"use server";

import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import CaseStudy from "@/lib/db/models/CaseStudy";
import Company from "@/lib/db/models/Company";
import Property from "@/lib/db/models/Property";
import { deepMerge, serialize, toObjectId } from "@/lib/db/actions/helpers";
import {
  getScopedDashboardAccess,
  hasCompanyAccess,
  hasPropertyAccess,
  scopedIdsFilter,
} from "@/lib/db/actions/access";
import {
  CaseStudyValidator,
  type CaseStudyInput,
} from "@/lib/utils/validators";
import type { ApiResponse, ICaseStudy, ICompany, IProperty } from "@/types";

type CaseStudyPageData = {
  caseStudy: ICaseStudy;
  company: ICompany;
  properties: IProperty[];
};

function ensureCaseStudyRole(role: string) {
  if (!["super_admin", "admin", "company_manager"].includes(role)) {
    throw new Error("You do not have permission to manage case studies");
  }
}

function canPublish(role: string) {
  return role === "super_admin" || role === "admin";
}

async function ensureUniqueSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (
    await CaseStudy.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function getFeaturedCaseStudies(
  limit = 3
): Promise<ApiResponse<ICaseStudy[]>> {
  try {
    await connectDB();

    const caseStudies = await CaseStudy.find({
      featured: true,
      publishStatus: "published",
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: caseStudies.map((item) => serialize<ICaseStudy>(item)),
    };
  } catch (error) {
    console.error("[getFeaturedCaseStudies]", error);
    return { success: false, error: "Failed to fetch case studies" };
  }
}

export async function getPublishedCaseStudies(): Promise<ApiResponse<ICaseStudy[]>> {
  try {
    await connectDB();

    const caseStudies = await CaseStudy.find({
      publishStatus: "published",
    })
      .sort({ featured: -1, updatedAt: -1 })
      .lean();

    return {
      success: true,
      data: caseStudies.map((item) => serialize<ICaseStudy>(item)),
    };
  } catch (error) {
    console.error("[getPublishedCaseStudies]", error);
    return { success: false, error: "Failed to fetch case studies" };
  }
}

export async function getCaseStudyPageData(
  slug: string
): Promise<ApiResponse<CaseStudyPageData>> {
  try {
    await connectDB();

    const caseStudy = await CaseStudy.findOne({
      slug,
      publishStatus: "published",
    }).lean();

    if (!caseStudy) {
      return { success: false, error: "Case study not found" };
    }

    const companyId = String(caseStudy.companyId);
    const propertyIds = (caseStudy.propertyIds ?? []).map((propertyId) =>
      String(propertyId)
    );

    const [company, properties] = await Promise.all([
      Company.findOne({
        _id: companyId,
        status: "published",
      }).lean(),
      propertyIds.length
        ? Property.find({
            _id: { $in: propertyIds },
            status: "active",
          })
            .sort({ isFeatured: -1, createdAt: -1 })
            .lean()
        : Promise.resolve([]),
    ]);

    if (!company) {
      return { success: false, error: "Linked company not found" };
    }

    return {
      success: true,
      data: {
        caseStudy: serialize<ICaseStudy>(caseStudy),
        company: serialize<ICompany>(company),
        properties: properties.map((property) => serialize<IProperty>(property)),
      },
    };
  } catch (error) {
    console.error("[getCaseStudyPageData]", error);
    return { success: false, error: "Failed to fetch case study" };
  }
}

export async function getAdminCaseStudies(): Promise<ApiResponse<ICaseStudy[]>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getAdminCaseStudies");
    ensureCaseStudyRole(access.user.role);

    const query = access.isCompanyManager
      ? { companyId: scopedIdsFilter(access.companyIds) }
      : {};

    const caseStudies = await CaseStudy.find(query)
      .sort({ featured: -1, updatedAt: -1 })
      .lean();

    return {
      success: true,
      data: caseStudies.map((item) => serialize<ICaseStudy>(item)),
    };
  } catch (error) {
    console.error("[getAdminCaseStudies]", error);
    return { success: false, error: "Failed to fetch case studies" };
  }
}

export async function getCaseStudyById(
  id: string
): Promise<ApiResponse<ICaseStudy>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getCaseStudyById");
    ensureCaseStudyRole(access.user.role);

    const caseStudyObjectId = toObjectId(id);
    if (!caseStudyObjectId) {
      return { success: false, error: "Case study not found" };
    }

    const caseStudy = await CaseStudy.findById(caseStudyObjectId).lean();
    if (!caseStudy) return { success: false, error: "Case study not found" };

    if (!hasCompanyAccess(access, caseStudy.companyId)) {
      return { success: false, error: "You do not have access to this case study" };
    }

    return { success: true, data: serialize<ICaseStudy>(caseStudy) };
  } catch (error) {
    console.error("[getCaseStudyById]", error);
    return { success: false, error: "Failed to fetch case study" };
  }
}

export async function createCaseStudy(
  rawData: Partial<CaseStudyInput>
): Promise<ApiResponse<ICaseStudy>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("createCaseStudy");
    ensureCaseStudyRole(access.user.role);

    const baseSlug = rawData.slug || slugify(rawData.title || "", {
      lower: true,
      strict: true,
      trim: true,
    });

    const data = CaseStudyValidator.parse({
      ...rawData,
      slug: await ensureUniqueSlug(baseSlug),
    });

    if (!hasCompanyAccess(access, data.companyId)) {
      return { success: false, error: "You do not have access to the selected company" };
    }

    if (
      access.isCompanyManager &&
      data.propertyIds.some((propertyId) => !hasPropertyAccess(access, propertyId))
    ) {
      return { success: false, error: "One or more linked properties are outside your scope" };
    }

    if (!canPublish(access.user.role) && data.publishStatus === "published") {
      return { success: false, error: "Company managers can submit for review but cannot publish" };
    }

    const caseStudy = await CaseStudy.create(data);

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/case-studies");
    revalidatePath("/admin/case-studies");

    return {
      success: true,
      data: serialize<ICaseStudy>(caseStudy.toObject()),
      message: `Case study "${caseStudy.title}" created successfully`,
    };
  } catch (error) {
    console.error("[createCaseStudy]", error);
    return { success: false, error: "Failed to create case study" };
  }
}

export async function updateCaseStudy(
  id: string,
  rawData: Partial<CaseStudyInput>
): Promise<ApiResponse<ICaseStudy>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("updateCaseStudy");
    ensureCaseStudyRole(access.user.role);

    const caseStudy = await CaseStudy.findById(id);
    if (!caseStudy) return { success: false, error: "Case study not found" };

    if (!hasCompanyAccess(access, caseStudy.companyId)) {
      return { success: false, error: "You do not have access to this case study" };
    }

    const current = serialize<ICaseStudy>(caseStudy.toObject());
    const merged = deepMerge(current, rawData as ICaseStudy);
    const nextSlug =
      rawData.slug ||
      (rawData.title && rawData.title !== current.title
        ? slugify(rawData.title, { lower: true, strict: true, trim: true })
        : current.slug);

    const data = CaseStudyValidator.parse({
      ...merged,
      slug: await ensureUniqueSlug(nextSlug, id),
    });

    if (!hasCompanyAccess(access, data.companyId)) {
      return { success: false, error: "You do not have access to the selected company" };
    }

    if (
      access.isCompanyManager &&
      data.propertyIds.some((propertyId) => !hasPropertyAccess(access, propertyId))
    ) {
      return { success: false, error: "One or more linked properties are outside your scope" };
    }

    if (!canPublish(access.user.role) && data.publishStatus === "published") {
      return { success: false, error: "Company managers can save drafts or submit for review only" };
    }

    const updated = await CaseStudy.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return { success: false, error: "Case study not found" };

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath(`/case-studies/${current.slug}`);
    revalidatePath(`/case-studies/${updated.slug}`);
    revalidatePath("/admin/case-studies");

    return {
      success: true,
      data: serialize<ICaseStudy>(updated),
      message: "Case study updated successfully",
    };
  } catch (error) {
    console.error("[updateCaseStudy]", error);
    return { success: false, error: "Failed to update case study" };
  }
}
