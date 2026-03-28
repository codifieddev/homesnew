import mongoose, { Schema, model, models, Document } from "mongoose";
import type { IProperty } from "@/types";
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
} from "@/lib/utils/constants";

export type PropertyDocument = IProperty & Document;

// ─── SUB-SCHEMAS ──────────────────────────────────────────────────────────────

const LocationSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: "Coordinates must be [longitude, latitude]",
      },
    },
    address: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, default: "Lucknow" },
    state: { type: String, required: true, trim: true, default: "Uttar Pradesh" },
    pincode: { type: String, trim: true },
    googleMapsUrl: { type: String, trim: true },
  },
  { _id: false }
);

const FinancialsSchema = new Schema(
  {
    listedPrice: { type: Number, required: true, min: 0 },
    priceType: {
      type: String,
      enum: ["total", "per_sqft", "monthly_rent"],
      default: "total",
    },
    pricePerSqft: { type: Number, min: 0 },
    maintenanceCharges: { type: Number, min: 0 },
    maintenancePeriod: {
      type: String,
      enum: ["monthly", "quarterly", "included"],
    },
    securityDeposit: { type: Number, min: 0 },
    brokerageFee: { type: String },
    tokenAmount: { type: Number, min: 0 },
    isTokenRefundable: { type: Boolean, default: true },
    stampDutyPercent: { type: Number, min: 0, max: 100 },
    registrationChargesPercent: { type: Number, min: 0, max: 100 },
    gstApplicable: { type: Boolean, default: false },
    homeLoanAvailable: { type: Boolean, default: true },
    approvedBanks: [{ type: String }],
  },
  { _id: false }
);

const SizeLayoutSchema = new Schema(
  {
    builtUpArea: { type: Number, min: 0 },
    carpetArea: { type: Number, min: 0 },
    superBuiltUpArea: { type: Number, min: 0 },
    plotArea: { type: Number, min: 0 },
    plotDimensions: { type: String, trim: true },
    areaUnit: {
      type: String,
      enum: AREA_UNITS,
      default: "sqft",
    },
    ceilingHeight: { type: String },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    balconies: { type: Number, min: 0 },
    parkingAvailable: { type: Boolean, default: false },
    parkingType: { type: String, enum: PARKING_TYPES },
    parkingSlots: { type: Number, min: 0 },
  },
  { _id: false }
);

const SpecificationsSchema = new Schema(
  {
    category: {
      type: String,
      enum: PROPERTY_CATEGORIES,
      required: true,
      default: "Residential",
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: true,
    },
    transactionType: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
      default: "Sale",
    },
    bhkConfig: { type: String, enum: BHK_CONFIGS },
    furnishingStatus: { type: String, enum: FURNISHING_STATUS },
    propertyAge: { type: String, enum: PROPERTY_AGE },
    possessionStatus: {
      type: String,
      enum: POSSESSION_STATUS,
      required: true,
      default: "Ready to Move",
    },
    availabilityDate: { type: Date },
    facingDirection: { type: String, enum: FACING_DIRECTIONS },
    isCornerUnit: { type: Boolean, default: false },
    floorNumber: { type: String },
    totalFloors: { type: String },
  },
  { _id: false }
);

const FeaturesSchema = new Schema(
  {
    amenities: [{ type: String }],
    waterSupply: { type: String, enum: WATER_SUPPLY_OPTIONS },
    powerBackup: { type: String, enum: POWER_BACKUP_OPTIONS },
    gasConnection: { type: String, enum: GAS_CONNECTION_OPTIONS },
    internetAvailable: { type: Boolean, default: false },
    isVastuCompliant: { type: Boolean },
    isPetFriendly: { type: Boolean },
    isGatedCommunity: { type: Boolean, default: false },
    isGreenBuilding: { type: Boolean, default: false },
    hasSmartHome: { type: Boolean, default: false },
    isWheelchairAccessible: { type: Boolean, default: false },
  },
  { _id: false }
);

const LegalInfoSchema = new Schema(
  {
    ownershipType: {
      type: String,
      enum: OWNERSHIP_TYPES,
      default: "Freehold",
    },
    zoningType: {
      type: String,
      enum: ZONING_TYPES,
      default: "Residential",
    },
    reraRegistered: { type: Boolean, default: false },
    reraId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    titleClearance: {
      type: String,
      enum: ["Clear", "Under Litigation", "NA"],
      default: "NA",
    },
    encumbranceStatus: {
      type: String,
      enum: ["Encumbrance Free", "Mortgaged"],
    },
    occupancyCertificate: {
      type: String,
      enum: ["Available", "Applied", "Not Available"],
    },
    completionCertificate: {
      type: String,
      enum: ["Available", "Not Available"],
    },
    landUseCertificate: {
      type: String,
      enum: ["Available", "Not Available"],
    },
    propertyTaxStatus: {
      type: String,
      enum: ["Paid Up-to-Date", "Pending", "NA"],
      default: "NA",
    },
    societyRegistration: {
      type: String,
      enum: ["Registered", "Unregistered", "Under Process"],
    },
  },
  { _id: false }
);

const BrokeragePolicySchema = new Schema(
  {
    listedBy: {
      type: String,
      enum: LISTING_BY,
      default: "Agent",
    },
    brokerName: { type: String, trim: true },
    contactPreference: [{ type: String }],
    siteVisitAvailability: { type: String },
    virtualTourAvailable: { type: Boolean, default: false },
    virtualTourUrl: { type: String },
    listingValidity: { type: Number, default: 90 },
    isNegotiable: { type: Boolean, default: true },
    isExclusiveListing: { type: Boolean, default: false },
    coBrokerageAllowed: { type: Boolean, default: false },
    shortlistingSupport: { type: Boolean, default: true },
    documentationSupport: { type: Boolean, default: true },
  },
  { _id: false }
);

const NearbyPlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    distanceMinutes: { type: Number, min: 0 },
    distanceKm: { type: Number, min: 0 },
  },
  { _id: false }
);

const MediaAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "floorplan", "brochure", "video", "virtual_tour"],
      default: "image",
    },
    caption: { type: String, trim: true },
    isCover: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const UnitPlanSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    bhkLabel: { type: String, trim: true },
    carpetArea: { type: Number, min: 0 },
    superBuiltUpArea: { type: Number, min: 0 },
    priceLabel: { type: String, trim: true },
    availability: { type: String, trim: true },
    floorLabel: { type: String, trim: true },
    facingDirection: { type: String, enum: FACING_DIRECTIONS },
    floorplanUrl: { type: String, trim: true },
    walkthroughUrl: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

// ─── MAIN PROPERTY SCHEMA ─────────────────────────────────────────────────────

const PropertySchema = new Schema<PropertyDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    developerName: { type: String, required: true, trim: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    projectName: { type: String, trim: true },
    tagline: { type: String, trim: true, maxlength: 160 },
    status: {
      type: String,
      enum: PROPERTY_STATUSES,
      default: "active",
    },

    location: { type: LocationSchema, required: true },
    specifications: { type: SpecificationsSchema, required: true },
    sizeLayout: { type: SizeLayoutSchema, required: true },
    financials: { type: FinancialsSchema, required: true },
    features: { type: FeaturesSchema, required: true },
    legalInfo: { type: LegalInfoSchema, required: true },
    brokeragePolicy: { type: BrokeragePolicySchema, required: true },

    mediaAssets: [MediaAssetSchema],
    nearbyPlaces: [NearbyPlaceSchema],
    unitPlans: [UnitPlanSchema],

    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────

// Geospatial index for location-based queries
PropertySchema.index({ "location": "2dsphere" });

// Compound index for search filtering
PropertySchema.index({
  status: 1,
  "specifications.propertyType": 1,
  "financials.listedPrice": 1,
});
PropertySchema.index({ companyId: 1, status: 1 });

// Compound index for category + transaction filtering
PropertySchema.index({
  "specifications.category": 1,
  "specifications.transactionType": 1,
  status: 1,
});

// Text search index
PropertySchema.index({
  title: "text",
  description: "text",
  developerName: "text",
  "location.locality": "text",
  "location.city": "text",
});

// Featured listings query
PropertySchema.index({ isFeatured: 1, status: 1, createdAt: -1 });

// ─── VIRTUAL ──────────────────────────────────────────────────────────────────

PropertySchema.virtual("coverImage").get(function () {
  const cover = this.mediaAssets?.find((m) => m.isCover && m.type === "image");
  if (cover) return cover.url;
  const first = this.mediaAssets?.find((m) => m.type === "image");
  return first?.url ?? null;
});

PropertySchema.virtual("formattedPrice").get(function () {
  const price = this.financials?.listedPrice;
  if (!price) return null;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lac`;
  return `₹${price.toLocaleString("en-IN")}`;
});

// ─── EXPORT ───────────────────────────────────────────────────────────────────

const Property =
  (models.Property as mongoose.Model<PropertyDocument>) ||
  model<PropertyDocument>("Property", PropertySchema);

export default Property;
