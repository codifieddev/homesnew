"use server";

import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import Company from "@/lib/db/models/Company";
import CaseStudy from "@/lib/db/models/CaseStudy";
import Property from "@/lib/db/models/Property";
import { deepMerge, serialize, toObjectId } from "@/lib/db/actions/helpers";
import {
  getScopedDashboardAccess,
  hasCompanyAccess,
  scopedIdsFilter,
} from "@/lib/db/actions/access";
import {
  CompanyValidator,
  type CompanyInput,
} from "@/lib/utils/validators";
import type { ApiResponse, ICaseStudy, ICompany, IProperty } from "@/types";

type CompanyProfile = {
  company: ICompany;
  properties: IProperty[];
  caseStudies: ICaseStudy[];
};

function ensureCompanyContentRole(role: string) {
  if (!["super_admin", "admin", "company_manager"].includes(role)) {
    throw new Error("You do not have permission to manage companies");
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
    await Company.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function getFeaturedCompanies(limit = 8): Promise<ApiResponse<ICompany[]>> {
  try {
    await connectDB();

    const companies = await Company.find({
      featured: true,
      status: "published",
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: companies.map((company) => serialize<ICompany>(company)),
    };
  } catch (error) {
    console.error("[getFeaturedCompanies]", error);
    return { success: false, error: "Failed to fetch featured companies" };
  }
}

export async function getPublishedCompanies(): Promise<ApiResponse<ICompany[]>> {
  try {
    await connectDB();

    const companies = await Company.find({ status: "published" })
      .sort({ featured: -1, name: 1 })
      .lean();

    return {
      success: true,
      data: companies.map((company) => serialize<ICompany>(company)),
    };
  } catch (error) {
    console.error("[getPublishedCompanies]", error);
    return { success: false, error: "Failed to fetch companies" };
  }
}

export async function getCompanyProfileBySlug(
  slug: string
): Promise<ApiResponse<CompanyProfile>> {
  try {
    await connectDB();

    const company = await Company.findOne({
      slug,
      status: "published",
    }).lean();

    if (!company) {
      return { success: false, error: "Company not found" };
    }

    const companyId = String(company._id);

    const [properties, caseStudies] = await Promise.all([
      Property.find({
        companyId,
        status: "active",
      })
        .sort({ isFeatured: -1, createdAt: -1 })
        .lean(),
      CaseStudy.find({
        companyId,
        publishStatus: "published",
      })
        .sort({ featured: -1, updatedAt: -1 })
        .lean(),
    ]);

    return {
      success: true,
      data: {
        company: serialize<ICompany>(company),
        properties: properties.map((property) => serialize<IProperty>(property)),
        caseStudies: caseStudies.map((item) => serialize<ICaseStudy>(item)),
      },
    };
  } catch (error) {
    console.error("[getCompanyProfileBySlug]", error);
    return { success: false, error: "Failed to fetch company profile" };
  }
}

export async function getAdminCompanies(): Promise<ApiResponse<ICompany[]>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getAdminCompanies");
    ensureCompanyContentRole(access.user.role);

    const query = access.isCompanyManager
      ? { _id: scopedIdsFilter(access.companyIds) }
      : {};

    const companies = await Company.find(query)
      .sort({ featured: -1, updatedAt: -1 })
      .lean();

    return {
      success: true,
      data: companies.map((company) => serialize<ICompany>(company)),
    };
  } catch (error) {
    console.error("[getAdminCompanies]", error);
    return { success: false, error: "Failed to fetch companies" };
  }
}

export async function getCompanyById(id: string): Promise<ApiResponse<ICompany>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getCompanyById");
    ensureCompanyContentRole(access.user.role);

    const companyObjectId = toObjectId(id);
    if (!companyObjectId) {
      return { success: false, error: "Company not found" };
    }

    if (!hasCompanyAccess(access, companyObjectId)) {
      return { success: false, error: "You do not have access to this company" };
    }

    const company = await Company.findById(companyObjectId).lean();
    if (!company) return { success: false, error: "Company not found" };

    return { success: true, data: serialize<ICompany>(company) };
  } catch (error) {
    console.error("[getCompanyById]", error);
    return { success: false, error: "Failed to fetch company" };
  }
}

export async function createCompany(
  rawData: Partial<CompanyInput>
): Promise<ApiResponse<ICompany>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("createCompany");

    if (!canPublish(access.user.role)) {
      return { success: false, error: "Only admins can create companies" };
    }

    const baseSlug = rawData.slug || slugify(rawData.name || "", {
      lower: true,
      strict: true,
      trim: true,
    });
    const slug = await ensureUniqueSlug(baseSlug);

    const data = CompanyValidator.parse({
      ...rawData,
      slug,
    });

    const company = await Company.create(data);

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/companies");
    revalidatePath("/admin/companies");

    return {
      success: true,
      data: serialize<ICompany>(company.toObject()),
      message: `Company "${company.name}" created successfully`,
    };
  } catch (error) {
    console.error("[createCompany]", error);
    return { success: false, error: "Failed to create company" };
  }
}

export async function updateCompany(
  id: string,
  rawData: Partial<CompanyInput>
): Promise<ApiResponse<ICompany>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("updateCompany");
    ensureCompanyContentRole(access.user.role);

    const company = await Company.findById(id);
    if (!company) return { success: false, error: "Company not found" };

    if (!hasCompanyAccess(access, company._id)) {
      return { success: false, error: "You do not have access to this company" };
    }

    const current = serialize<ICompany>(company.toObject());
    const merged = deepMerge(current, rawData as ICompany);

    const nextSlug =
      rawData.slug ||
      (rawData.name && rawData.name !== current.name
        ? slugify(rawData.name, { lower: true, strict: true, trim: true })
        : current.slug);

    const data = CompanyValidator.parse({
      ...merged,
      slug: await ensureUniqueSlug(nextSlug, id),
    });

    if (!canPublish(access.user.role)) {
      if (data.status === "published" || data.status === "archived") {
        return {
          success: false,
          error: "Company managers can save drafts or submit content for review only",
        };
      }

      data.assignedManagerIds = current.assignedManagerIds;
    }

    const updated = await Company.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return { success: false, error: "Company not found" };

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/companies");
    revalidatePath(`/companies/${current.slug}`);
    revalidatePath(`/companies/${updated.slug}`);
    revalidatePath("/admin/companies");

    return {
      success: true,
      data: serialize<ICompany>(updated),
      message: "Company updated successfully",
    };
  } catch (error) {
    console.error("[updateCompany]", error);
    return { success: false, error: "Failed to update company" };
  }
}
