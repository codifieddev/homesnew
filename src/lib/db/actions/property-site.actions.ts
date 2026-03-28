"use server";

import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connection";
import PropertySite from "@/lib/db/models/PropertySite";
import Property from "@/lib/db/models/Property";
import Company from "@/lib/db/models/Company";
import { deepMerge, serialize, toObjectId } from "@/lib/db/actions/helpers";
import {
  getScopedDashboardAccess,
  hasCompanyAccess,
  hasPropertyAccess,
  scopedIdsFilter,
} from "@/lib/db/actions/access";
import {
  PropertySiteValidator,
  type PropertySiteInput,
} from "@/lib/utils/validators";
import type { ApiResponse, ICompany, IProperty, IPropertySite } from "@/types";
import { PUBLISH_STATUSES } from "@/lib/utils/constants";

export type PropertySitePageData = {
  site: IPropertySite;
  property: IProperty;
  company?: ICompany;
};

const DEFAULT_SECTIONS = [
  { id: "overview", label: "Overview", enabled: true, order: 0 },
  { id: "gallery", label: "Gallery", enabled: true, order: 1 },
  { id: "unit-plans", label: "Unit Plans", enabled: true, order: 2 },
  { id: "amenities", label: "Amenities", enabled: true, order: 3 },
  { id: "location", label: "Location", enabled: true, order: 4 },
  { id: "enquiry", label: "Enquire", enabled: true, order: 5 },
] as const;

const DEFAULT_NAVIGATION = [
  { label: "Overview", href: "#overview", enabled: true },
  { label: "Amenities", href: "#amenities", enabled: true },
  { label: "Unit Plans", href: "#unit-plans", enabled: true },
  { label: "Gallery", href: "#gallery", enabled: true },
  { label: "Location", href: "#location", enabled: true },
  { label: "Enquire", href: "#enquire", enabled: true },
] as const;

function ensurePropertySiteRole(role: string) {
  if (!["super_admin", "admin", "company_manager"].includes(role)) {
    throw new Error("You do not have permission to manage property microsites");
  }
}

function canPublish(role: string) {
  return role === "super_admin" || role === "admin";
}

async function ensureUniqueSiteSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (
    await PropertySite.exists({
      siteSlug: slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function getAllPublishedPropertySiteSlugs(): Promise<string[]> {
  try {
    await connectDB();
    const sites = await PropertySite.find({ publishStatus: "published" })
      .select("siteSlug")
      .lean();
    return sites.map((site) => site.siteSlug as string);
  } catch {
    return [];
  }
}

export async function getPublishedPropertySiteBySlug(
  siteSlug: string
): Promise<ApiResponse<PropertySitePageData>> {
  try {
    await connectDB();

    const site = await PropertySite.findOne({
      siteSlug,
      publishStatus: "published",
    }).lean();

    if (!site) {
      return { success: false, error: "Property microsite not found" };
    }

    const propertyId = String(site.propertyId);
    const property = await Property.findOne({
      _id: propertyId,
      status: "active",
    }).lean();

    if (!property) {
      return { success: false, error: "Linked property not found" };
    }

    const companyId = site.companyId
      ? String(site.companyId)
      : property.companyId
        ? String(property.companyId)
        : undefined;

    const company =
      companyId
        ? await Company.findOne({
            _id: companyId,
            status: "published",
          }).lean()
        : null;

    return {
      success: true,
      data: {
        site: serialize<IPropertySite>(site),
        property: serialize<IProperty>(property),
        company: company ? serialize<ICompany>(company) : undefined,
      },
    };
  } catch (error) {
    console.error("[getPublishedPropertySiteBySlug]", error);
    return { success: false, error: "Failed to fetch property microsite" };
  }
}

export async function getPublishedPropertySiteForProperty(
  propertyId: string
): Promise<ApiResponse<IPropertySite>> {
  try {
    await connectDB();
    const propertyObjectId = toObjectId(propertyId);
    if (!propertyObjectId) {
      return { success: false, error: "Property microsite not found" };
    }

    const site = await PropertySite.findOne({
      propertyId: propertyObjectId,
      publishStatus: "published",
    }).lean();

    if (!site) return { success: false, error: "Property microsite not found" };

    return { success: true, data: serialize<IPropertySite>(site) };
  } catch (error) {
    console.error("[getPublishedPropertySiteForProperty]", error);
    return { success: false, error: "Failed to fetch property microsite" };
  }
}

export async function getPropertySitePreviewById(
  id: string
): Promise<ApiResponse<PropertySitePageData>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getPropertySitePreviewById");
    ensurePropertySiteRole(access.user.role);

    const siteObjectId = toObjectId(id);
    if (!siteObjectId) {
      return { success: false, error: "Property microsite not found" };
    }

    const site = await PropertySite.findById(siteObjectId).lean();
    if (!site) {
      return { success: false, error: "Property microsite not found" };
    }

    if (!hasPropertyAccess(access, site.propertyId)) {
      return { success: false, error: "You do not have access to this microsite" };
    }

    const property = await Property.findById(site.propertyId).lean();
    if (!property) {
      return { success: false, error: "Linked property not found" };
    }

    const companyId = site.companyId
      ? String(site.companyId)
      : property.companyId
        ? String(property.companyId)
        : undefined;

    const company = companyId ? await Company.findById(companyId).lean() : null;

    return {
      success: true,
      data: {
        site: serialize<IPropertySite>(site),
        property: serialize<IProperty>(property),
        company: company ? serialize<ICompany>(company) : undefined,
      },
    };
  } catch (error) {
    console.error("[getPropertySitePreviewById]", error);
    return { success: false, error: "Failed to fetch property microsite preview" };
  }
}

export async function getAdminPropertySites(): Promise<ApiResponse<IPropertySite[]>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getAdminPropertySites");
    ensurePropertySiteRole(access.user.role);

    const query = access.isCompanyManager
      ? { propertyId: scopedIdsFilter(access.propertyIds) }
      : {};

    const sites = await PropertySite.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return {
      success: true,
      data: sites.map((site) => serialize<IPropertySite>(site)),
    };
  } catch (error) {
    console.error("[getAdminPropertySites]", error);
    return { success: false, error: "Failed to fetch property microsites" };
  }
}

export async function getPropertySiteById(
  id: string
): Promise<ApiResponse<IPropertySite>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getPropertySiteById");
    ensurePropertySiteRole(access.user.role);

    const siteObjectId = toObjectId(id);
    if (!siteObjectId) {
      return { success: false, error: "Property microsite not found" };
    }

    const site = await PropertySite.findById(siteObjectId).lean();
    if (!site) return { success: false, error: "Property microsite not found" };

    if (!hasPropertyAccess(access, site.propertyId)) {
      return { success: false, error: "You do not have access to this microsite" };
    }

    return { success: true, data: serialize<IPropertySite>(site) };
  } catch (error) {
    console.error("[getPropertySiteById]", error);
    return { success: false, error: "Failed to fetch property microsite" };
  }
}

export async function getPropertySiteByPropertyId(
  propertyId: string
): Promise<ApiResponse<IPropertySite>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getPropertySiteByPropertyId");
    ensurePropertySiteRole(access.user.role);

    if (!hasPropertyAccess(access, propertyId)) {
      return { success: false, error: "You do not have access to this property" };
    }

    const site = await PropertySite.findOne({ propertyId }).lean();
    if (!site) return { success: false, error: "Microsite not configured yet" };

    return { success: true, data: serialize<IPropertySite>(site) };
  } catch (error) {
    console.error("[getPropertySiteByPropertyId]", error);
    return { success: false, error: "Failed to fetch property microsite" };
  }
}

export async function createPropertySite(
  rawData: Partial<PropertySiteInput>
): Promise<ApiResponse<IPropertySite>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("createPropertySite");
    ensurePropertySiteRole(access.user.role);

    const property = rawData.propertyId
      ? await Property.findById(rawData.propertyId).lean()
      : null;

    if (!property) {
      return { success: false, error: "Select a valid property to create a microsite" };
    }

    if (!hasPropertyAccess(access, property._id)) {
      return { success: false, error: "You do not have access to the selected property" };
    }

    const companyId = rawData.companyId || property.companyId?.toString();
    if (companyId && !hasCompanyAccess(access, companyId)) {
      return { success: false, error: "You do not have access to the selected company" };
    }

    const baseSlug = rawData.siteSlug || slugify(property.slug || property.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const data = PropertySiteValidator.parse({
      ...rawData,
      companyId,
      siteSlug: await ensureUniqueSiteSlug(baseSlug),
      navigation: rawData.navigation?.length ? rawData.navigation : DEFAULT_NAVIGATION,
      sections: rawData.sections?.length ? rawData.sections : DEFAULT_SECTIONS,
    });

    if (!canPublish(access.user.role) && data.publishStatus === "published") {
      return { success: false, error: "Company managers can save drafts or submit for review only" };
    }

    const existing = await PropertySite.findOne({ propertyId: data.propertyId }).lean();
    if (existing) {
      return { success: false, error: "A microsite already exists for this property" };
    }

    const site = await PropertySite.create(data);

    revalidatePath("/admin/property-sites");
    revalidatePath(`/projects/${property.slug}`);
    revalidatePath(`/sites/${site.siteSlug}`);

    return {
      success: true,
      data: serialize<IPropertySite>(site.toObject()),
      message: `Microsite "${site.siteSlug}" created successfully`,
    };
  } catch (error) {
    console.error("[createPropertySite]", error);
    return { success: false, error: "Failed to create property microsite" };
  }
}

export async function updatePropertySite(
  id: string,
  rawData: Partial<PropertySiteInput>
): Promise<ApiResponse<IPropertySite>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("updatePropertySite");
    ensurePropertySiteRole(access.user.role);

    const site = await PropertySite.findById(id);
    if (!site) return { success: false, error: "Property microsite not found" };

    if (!hasPropertyAccess(access, site.propertyId)) {
      return { success: false, error: "You do not have access to this microsite" };
    }

    const current = serialize<IPropertySite>(site.toObject());
    const merged = deepMerge(current, rawData as IPropertySite);

    const propertyId = rawData.propertyId || current.propertyId;
    const property = await Property.findById(propertyId).lean();
    if (!property) return { success: false, error: "Linked property not found" };

    if (!hasPropertyAccess(access, property._id)) {
      return { success: false, error: "You do not have access to the linked property" };
    }

    const companyId = rawData.companyId || current.companyId || property.companyId?.toString();
    if (companyId && !hasCompanyAccess(access, companyId)) {
      return { success: false, error: "You do not have access to the selected company" };
    }

    const nextSlug =
      rawData.siteSlug ||
      (rawData.siteSlug === ""
        ? current.siteSlug
        : rawData.heroTitle && rawData.heroTitle !== current.heroTitle
          ? slugify(rawData.heroTitle, { lower: true, strict: true, trim: true })
          : current.siteSlug);

    const data = PropertySiteValidator.parse({
      ...merged,
      propertyId,
      companyId,
      siteSlug: await ensureUniqueSiteSlug(nextSlug, id),
      navigation: merged.navigation?.length ? merged.navigation : DEFAULT_NAVIGATION,
      sections: merged.sections?.length ? merged.sections : DEFAULT_SECTIONS,
    });

    if (!canPublish(access.user.role) && data.publishStatus === "published") {
      return { success: false, error: "Company managers can save drafts or submit for review only" };
    }

    const updated = await PropertySite.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return { success: false, error: "Property microsite not found" };

    revalidatePath("/admin/property-sites");
    revalidatePath(`/sites/${current.siteSlug}`);
    revalidatePath(`/sites/${updated.siteSlug}`);
    revalidatePath(`/projects/${property.slug}`);

    return {
      success: true,
      data: serialize<IPropertySite>(updated),
      message: "Property microsite updated successfully",
    };
  } catch (error) {
    console.error("[updatePropertySite]", error);
    return { success: false, error: "Failed to update property microsite" };
  }
}

export async function updatePropertySitePublishStatus(
  id: string,
  publishStatus: IPropertySite["publishStatus"]
): Promise<ApiResponse<IPropertySite>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("updatePropertySitePublishStatus");
    ensurePropertySiteRole(access.user.role);

    if (!PUBLISH_STATUSES.includes(publishStatus)) {
      return { success: false, error: "Invalid publish status" };
    }

    const site = await PropertySite.findById(id);
    if (!site) return { success: false, error: "Property microsite not found" };

    if (!hasPropertyAccess(access, site.propertyId)) {
      return { success: false, error: "You do not have access to this microsite" };
    }

    if (!canPublish(access.user.role) && ["published", "archived"].includes(publishStatus)) {
      return { success: false, error: "Only admins can publish or archive microsites" };
    }

    site.publishStatus = publishStatus;
    await site.save();

    const property = await Property.findById(site.propertyId).select("slug").lean();

    revalidatePath("/admin/property-sites");
    revalidatePath(`/admin/property-sites/${site._id}/edit`);
    revalidatePath(`/admin/properties/${site.propertyId}/edit`);
    revalidatePath(`/sites/${site.siteSlug}`);
    if (property?.slug) {
      revalidatePath(`/projects/${property.slug}`);
    }

    return {
      success: true,
      data: serialize<IPropertySite>(site.toObject()),
      message: `Microsite status updated to ${publishStatus.replace(/_/g, " ")}`,
    };
  } catch (error) {
    console.error("[updatePropertySitePublishStatus]", error);
    return { success: false, error: "Failed to update property microsite status" };
  }
}
