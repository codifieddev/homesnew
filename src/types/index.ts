import type {
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
  USER_ROLES,
  NEARBY_CATEGORIES,
  PUBLISH_STATUSES,
  COMPANY_THEME_PRESETS,
  PROPERTY_SITE_TEMPLATES,
  PAGE_CONTEXTS,
} from "@/lib/utils/constants";

// ─── UTILITY TYPES ────────────────────────────────────────────────────────────

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type BHKConfig = (typeof BHK_CONFIGS)[number];
export type FurnishingStatus = (typeof FURNISHING_STATUS)[number];
export type PropertyAge = (typeof PROPERTY_AGE)[number];
export type PossessionStatus = (typeof POSSESSION_STATUS)[number];
export type FacingDirection = (typeof FACING_DIRECTIONS)[number];
export type ParkingType = (typeof PARKING_TYPES)[number];
export type WaterSupply = (typeof WATER_SUPPLY_OPTIONS)[number];
export type PowerBackup = (typeof POWER_BACKUP_OPTIONS)[number];
export type GasConnection = (typeof GAS_CONNECTION_OPTIONS)[number];
export type OwnershipType = (typeof OWNERSHIP_TYPES)[number];
export type ZoningType = (typeof ZONING_TYPES)[number];
export type ListingBy = (typeof LISTING_BY)[number];
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];
export type AreaUnit = (typeof AREA_UNITS)[number];
export type LeadStage = (typeof LEAD_STAGES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export type EnquiryInterest = (typeof ENQUIRY_INTERESTS)[number];
export type SiteVisitStatus = (typeof SITE_VISIT_STATUSES)[number];
export type SiteVisitOutcome = (typeof SITE_VISIT_OUTCOMES)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type NearbyCategory = (typeof NEARBY_CATEGORIES)[number];
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];
export type CompanyThemePreset = (typeof COMPANY_THEME_PRESETS)[number];
export type PropertySiteTemplate = (typeof PROPERTY_SITE_TEMPLATES)[number];
export type PageContext = (typeof PAGE_CONTEXTS)[number];

// ─── PROPERTY ────────────────────────────────────────────────────────────────

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ILocation {
  type: "Point";
  coordinates: [number, number];
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsUrl?: string;
}

export interface IFinancials {
  listedPrice: number;
  priceType: "total" | "per_sqft" | "monthly_rent";
  pricePerSqft?: number;
  maintenanceCharges?: number;
  maintenancePeriod?: "monthly" | "quarterly" | "included";
  securityDeposit?: number;
  brokerageFee?: string;
  tokenAmount?: number;
  isTokenRefundable?: boolean;
  stampDutyPercent?: number;
  registrationChargesPercent?: number;
  gstApplicable: boolean;
  homeLoanAvailable: boolean;
  approvedBanks?: string[];
}

export interface ISizeLayout {
  builtUpArea?: number;
  carpetArea?: number;
  superBuiltUpArea?: number;
  plotArea?: number;
  plotDimensions?: string;
  areaUnit: AreaUnit;
  ceilingHeight?: string;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  parkingAvailable: boolean;
  parkingType?: ParkingType;
  parkingSlots?: number;
}

export interface ISpecifications {
  category: PropertyCategory;
  propertyType: PropertyType;
  transactionType: TransactionType;
  bhkConfig?: BHKConfig;
  furnishingStatus?: FurnishingStatus;
  propertyAge?: PropertyAge;
  possessionStatus: PossessionStatus;
  availabilityDate?: Date | string;
  facingDirection?: FacingDirection;
  isCornerUnit?: boolean;
  floorNumber?: string;
  totalFloors?: string;
}

export interface IFeatures {
  amenities: string[];
  waterSupply?: WaterSupply;
  powerBackup?: PowerBackup;
  gasConnection?: GasConnection;
  internetAvailable?: boolean;
  isVastuCompliant?: boolean;
  isPetFriendly?: boolean;
  isGatedCommunity: boolean;
  isGreenBuilding?: boolean;
  hasSmartHome?: boolean;
  isWheelchairAccessible?: boolean;
}

export interface ILegalInfo {
  ownershipType: OwnershipType;
  zoningType: ZoningType;
  reraRegistered: boolean;
  reraId?: string;
  titleClearance?: "Clear" | "Under Litigation" | "NA";
  encumbranceStatus?: "Encumbrance Free" | "Mortgaged";
  occupancyCertificate?: "Available" | "Applied" | "Not Available";
  completionCertificate?: "Available" | "Not Available";
  landUseCertificate?: "Available" | "Not Available";
  propertyTaxStatus?: "Paid Up-to-Date" | "Pending" | "NA";
  societyRegistration?: "Registered" | "Unregistered" | "Under Process";
}

export interface IBrokeragePolicy {
  listedBy: ListingBy;
  brokerName?: string;
  contactPreference?: string[];
  siteVisitAvailability?: string;
  virtualTourAvailable?: boolean;
  virtualTourUrl?: string;
  listingValidity?: number;
  isNegotiable: boolean;
  isExclusiveListing?: boolean;
  coBrokerageAllowed?: boolean;
  shortlistingSupport?: boolean;
  documentationSupport?: boolean;
}

export interface INearbyPlace {
  name: string;
  category: NearbyCategory;
  distanceMinutes?: number;
  distanceKm?: number;
}

export interface IMediaAsset {
  url: string;
  type: "image" | "floorplan" | "brochure" | "video" | "virtual_tour";
  caption?: string;
  isCover?: boolean;
  order?: number;
}

export interface IUnitPlan {
  name: string;
  bhkLabel?: string;
  carpetArea?: number;
  superBuiltUpArea?: number;
  priceLabel?: string;
  availability?: string;
  floorLabel?: string;
  facingDirection?: FacingDirection;
  floorplanUrl?: string;
  walkthroughUrl?: string;
  description?: string;
}

export interface ICompanyContact {
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  salesLabel?: string;
}

export interface ICompanyAddress {
  line1?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  mapLink?: string;
}

export interface ISocialLink {
  platform: string;
  label?: string;
  url: string;
}

export interface ICaseStudyOutcome {
  label: string;
  value: string;
}

export interface ICompany {
  _id?: string;
  name: string;
  slug: string;
  logo?: string;
  shortIntro?: string;
  fullProfile?: string;
  contact?: ICompanyContact;
  address?: ICompanyAddress;
  socialLinks?: ISocialLink[];
  themePreset: CompanyThemePreset;
  featured: boolean;
  status: PublishStatus;
  assignedManagerIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICaseStudy {
  _id?: string;
  companyId: string;
  propertyIds?: string[];
  title: string;
  slug: string;
  summary: string;
  challenge?: string;
  solution?: string;
  outcomes: ICaseStudyOutcome[];
  testimonialQuote?: string;
  media?: IMediaAsset[];
  featured: boolean;
  publishStatus: PublishStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPropertySiteNavItem {
  label: string;
  href: string;
  enabled: boolean;
}

export interface IPropertySiteSection {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface IPropertySiteContact {
  phone?: string;
  email?: string;
  whatsapp?: string;
  officeAddress?: string;
  mapLink?: string;
}

export interface ISeoOverrides {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface ITrackingConfig {
  sourceTag?: string;
  campaignTag?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  gaMeasurementId?: string;
  tagManagerId?: string;
  metaPixelId?: string;
}

export interface IPropertySite {
  _id?: string;
  propertyId: string;
  companyId?: string;
  siteSlug: string;
  template: PropertySiteTemplate;
  themePreset: CompanyThemePreset;
  publishStatus: PublishStatus;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaLabel?: string;
  heroSecondaryCtaLabel?: string;
  contact?: IPropertySiteContact;
  navigation?: IPropertySiteNavItem[];
  sections?: IPropertySiteSection[];
  seo?: ISeoOverrides;
  tracking?: ITrackingConfig;
  customDomains?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProperty {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  developerName: string;
  companyId?: string;
  projectName?: string;
  tagline?: string;
  status: PropertyStatus;

  location: ILocation;
  specifications: ISpecifications;
  sizeLayout: ISizeLayout;
  financials: IFinancials;
  features: IFeatures;
  legalInfo: ILegalInfo;
  brokeragePolicy: IBrokeragePolicy;

  mediaAssets: IMediaAsset[];
  nearbyPlaces: INearbyPlace[];
  unitPlans?: IUnitPlan[];

  isFeatured: boolean;
  viewCount: number;
  enquiryCount: number;

  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPropertyFilters {
  category?: PropertyCategory;
  propertyType?: PropertyType;
  transactionType?: TransactionType;
  city?: string;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  bhkConfig?: BHKConfig;
  possessionStatus?: PossessionStatus;
  isGatedCommunity?: boolean;
  reraRegistered?: boolean;
  status?: PropertyStatus;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── LEAD ────────────────────────────────────────────────────────────────────

export interface ILeadActivity {
  action: string;
  note?: string;
  performedBy: string;
  performedAt: Date;
  stage?: LeadStage;
}

export interface ILead {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  stage: LeadStage;
  source: LeadSource;
  score?: number;

  propertyId?: string;
  companyId?: string;
  propertySiteId?: string;
  propertyName?: string;
  propertySlug?: string;
  pageContext?: PageContext;
  tracking?: ITrackingConfig;

  assignedTo?: string;
  assignedAgentName?: string;

  budget?: {
    min?: number;
    max?: number;
  };
  requirements?: string;
  interestedIn: EnquiryInterest[];

  activityLog: ILeadActivity[];

  convertedFromEnquiryId?: string;
  siteVisitId?: string;

  lostReason?: string;
  closedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

// ─── ENQUIRY ─────────────────────────────────────────────────────────────────

export interface IEnquiry {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;

  propertyId?: string;
  companyId?: string;
  propertySiteId?: string;
  propertyName?: string;
  propertySlug?: string;
  pageContext?: PageContext;
  tracking?: ITrackingConfig;

  interestedIn: EnquiryInterest[];
  budgetRange?: string;
  source?: LeadSource;
  status: EnquiryStatus;

  ipAddress?: string;
  userAgent?: string;

  reviewedBy?: string;
  reviewedAt?: Date;
  convertedLeadId?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

// ─── USER ─────────────────────────────────────────────────────────────────────

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── SITE VISIT ───────────────────────────────────────────────────────────────

export interface ISiteVisit {
  _id?: string;
  leadId: string;
  propertyId: string;
  companyId?: string;
  propertySiteId?: string;
  source?: LeadSource;
  propertyName?: string;
  propertySlug?: string;
  assignedAgentId: string;
  assignedAgentName?: string;

  scheduledAt: Date;
  status: SiteVisitStatus;
  outcome?: SiteVisitOutcome;

  clientName: string;
  clientPhone: string;
  clientEmail?: string;

  notes?: string;
  agentNotes?: string;
  completedAt?: Date;
  rescheduledTo?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

// ─── API RESPONSE WRAPPER ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
