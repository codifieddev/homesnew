"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import type { SortOrder } from "mongoose";
import { connectDB } from "@/lib/db/connection";
import Property from "@/lib/db/models/Property";
import { withRole } from "@/lib/auth/utils";
import {
  deepMerge,
  requireObjectId,
  serialize,
} from "@/lib/db/actions/helpers";
import {
  getScopedDashboardAccess,
  hasCompanyAccess,
  hasPropertyAccess,
  scopedIdsFilter,
} from "@/lib/db/actions/access";
import {
  PropertyValidator,
  PropertyFiltersValidator,
  type PropertyInput,
  type PropertyFiltersInput,
} from "@/lib/utils/validators";
import type { ApiResponse, IProperty } from "@/types";

type PropertyQuery = Record<string, unknown>;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

// ─── GET PROPERTIES (public + admin) ─────────────────────────────────────────

export async function getProperties(
  rawFilters: Partial<PropertyFiltersInput> = {}
): Promise<ApiResponse<IProperty[]>> {
  try {
    await connectDB();

    const filters = PropertyFiltersValidator.parse(rawFilters);
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      status,
      category,
      propertyType,
      transactionType,
      city,
      locality,
      minPrice,
      maxPrice,
      bhkConfig,
      possessionStatus,
      isGatedCommunity,
      reraRegistered,
      isFeatured,
    } = filters;

    // Build the MongoDB query
    const query: PropertyQuery = {};

    if (status) query.status = status;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;
    if (category) query["specifications.category"] = category;
    if (propertyType) query["specifications.propertyType"] = propertyType;
    if (transactionType) query["specifications.transactionType"] = transactionType;
    if (bhkConfig) query["specifications.bhkConfig"] = bhkConfig;
    if (possessionStatus) query["specifications.possessionStatus"] = possessionStatus;
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (locality) query["location.locality"] = { $regex: locality, $options: "i" };
    if (isGatedCommunity !== undefined) query["features.isGatedCommunity"] = isGatedCommunity;
    if (reraRegistered !== undefined) query["legalInfo.reraRegistered"] = reraRegistered;

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      query["financials.listedPrice"] = priceFilter;
    }

    // Full-text search
    if (search?.trim()) {
      query.$text = { $search: search.trim() };
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortQuery: Record<string, SortOrder | { $meta: "textScore" }> =
      search?.trim()
        ? { score: { $meta: "textScore" } }
        : { [sortBy]: sortDirection };

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query),
    ]);

    return {
      success: true,
      data: properties.map((property) => serialize<IProperty>(property)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getProperties]", error);
    return { success: false, error: "Failed to fetch properties" };
  }
}

// ─── GET ADMIN PROPERTIES (scoped) ───────────────────────────────────────────

export async function getAdminProperties(
  rawFilters: Partial<PropertyFiltersInput> = {}
): Promise<ApiResponse<IProperty[]>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getAdminProperties");

    const filters = PropertyFiltersValidator.parse(rawFilters);
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      status,
      category,
      propertyType,
      transactionType,
      city,
      locality,
      minPrice,
      maxPrice,
      bhkConfig,
      possessionStatus,
      isGatedCommunity,
      reraRegistered,
      isFeatured,
    } = filters;

    const query: PropertyQuery = {};

    if (status) query.status = status;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;
    if (category) query["specifications.category"] = category;
    if (propertyType) query["specifications.propertyType"] = propertyType;
    if (transactionType) query["specifications.transactionType"] = transactionType;
    if (bhkConfig) query["specifications.bhkConfig"] = bhkConfig;
    if (possessionStatus) query["specifications.possessionStatus"] = possessionStatus;
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (locality) query["location.locality"] = { $regex: locality, $options: "i" };
    if (isGatedCommunity !== undefined) query["features.isGatedCommunity"] = isGatedCommunity;
    if (reraRegistered !== undefined) query["legalInfo.reraRegistered"] = reraRegistered;

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (minPrice !== undefined) priceFilter.$gte = minPrice;
      if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
      query["financials.listedPrice"] = priceFilter;
    }

    if (search?.trim()) {
      query.$text = { $search: search.trim() };
    }

    if (access.isCompanyManager) {
      query.companyId = scopedIdsFilter(access.companyIds);
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortQuery: Record<string, SortOrder | { $meta: "textScore" }> =
      search?.trim()
        ? { score: { $meta: "textScore" } }
        : { [sortBy]: sortDirection };

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query),
    ]);

    return {
      success: true,
      data: properties.map((property) => serialize<IProperty>(property)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getAdminProperties]", error);
    return { success: false, error: "Failed to fetch properties" };
  }
}

// ─── GET SINGLE PROPERTY BY SLUG (public) ────────────────────────────────────

export async function getPropertyBySlug(
  slug: string
): Promise<ApiResponse<IProperty>> {
  try {
    await connectDB();

    const property = await Property.findOne({ slug, status: "active" }).lean();

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    // Increment view count (fire and forget)
    Property.findByIdAndUpdate(property._id, {
      $inc: { viewCount: 1 },
    }).catch(console.error);

    return { success: true, data: serialize<IProperty>(property) };
  } catch (error) {
    console.error("[getPropertyBySlug]", error);
    return { success: false, error: "Failed to fetch property" };
  }
}

// ─── GET SINGLE PROPERTY BY ID (admin) ───────────────────────────────────────

export async function getPropertyById(
  id: string
): Promise<ApiResponse<IProperty>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getPropertyById");

    const property = await Property.findById(id).lean();
    if (!property) return { success: false, error: "Property not found" };
    if (!hasPropertyAccess(access, property._id)) {
      return { success: false, error: "You do not have access to this property" };
    }

    return { success: true, data: serialize<IProperty>(property) };
  } catch (error) {
    console.error("[getPropertyById]", error);
    return { success: false, error: "Failed to fetch property" };
  }
}

// ─── GET FEATURED PROPERTIES (public homepage) ───────────────────────────────

export async function getFeaturedProperties(
  limit = 4
): Promise<ApiResponse<IProperty[]>> {
  return getProperties({ isFeatured: true, status: "active", limit, sortBy: "createdAt", sortOrder: "desc" });
}

// ─── CREATE PROPERTY (admin/super_admin only) ─────────────────────────────────

export async function createProperty(
  rawData: PropertyInput
): Promise<ApiResponse<IProperty>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("createProperty");

    if (!["super_admin", "admin", "company_manager"].includes(access.user.role)) {
      return { success: false, error: "You do not have permission to create properties" };
    }

    const data = PropertyValidator.parse(rawData);
    if (access.isCompanyManager) {
      if (!data.companyId) {
        return { success: false, error: "Select an assigned company before creating a property" };
      }
      if (!hasCompanyAccess(access, data.companyId)) {
        return { success: false, error: "You do not have access to the selected company" };
      }
    }

    // Auto-generate slug from title if not provided
    const baseSlug = data.slug || generateSlug(data.title);

    // Ensure slug uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await Property.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const property = await Property.create({
      ...data,
      slug,
      location: { type: "Point", ...data.location },
      createdBy: requireObjectId(access.user.id, "createProperty: session user id").toString(),
    });

    revalidatePath("/admin/properties");
    revalidatePath("/projects");
    revalidatePath("/");

    return {
      success: true,
      data: serialize<IProperty>(property.toObject()),
      message: `Property "${property.title}" created successfully`,
    };
  } catch (error) {
    console.error("[createProperty]", error);
    if (error instanceof Error && error.name === "ZodError") {
      return { success: false, error: "Validation failed — check all required fields" };
    }
    return { success: false, error: "Failed to create property" };
  }
}

// ─── UPDATE PROPERTY ─────────────────────────────────────────────────────────

export async function updateProperty(
  id: string,
  rawData: Partial<PropertyInput>
): Promise<ApiResponse<IProperty>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("updateProperty");

    if (!["super_admin", "admin", "company_manager"].includes(access.user.role)) {
      return { success: false, error: "You do not have permission to update properties" };
    }

    const property = await Property.findById(id);
    if (!property) return { success: false, error: "Property not found" };
    if (!hasPropertyAccess(access, property._id)) {
      return { success: false, error: "You do not have access to this property" };
    }

    const current = serialize<IProperty>(property.toObject());
    const merged = deepMerge(current, rawData as Partial<IProperty>);
    const data = PropertyValidator.parse(merged);

    if (access.isCompanyManager) {
      if (!data.companyId || !hasCompanyAccess(access, data.companyId)) {
        return { success: false, error: "You do not have access to the selected company" };
      }
    }

    // If title changed and no custom slug, regenerate
    if (rawData.title && rawData.title !== property.title && !rawData.slug) {
      const newSlug = generateSlug(rawData.title);
      if (newSlug !== property.slug) {
        const exists = await Property.exists({
          slug: newSlug,
          _id: { $ne: id },
        });
        if (!exists) data.slug = newSlug;
      }
    }

    const updated = await Property.findByIdAndUpdate(
      id,
      { ...data, location: { type: "Point", ...data.location } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return { success: false, error: "Property not found after update" };
    }

    revalidatePath(`/admin/properties/${id}`);
    revalidatePath("/admin/properties");
    revalidatePath(`/projects/${property.slug}`);
    if (updated.slug && updated.slug !== property.slug) {
      revalidatePath(`/projects/${updated.slug}`);
    }
    revalidatePath("/projects");
    revalidatePath("/");

    return {
      success: true,
      data: serialize<IProperty>(updated),
      message: "Property updated successfully",
    };
  } catch (error) {
    console.error("[updateProperty]", error);
    return { success: false, error: "Failed to update property" };
  }
}

// ─── TOGGLE PROPERTY STATUS ───────────────────────────────────────────────────

export async function togglePropertyStatus(
  id: string,
  status: "active" | "blocked" | "sold" | "archived"
): Promise<ApiResponse<IProperty>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("togglePropertyStatus");

    if (!["super_admin", "admin", "company_manager"].includes(access.user.role)) {
      return { success: false, error: "You do not have permission to update property status" };
    }

    if (!hasPropertyAccess(access, id)) {
      return { success: false, error: "You do not have access to this property" };
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!property) return { success: false, error: "Property not found" };

    revalidatePath("/admin/properties");
    revalidatePath("/projects");
    revalidatePath("/");

    return {
      success: true,
      data: serialize<IProperty>(property),
      message: `Property marked as ${status}`,
    };
  } catch (error) {
    console.error("[togglePropertyStatus]", error);
    return { success: false, error: "Failed to update property status" };
  }
}

// ─── TOGGLE FEATURED ─────────────────────────────────────────────────────────

export async function toggleFeatured(
  id: string,
  isFeatured: boolean
): Promise<ApiResponse<IProperty>> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("toggleFeatured");

    if (!["super_admin", "admin", "company_manager"].includes(access.user.role)) {
      return { success: false, error: "You do not have permission to update featured status" };
    }

    if (!hasPropertyAccess(access, id)) {
      return { success: false, error: "You do not have access to this property" };
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true }
    ).lean();

    if (!property) return { success: false, error: "Property not found" };

    revalidatePath("/admin/properties");
    revalidatePath("/");

    return {
      success: true,
      data: serialize<IProperty>(property),
      message: isFeatured ? "Marked as featured" : "Removed from featured",
    };
  } catch (error) {
    console.error("[toggleFeatured]", error);
    return { success: false, error: "Failed to update featured status" };
  }
}

// ─── DELETE PROPERTY ─────────────────────────────────────────────────────────

export async function deleteProperty(
  id: string
): Promise<ApiResponse<null>> {
  try {
    await withRole(["super_admin"]);
    await connectDB();

    const property = await Property.findById(id);
    if (!property) return { success: false, error: "Property not found" };

    const slug = property.slug;

    // Soft delete — archive instead of hard delete
    await Property.findByIdAndUpdate(id, { status: "archived" });

    revalidatePath("/admin/properties");
    revalidatePath(`/projects/${slug}`);
    revalidatePath("/projects");
    revalidatePath("/");

    return {
      success: true,
      data: null,
      message: "Property archived successfully",
    };
  } catch (error) {
    console.error("[deleteProperty]", error);
    return { success: false, error: "Failed to archive property" };
  }
}

// ─── GET PROPERTY SLUGS (for static params generation) ───────────────────────

export async function getAllPropertySlugs(): Promise<string[]> {
  try {
    await connectDB();
    const properties = await Property.find({ status: "active" })
      .select("slug")
      .lean();
    return properties.map((p) => p.slug as string);
  } catch {
    return [];
  }
}

// ─── GET ADMIN STATS ─────────────────────────────────────────────────────────

export async function getPropertyStats(): Promise<
  ApiResponse<{
    total: number;
    active: number;
    sold: number;
    blocked: number;
    featured: number;
    byType: Record<string, number>;
  }>
> {
  try {
    await connectDB();
    const access = await getScopedDashboardAccess("getPropertyStats");

    const match = access.isCompanyManager
      ? { companyId: scopedIdsFilter(access.companyIds) }
      : {};

    const [statusCounts, featuredCount, typeCounts] = await Promise.all([
      Property.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Property.countDocuments({ ...match, isFeatured: true }),
      Property.aggregate([
        { $match: { ...match, status: "active" } },
        { $group: { _id: "$specifications.propertyType", count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    statusCounts.forEach(({ _id, count }: { _id: string; count: number }) => {
      statusMap[_id] = count;
    });

    const byType: Record<string, number> = {};
    typeCounts.forEach(({ _id, count }: { _id: string; count: number }) => {
      byType[_id] = count;
    });

    return {
      success: true,
      data: {
        total: Object.values(statusMap).reduce((a, b) => a + b, 0),
        active: statusMap.active ?? 0,
        sold: statusMap.sold ?? 0,
        blocked: statusMap.blocked ?? 0,
        featured: featuredCount,
        byType,
      },
    };
  } catch (error) {
    console.error("[getPropertyStats]", error);
    return { success: false, error: "Failed to fetch property stats" };
  }
}
