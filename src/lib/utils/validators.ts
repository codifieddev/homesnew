import { z } from "zod";
import {
  PROPERTY_CATEGORIES,
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  BHK_CONFIGS,
  FURNISHING_STATUS,
  PROPERTY_AGE,
  POSSESSION_STATUS,
  FACING_DIRECTIONS,
  PARKING_TYPES,
  WATER_SUPPLY_OPTIONS,
  POWER_BACKUP_OPTIONS,
  GAS_CONNECTION_OPTIONS,
  OWNERSHIP_TYPES,
  ZONING_TYPES,
  LISTING_BY,
  PROPERTY_STATUSES,
  AREA_UNITS,
  LEAD_STAGES,
  LEAD_SOURCES,
  ENQUIRY_STATUSES,
  ENQUIRY_INTERESTS,
  SITE_VISIT_STATUSES,
  SITE_VISIT_OUTCOMES,
  PUBLISH_STATUSES,
  COMPANY_THEME_PRESETS,
  PROPERTY_SITE_TEMPLATES,
  PAGE_CONTEXTS,
} from "@/lib/utils/constants";

// ─── SHARED ───────────────────────────────────────────────────────────────────

const phoneSchema = z
  .string()
  .min(7, "Phone number too short")
  .max(15, "Phone number too long")
  .regex(/^[+]?[\d\s\-()]+$/, "Invalid phone number format");

const emailSchema = z
  .string()
  .email("Invalid email address")
  .optional()
  .or(z.literal(""));

const mediaUrlSchema = z.string().refine((value) => {
  if (value.startsWith("/")) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, "Invalid media URL");

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier format");

const optionalObjectIdSchema = objectIdSchema.optional().or(z.literal(""));

const urlOrRelativeSchema = z
  .string()
  .refine((value) => {
    if (!value) return true;
    if (value.startsWith("/")) return true;

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, "Invalid URL")
  .optional()
  .or(z.literal(""));

const TrackingValidator = z.object({
  sourceTag: z.string().optional(),
  campaignTag: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  gaMeasurementId: z.string().optional(),
  tagManagerId: z.string().optional(),
  metaPixelId: z.string().optional(),
});

// ─── PROPERTY ────────────────────────────────────────────────────────────────

export const LocationValidator = z.object({
  coordinates: z.tuple([z.number(), z.number()]).refine(
    ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
    "Invalid coordinates — must be [longitude, latitude]"
  ),
  address: z.string().min(1, "Address is required"),
  locality: z.string().min(1, "Locality is required"),
  city: z.string().min(1, "City is required").default("Lucknow"),
  state: z.string().min(1, "State is required").default("Uttar Pradesh"),
  pincode: z.string().optional(),
  googleMapsUrl: z.string().url("Invalid Google Maps URL").optional().or(z.literal("")),
});

export const FinancialsValidator = z.object({
  listedPrice: z.number().positive("Price must be greater than 0"),
  priceType: z.enum(["total", "per_sqft", "monthly_rent"]).default("total"),
  pricePerSqft: z.number().positive().optional(),
  maintenanceCharges: z.number().min(0).optional(),
  maintenancePeriod: z.enum(["monthly", "quarterly", "included"]).optional(),
  securityDeposit: z.number().min(0).optional(),
  brokerageFee: z.string().optional(),
  tokenAmount: z.number().min(0).optional(),
  isTokenRefundable: z.boolean().default(true),
  stampDutyPercent: z.number().min(0).max(100).optional(),
  registrationChargesPercent: z.number().min(0).max(100).optional(),
  gstApplicable: z.boolean().default(false),
  homeLoanAvailable: z.boolean().default(true),
  approvedBanks: z.array(z.string()).default([]),
});

export const SizeLayoutValidator = z.object({
  builtUpArea: z.number().positive().optional(),
  carpetArea: z.number().positive().optional(),
  superBuiltUpArea: z.number().positive().optional(),
  plotArea: z.number().positive().optional(),
  plotDimensions: z.string().optional(),
  areaUnit: z.enum(AREA_UNITS).default("sqft"),
  ceilingHeight: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  balconies: z.number().min(0).optional(),
  parkingAvailable: z.boolean().default(false),
  parkingType: z.enum(PARKING_TYPES).optional(),
  parkingSlots: z.number().min(0).optional(),
});

export const SpecificationsValidator = z.object({
  category: z.enum(PROPERTY_CATEGORIES).default("Residential"),
  propertyType: z.enum(PROPERTY_TYPES),
  transactionType: z.enum(TRANSACTION_TYPES).default("Sale"),
  bhkConfig: z.enum(BHK_CONFIGS).optional(),
  furnishingStatus: z.enum(FURNISHING_STATUS).optional(),
  propertyAge: z.enum(PROPERTY_AGE).optional(),
  possessionStatus: z.enum(POSSESSION_STATUS).default("Ready to Move"),
  availabilityDate: z.string().optional(),
  facingDirection: z.enum(FACING_DIRECTIONS).optional(),
  isCornerUnit: z.boolean().default(false),
  floorNumber: z.string().optional(),
  totalFloors: z.string().optional(),
});

export const FeaturesValidator = z.object({
  amenities: z.array(z.string()).default([]),
  waterSupply: z.enum(WATER_SUPPLY_OPTIONS).optional(),
  powerBackup: z.enum(POWER_BACKUP_OPTIONS).optional(),
  gasConnection: z.enum(GAS_CONNECTION_OPTIONS).optional(),
  internetAvailable: z.boolean().default(false),
  isVastuCompliant: z.boolean().optional(),
  isPetFriendly: z.boolean().optional(),
  isGatedCommunity: z.boolean().default(false),
  isGreenBuilding: z.boolean().default(false),
  hasSmartHome: z.boolean().default(false),
  isWheelchairAccessible: z.boolean().default(false),
});

export const LegalInfoValidator = z.object({
  ownershipType: z.enum(OWNERSHIP_TYPES).default("Freehold"),
  zoningType: z.enum(ZONING_TYPES).default("Residential"),
  reraRegistered: z.boolean().default(false),
  reraId: z.string().optional(),
  titleClearance: z.enum(["Clear", "Under Litigation", "NA"]).default("NA"),
  encumbranceStatus: z.enum(["Encumbrance Free", "Mortgaged"]).optional(),
  occupancyCertificate: z.enum(["Available", "Applied", "Not Available"]).optional(),
  completionCertificate: z.enum(["Available", "Not Available"]).optional(),
  landUseCertificate: z.enum(["Available", "Not Available"]).optional(),
  propertyTaxStatus: z.enum(["Paid Up-to-Date", "Pending", "NA"]).default("NA"),
  societyRegistration: z.enum(["Registered", "Unregistered", "Under Process"]).optional(),
}).refine(
  (data) => !data.reraRegistered || (data.reraRegistered && !!data.reraId?.trim()),
  { message: "RERA ID is required when RERA Registered is true", path: ["reraId"] }
);

export const BrokeragePolicyValidator = z.object({
  listedBy: z.enum(LISTING_BY).default("Agent"),
  brokerName: z.string().optional(),
  contactPreference: z.array(z.string()).default([]),
  siteVisitAvailability: z.string().optional(),
  virtualTourAvailable: z.boolean().default(false),
  virtualTourUrl: z.string().optional(),
  listingValidity: z.number().min(1).default(90),
  isNegotiable: z.boolean().default(true),
  isExclusiveListing: z.boolean().default(false),
  coBrokerageAllowed: z.boolean().default(false),
  shortlistingSupport: z.boolean().default(true),
  documentationSupport: z.boolean().default(true),
});

export const NearbyPlaceValidator = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  distanceMinutes: z.number().min(0).optional(),
  distanceKm: z.number().min(0).optional(),
});

export const MediaAssetValidator = z.object({
  url: mediaUrlSchema,
  type: z.enum(["image", "floorplan", "brochure", "video", "virtual_tour"]).default("image"),
  caption: z.string().optional(),
  isCover: z.boolean().default(false),
  order: z.number().default(0),
});

export const UnitPlanValidator = z.object({
  name: z.string().min(1, "Unit plan name is required"),
  bhkLabel: z.string().optional(),
  carpetArea: z.number().positive().optional(),
  superBuiltUpArea: z.number().positive().optional(),
  priceLabel: z.string().optional(),
  availability: z.string().optional(),
  floorLabel: z.string().optional(),
  facingDirection: z.enum(FACING_DIRECTIONS).optional(),
  floorplanUrl: urlOrRelativeSchema,
  walkthroughUrl: urlOrRelativeSchema,
  description: z.string().max(500).optional(),
});

// Full property create/update validator
export const PropertyValidator = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  slug: z
    .string()
    .min(3, "Slug too short")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  developerName: z.string().min(2, "Developer name required"),
  companyId: optionalObjectIdSchema.transform((value) => value || undefined),
  projectName: z.string().optional(),
  tagline: z.string().max(160).optional(),
  status: z.enum(PROPERTY_STATUSES).default("active"),
  isFeatured: z.boolean().default(false),
  location: LocationValidator,
  specifications: SpecificationsValidator,
  sizeLayout: SizeLayoutValidator,
  financials: FinancialsValidator,
  features: FeaturesValidator,
  legalInfo: LegalInfoValidator,
  brokeragePolicy: BrokeragePolicyValidator,
  mediaAssets: z.array(MediaAssetValidator).default([]),
  nearbyPlaces: z.array(NearbyPlaceValidator).default([]),
  unitPlans: z.array(UnitPlanValidator).default([]),
});

export type PropertyInput = z.infer<typeof PropertyValidator>;

// Filters for search/listing
export const PropertyFiltersValidator = z.object({
  category: z.enum(PROPERTY_CATEGORIES).optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional(),
  transactionType: z.enum(TRANSACTION_TYPES).optional(),
  city: z.string().optional(),
  locality: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  bhkConfig: z.enum(BHK_CONFIGS).optional(),
  possessionStatus: z.enum(POSSESSION_STATUS).optional(),
  isGatedCommunity: z.boolean().optional(),
  reraRegistered: z.boolean().optional(),
  status: z.enum(PROPERTY_STATUSES).optional().default("active"),
  isFeatured: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PropertyFiltersInput = z.infer<typeof PropertyFiltersValidator>;

// ─── ENQUIRY ─────────────────────────────────────────────────────────────────

export const EnquiryValidator = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: phoneSchema,
  email: emailSchema,
  message: z.string().max(2000).optional(),
  propertyId: z.string().optional(),
  companyId: z.string().optional(),
  propertySiteId: z.string().optional(),
  propertyName: z.string().optional(),
  propertySlug: z.string().optional(),
  pageContext: z.enum(PAGE_CONTEXTS).default("main_site"),
  tracking: TrackingValidator.optional(),
  interestedIn: z.array(z.enum(ENQUIRY_INTERESTS)).default(["general"]),
  budgetRange: z.string().optional(),
  source: z.enum(LEAD_SOURCES).default("website"),
});

export type EnquiryInput = z.infer<typeof EnquiryValidator>;

export const EnquiryStatusUpdateValidator = z.object({
  id: z.string().min(1),
  status: z.enum(ENQUIRY_STATUSES),
});

// ─── LEAD ────────────────────────────────────────────────────────────────────

export const LeadValidator = z.object({
  name: z.string().min(2).max(100),
  phone: phoneSchema,
  email: emailSchema,
  stage: z.enum(LEAD_STAGES).default("new"),
  source: z.enum(LEAD_SOURCES).default("website"),
  score: z.number().min(0).max(100).optional(),
  propertyId: z.string().optional(),
  companyId: z.string().optional(),
  propertySiteId: z.string().optional(),
  propertyName: z.string().optional(),
  propertySlug: z.string().optional(),
  pageContext: z.enum(PAGE_CONTEXTS).default("main_site"),
  tracking: TrackingValidator.optional(),
  assignedTo: z.string().optional(),
  budget: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  requirements: z.string().max(1000).optional(),
  interestedIn: z.array(z.enum(ENQUIRY_INTERESTS)).default([]),
  convertedFromEnquiryId: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadValidator>;

export const LeadStageUpdateValidator = z.object({
  leadId: z.string().min(1, "Lead ID required"),
  stage: z.enum(LEAD_STAGES),
  note: z.string().max(500).optional(),
});

export const LeadAssignValidator = z.object({
  leadId: z.string().min(1),
  agentId: z.string().min(1, "Agent ID required"),
  agentName: z.string().min(1),
});

export const ActivityLogValidator = z.object({
  leadId: z.string().min(1),
  action: z.string().min(1, "Action description required").max(200),
  note: z.string().max(500).optional(),
});

export type LeadStageUpdateInput = z.infer<typeof LeadStageUpdateValidator>;

// ─── SITE VISIT ───────────────────────────────────────────────────────────────

export const SiteVisitValidator = z.object({
  leadId: z.string().min(1, "Lead ID required"),
  propertyId: z.string().min(1, "Property ID required"),
  companyId: z.string().optional(),
  propertySiteId: z.string().optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  propertyName: z.string().optional(),
  propertySlug: z.string().optional(),
  assignedAgentId: z.string().min(1, "Agent is required"),
  assignedAgentName: z.string().optional(),
  scheduledAt: z.string().min(1, "Schedule date and time required"),
  clientName: z.string().min(2, "Client name required"),
  clientPhone: phoneSchema,
  clientEmail: emailSchema,
  notes: z.string().max(1000).optional(),
});

export type SiteVisitInput = z.infer<typeof SiteVisitValidator>;

export const SiteVisitStatusUpdateValidator = z.object({
  visitId: z.string().min(1),
  status: z.enum(SITE_VISIT_STATUSES),
  outcome: z.enum(SITE_VISIT_OUTCOMES).optional(),
  agentNotes: z.string().max(2000).optional(),
  rescheduledTo: z.string().optional(),
});

// ─── COMPANIES / CASE STUDIES / PROPERTY SITES ───────────────────────────────

const SocialLinkValidator = z.object({
  platform: z.string().min(1),
  label: z.string().optional(),
  url: z.string().url("Invalid social link URL"),
});

const CompanyContactValidator = z.object({
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  whatsapp: phoneSchema.optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  salesLabel: z.string().optional(),
});

const CompanyAddressValidator = z.object({
  line1: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  mapLink: z.string().url("Invalid map link").optional().or(z.literal("")),
});

const CaseStudyOutcomeValidator = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const PropertySiteNavItemValidator = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  enabled: z.boolean().default(true),
});

const PropertySiteSectionValidator = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  enabled: z.boolean().default(true),
  order: z.number().min(0),
});

const PropertySiteContactValidator = z.object({
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  whatsapp: phoneSchema.optional(),
  officeAddress: z.string().optional(),
  mapLink: z.string().url("Invalid map link").optional().or(z.literal("")),
});

const SeoOverridesValidator = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(320).optional(),
  keywords: z.array(z.string()).default([]),
  canonicalUrl: z.string().url("Invalid canonical URL").optional().or(z.literal("")),
  ogImage: urlOrRelativeSchema,
});

export const CompanyValidator = z.object({
  name: z.string().min(2, "Company name is required"),
  slug: z
    .string()
    .min(3, "Slug too short")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  logo: urlOrRelativeSchema,
  shortIntro: z.string().max(220).optional(),
  fullProfile: z.string().max(5000).optional(),
  contact: CompanyContactValidator.default({}),
  address: CompanyAddressValidator.default({}),
  socialLinks: z.array(SocialLinkValidator).default([]),
  themePreset: z.enum(COMPANY_THEME_PRESETS).default("signature_navy"),
  featured: z.boolean().default(false),
  status: z.enum(PUBLISH_STATUSES).default("draft"),
  assignedManagerIds: z.array(objectIdSchema).default([]),
});

export type CompanyInput = z.infer<typeof CompanyValidator>;

export const CaseStudyValidator = z.object({
  companyId: objectIdSchema,
  propertyIds: z.array(objectIdSchema).default([]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z
    .string()
    .min(3, "Slug too short")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  summary: z.string().min(20, "Summary must be at least 20 characters"),
  challenge: z.string().max(2000).optional(),
  solution: z.string().max(2000).optional(),
  outcomes: z.array(CaseStudyOutcomeValidator).min(1, "Add at least one outcome"),
  testimonialQuote: z.string().max(500).optional(),
  media: z.array(MediaAssetValidator).default([]),
  featured: z.boolean().default(false),
  publishStatus: z.enum(PUBLISH_STATUSES).default("draft"),
});

export type CaseStudyInput = z.infer<typeof CaseStudyValidator>;

export const PropertySiteValidator = z.object({
  propertyId: objectIdSchema,
  companyId: optionalObjectIdSchema.transform((value) => value || undefined),
  siteSlug: z
    .string()
    .min(3, "Slug too short")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  template: z.enum(PROPERTY_SITE_TEMPLATES).default("signature_landing"),
  themePreset: z.enum(COMPANY_THEME_PRESETS).default("signature_navy"),
  publishStatus: z.enum(PUBLISH_STATUSES).default("draft"),
  heroTitle: z.string().max(200).optional(),
  heroSubtitle: z.string().max(500).optional(),
  heroCtaLabel: z.string().max(60).optional(),
  heroSecondaryCtaLabel: z.string().max(60).optional(),
  contact: PropertySiteContactValidator.default({}),
  navigation: z.array(PropertySiteNavItemValidator).default([]),
  sections: z.array(PropertySiteSectionValidator).default([]),
  seo: SeoOverridesValidator.default({ keywords: [] }),
  tracking: TrackingValidator.default({}),
  customDomains: z.array(z.string().min(1)).default([]),
});

export type PropertySiteInput = z.infer<typeof PropertySiteValidator>;

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const LoginValidator = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const ChangePasswordValidator = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
