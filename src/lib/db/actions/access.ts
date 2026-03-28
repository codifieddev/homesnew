import { requireAuth } from "@/lib/auth/utils";
import Company from "@/lib/db/models/Company";
import Property from "@/lib/db/models/Property";
import { requireObjectId, toObjectId } from "@/lib/db/actions/helpers";

type SessionUser = Awaited<ReturnType<typeof requireAuth>>;

export interface ScopedDashboardAccess {
  user: SessionUser;
  isCompanyManager: boolean;
  companyIds: string[];
  propertyIds: string[];
}

export async function getScopedDashboardAccess(
  actionName: string
): Promise<ScopedDashboardAccess> {
  const user = await requireAuth();

  if (user.role !== "company_manager") {
    return {
      user,
      isCompanyManager: false,
      companyIds: [],
      propertyIds: [],
    };
  }

  const managerId = requireObjectId(
    user.id,
    `${actionName}: session user id`
  ).toString();
  const companies = await Company.find({
    assignedManagerIds: managerId,
    status: { $ne: "archived" },
  })
    .select("_id")
    .lean();

  const companyIds = companies.map((company) => String(company._id));
  const properties = companyIds.length
    ? await Property.find({
        companyId: { $in: companyIds },
      })
        .select("_id")
        .lean()
    : [];

  const propertyIds = properties.map((property) => String(property._id));

  return {
    user,
    isCompanyManager: true,
    companyIds,
    propertyIds,
  };
}

export function hasCompanyAccess(
  access: ScopedDashboardAccess,
  companyId: unknown
): boolean {
  if (!access.isCompanyManager) return true;
  const normalizedId =
    toObjectId(companyId)?.toString() ??
    (typeof companyId === "string" ? companyId : undefined);
  if (!normalizedId) return false;

  return access.companyIds.includes(normalizedId);
}

export function hasPropertyAccess(
  access: ScopedDashboardAccess,
  propertyId: unknown
): boolean {
  if (!access.isCompanyManager) return true;
  const normalizedId =
    toObjectId(propertyId)?.toString() ??
    (typeof propertyId === "string" ? propertyId : undefined);
  if (!normalizedId) return false;

  return access.propertyIds.includes(normalizedId);
}

export function scopedIdsFilter(ids: string[]) {
  return { $in: ids };
}
