/**
 * SEED SCRIPT
 * Run with: node --import tsx scripts/seed.ts
 *
 * This seeds:
 * 1. Core dashboard users (super admin, agent, company manager)
 * 2. Company profiles
 * 3. All 7 current Lucknow Homes projects as Property documents
 * 4. Featured case studies
 * 5. Property microsites
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not set in .env.local");
}

// ─── INLINE SCHEMAS (avoids import alias issues in scripts) ───────────────────

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: { type: String, select: false },
    role: { type: String, enum: ["super_admin", "admin", "agent", "company_manager"], default: "agent" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

const LocationSchema = new mongoose.Schema({ type: { type: String }, coordinates: [Number], address: String, locality: String, city: String, state: String, pincode: String, googleMapsUrl: String }, { _id: false });
const FinancialsSchema = new mongoose.Schema({ listedPrice: Number, priceType: String, pricePerSqft: Number, maintenanceCharges: Number, gstApplicable: Boolean, homeLoanAvailable: Boolean, approvedBanks: [String], isNegotiable: Boolean }, { _id: false });
const SizeLayoutSchema = new mongoose.Schema({ builtUpArea: Number, carpetArea: Number, superBuiltUpArea: Number, plotArea: Number, plotDimensions: String, areaUnit: String, bedrooms: Number, bathrooms: Number, balconies: Number, parkingAvailable: Boolean, parkingType: String, parkingSlots: Number }, { _id: false });
const SpecificationsSchema = new mongoose.Schema({ category: String, propertyType: String, transactionType: String, bhkConfig: String, possessionStatus: String, facingDirection: String, propertyAge: String, availabilityDate: Date }, { _id: false });
const FeaturesSchema = new mongoose.Schema({ amenities: [String], isGatedCommunity: Boolean, isVastuCompliant: Boolean, powerBackup: String, waterSupply: String }, { _id: false });
const LegalInfoSchema = new mongoose.Schema({ ownershipType: String, zoningType: String, reraRegistered: Boolean, reraId: String, titleClearance: String, encumbranceStatus: String }, { _id: false });
const BrokeragePolicySchema = new mongoose.Schema({ listedBy: String, isNegotiable: Boolean, documentationSupport: Boolean, shortlistingSupport: Boolean, siteVisitAvailability: String }, { _id: false });
const NearbyPlaceSchema = new mongoose.Schema({ name: String, category: String, distanceMinutes: Number, distanceKm: Number }, { _id: false });
const MediaAssetSchema = new mongoose.Schema({ url: String, type: String, caption: String, isCover: Boolean, order: Number }, { _id: false });
const UnitPlanSchema = new mongoose.Schema({
  name: String,
  bhkLabel: String,
  carpetArea: Number,
  superBuiltUpArea: Number,
  priceLabel: String,
  availability: String,
  floorLabel: String,
  floorplanUrl: String,
  walkthroughUrl: String,
  description: String,
}, { _id: false });

const PropertySchema = new mongoose.Schema(
  {
    title: String, slug: { type: String, unique: true }, description: String,
    developerName: String, projectName: String, tagline: String,
    companyId: mongoose.Schema.Types.ObjectId,
    status: { type: String, default: "active" },
    location: LocationSchema, specifications: SpecificationsSchema,
    sizeLayout: SizeLayoutSchema, financials: FinancialsSchema,
    features: FeaturesSchema, legalInfo: LegalInfoSchema,
    brokeragePolicy: BrokeragePolicySchema,
    mediaAssets: [MediaAssetSchema], nearbyPlaces: [NearbyPlaceSchema],
    unitPlans: [UnitPlanSchema],
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);
PropertySchema.index({ "location": "2dsphere" });

const CompanySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    logo: String,
    shortIntro: String,
    fullProfile: String,
    contact: {
      phone: String,
      email: String,
      whatsapp: String,
      website: String,
      salesLabel: String,
    },
    address: {
      line1: String,
      locality: String,
      city: String,
      state: String,
      pincode: String,
      mapLink: String,
    },
    socialLinks: [{ platform: String, label: String, url: String }],
    themePreset: { type: String, default: "signature_navy" },
    featured: { type: Boolean, default: false },
    status: { type: String, default: "published" },
    assignedManagerIds: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);

const OutcomeSchema = new mongoose.Schema(
  { label: String, value: String },
  { _id: false }
);

const CaseStudySchema = new mongoose.Schema(
  {
    companyId: mongoose.Schema.Types.ObjectId,
    propertyIds: [mongoose.Schema.Types.ObjectId],
    title: String,
    slug: { type: String, unique: true },
    summary: String,
    challenge: String,
    solution: String,
    outcomes: [OutcomeSchema],
    testimonialQuote: String,
    media: [MediaAssetSchema],
    featured: { type: Boolean, default: true },
    publishStatus: { type: String, default: "published" },
  },
  { timestamps: true }
);

const NavItemSchema = new mongoose.Schema(
  {
    label: String,
    href: String,
    enabled: Boolean,
  },
  { _id: false }
);

const SectionSchema = new mongoose.Schema(
  {
    id: String,
    label: String,
    enabled: Boolean,
    order: Number,
  },
  { _id: false }
);

const PropertySiteSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, unique: true },
    companyId: mongoose.Schema.Types.ObjectId,
    siteSlug: { type: String, unique: true },
    template: { type: String, default: "signature_landing" },
    themePreset: { type: String, default: "signature_navy" },
    publishStatus: { type: String, default: "published" },
    heroTitle: String,
    heroSubtitle: String,
    heroCtaLabel: String,
    heroSecondaryCtaLabel: String,
    contact: {
      phone: String,
      email: String,
      whatsapp: String,
      officeAddress: String,
      mapLink: String,
    },
    navigation: [NavItemSchema],
    sections: [SectionSchema],
    seo: {
      title: String,
      description: String,
      keywords: [String],
      canonicalUrl: String,
      ogImage: String,
    },
    tracking: {
      sourceTag: String,
      campaignTag: String,
      utmSource: String,
      utmMedium: String,
      utmCampaign: String,
    },
    customDomains: [String],
  },
  { timestamps: true }
);

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const properties = [
  // ── 1. Okas Enclave ──────────────────────────────────────────────────────
  {
    title: "Okas Enclave – Premium Residential Plots in Sushant Golf City",
    slug: "okas-enclave",
    description: "Pardos OKAS Enclave is a 6.46-acre plotted development project located in Sushant Golf City, Lucknow. It consists of plot sizes ranging from 112.5 sq.m. to 284.64 sq.m. with well-planned green areas, community facilities, and commercial shops within the project. Strategically located on the Sushant Golf City Hi-Tech Township, it offers great social infrastructure with leading schools, hospitals, and entertainment centres in its vicinity.",
    developerName: "Pardos Developers Pvt. Ltd.",
    projectName: "Okas Enclave",
    tagline: "Nature meets modern living in Sushant Golf City",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.9462, 26.8467],
      address: "Sushant Golf City, Sultanpur Road",
      locality: "Sushant Golf City",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226030",
    },
    specifications: {
      category: "Residential",
      propertyType: "Plot",
      transactionType: "Sale",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      plotArea: 112.5,
      plotDimensions: "112.5 sq.m. – 284.64 sq.m.",
      areaUnit: "sqm",
      parkingAvailable: true,
    },
    financials: {
      listedPrice: 5625000,
      priceType: "total",
      pricePerSqft: 5000,
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"],
    },
    features: {
      amenities: [
        "Green Area", "Wide Internal Roads", "Swimming Pool",
        "Rainwater Harvesting", "Jogging Track", "Children Play Area",
        "Yoga Park", "24x7 Security", "Gated Community", "Street Lights",
      ],
      isGatedCommunity: true,
      waterSupply: "24x7",
      powerBackup: "Partial",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ12345",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "Weekdays / Weekends / By Appointment",
    },
    nearbyPlaces: [
      { name: "HCL IT Park", category: "IT Parks", distanceMinutes: 5 },
      { name: "Lulu Mall", category: "Malls & Multiplex", distanceMinutes: 9 },
      { name: "Medanta Hospital", category: "Hospitals", distanceMinutes: 8 },
      { name: "DPS School", category: "Schools & Colleges", distanceMinutes: 10 },
      { name: "GD Goenka School", category: "Schools & Colleges", distanceMinutes: 5 },
      { name: "Charbagh Railway Station", category: "Key Landmarks", distanceMinutes: 25 },
      { name: "Airport", category: "Key Landmarks", distanceMinutes: 22 },
      { name: "Phoenix Palassio Mall", category: "Malls & Multiplex", distanceMinutes: 14 },
      { name: "Super Speciality Cancer Institute", category: "Hospitals", distanceMinutes: 6 },
    ],
    mediaAssets: [
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/gallery-1.jpg", type: "image", isCover: true, order: 1 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/gallery-2.jpg", type: "image", order: 2 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/gallery-3.jpg", type: "image", order: 3 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/gallery-4.jpg", type: "image", order: 4 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/11/plot-layout.jpeg", type: "floorplan", order: 5 },
    ],
  },

  // ── 2. Attalika Palms ────────────────────────────────────────────────────
  {
    title: "Attalika Palms – Premium Villas & Resale Plots",
    slug: "attalika-palms",
    description: "Attalika Palms is a premium residential development offering luxury villas and resale plots opposite DLF Garden City in Pursaini, Lucknow. Designed for those who seek a blend of comfort, privacy, and prestige, the project offers spacious 3-4 BHK villas with modern amenities in a gated community setting.",
    developerName: "Attalika Developers",
    projectName: "Attalika Palms",
    tagline: "Premium villas in a gated community setting",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.9980, 26.8120],
      address: "Pursaini, Opposite DLF Garden City",
      locality: "Pursaini",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
    },
    specifications: {
      category: "Residential",
      propertyType: "Villa",
      transactionType: "Sale",
      bhkConfig: "4 BHK",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      builtUpArea: 1450,
      areaUnit: "sqft",
      bedrooms: 4,
      bathrooms: 4,
      balconies: 2,
      parkingAvailable: true,
      parkingType: "Covered",
      parkingSlots: 2,
    },
    financials: {
      listedPrice: 6500000,
      priceType: "total",
      pricePerSqft: 4500,
      maintenanceCharges: 2500,
      maintenancePeriod: "monthly",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank"],
    },
    features: {
      amenities: [
        "Swimming Pool", "Gym", "Clubhouse", "Garden", "Jogging Track",
        "Children Play Area", "24x7 Security", "CCTV", "Gated Community",
        "Power Backup", "Wide Internal Roads",
      ],
      isGatedCommunity: true,
      isVastuCompliant: true,
      waterSupply: "24x7",
      powerBackup: "Full",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ23456",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "By Appointment",
    },
    nearbyPlaces: [
      { name: "DLF Garden City", category: "Key Landmarks", distanceMinutes: 2 },
      { name: "Airport", category: "Key Landmarks", distanceMinutes: 15 },
      { name: "City Centre Mall", category: "Malls & Multiplex", distanceMinutes: 12 },
      { name: "Ram Manohar Lohia Hospital", category: "Hospitals", distanceMinutes: 10 },
    ],
    mediaAssets: [
      { url: "/homes/banner.jpg.jpeg", type: "image", isCover: true, order: 1 },
    ],
  },

  // ── 3. Stellar Okas Golf View ─────────────────────────────────────────────
  {
    title: "Stellar Okas Golf View – Premium Resale Plots in Sushant Golf City",
    slug: "stellar-okas-golf-view",
    description: "Stellar Okas Golf View offers premium residential resale plots in Sector-H of the prestigious Sushant Golf City. With plots valued up to ₹3.80 Cr, these are among the most sought-after investment assets in Lucknow's high-growth corridor. The development features wide roads, manicured greenery, and direct proximity to the Lucknow Golf Club.",
    developerName: "Stellar Okas Developers",
    projectName: "Stellar Okas Golf View",
    tagline: "Golf view plots in Lucknow's most prestigious address",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.9510, 26.8440],
      address: "Sector-H, Sushant Golf City",
      locality: "Sushant Golf City",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226030",
    },
    specifications: {
      category: "Residential",
      propertyType: "Plot",
      transactionType: "Sale",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      plotArea: 300,
      areaUnit: "sqm",
      parkingAvailable: true,
    },
    financials: {
      listedPrice: 38000000,
      priceType: "total",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank", "Punjab National Bank"],
    },
    features: {
      amenities: [
        "Golf Course View", "Wide Internal Roads", "Green Area",
        "Street Lights", "24x7 Security", "Gated Community",
        "Rainwater Harvesting", "Underground Utilities",
      ],
      isGatedCommunity: true,
      waterSupply: "24x7",
      powerBackup: "Partial",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ34567",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "Weekdays / Weekends",
    },
    nearbyPlaces: [
      { name: "Lucknow Golf Club", category: "Key Landmarks", distanceMinutes: 5 },
      { name: "HCL IT Park", category: "IT Parks", distanceMinutes: 7 },
      { name: "Lulu Mall", category: "Malls & Multiplex", distanceMinutes: 10 },
      { name: "Medanta Hospital", category: "Hospitals", distanceMinutes: 10 },
      { name: "Airport", category: "Key Landmarks", distanceMinutes: 22 },
    ],
    mediaAssets: [
      { url: "/homes/pl.jpg.jpeg", type: "image", isCover: true, order: 1 },
    ],
  },

  // ── 4. Kailasha Enclave ───────────────────────────────────────────────────
  {
    title: "Kailasha Enclave – Township Plots on Sultanpur Road near IT City",
    slug: "kailasha-enclave",
    description: "Kailasha Enclave is a thoughtfully planned residential township offering resale plots on Sultanpur Road, adjacent to the booming IT City corridor in Lucknow. The project benefits from excellent connectivity to major IT parks, educational institutions, and upcoming infrastructure developments, making it an attractive long-term investment.",
    developerName: "Kailasha Developers",
    projectName: "Kailasha Enclave",
    tagline: "Your gateway to Lucknow's IT City corridor",
    status: "active",
    isFeatured: false,
    location: {
      type: "Point",
      coordinates: [80.9700, 26.7900],
      address: "Sultanpur Road, Near IT City",
      locality: "Sultanpur Road",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226011",
    },
    specifications: {
      category: "Residential",
      propertyType: "Plot",
      transactionType: "Sale",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      plotArea: 200,
      areaUnit: "sqm",
      parkingAvailable: true,
    },
    financials: {
      listedPrice: 4000000,
      priceType: "total",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank"],
    },
    features: {
      amenities: [
        "Wide Internal Roads", "Street Lights", "Green Area",
        "24x7 Security", "Gated Community", "Children Play Area",
      ],
      isGatedCommunity: true,
      waterSupply: "Municipal",
      powerBackup: "None",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ45678",
      titleClearance: "Clear",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "By Appointment",
    },
    nearbyPlaces: [
      { name: "IT City Lucknow", category: "IT Parks", distanceMinutes: 5 },
      { name: "Airport", category: "Key Landmarks", distanceMinutes: 18 },
      { name: "Amity University", category: "Schools & Colleges", distanceMinutes: 15 },
    ],
    mediaAssets: [
      { url: "/homes/download-3.jpg.jpeg", type: "image", isCover: true, order: 1 },
    ],
  },

  // ── 5. Greenberry Signature ───────────────────────────────────────────────
  {
    title: "Greenberry Signature – High-Rise Apartments in Vrindavan Yojana",
    slug: "greenberry-signature",
    description: "Greenberry Signature is a premium high-rise residential apartment complex located in Vrindavan Yojana, Awas Vikas, Lucknow. Offering spacious 2 and 3 BHK configurations starting at ₹5,200 per sq. ft., the project is designed for those seeking contemporary urban living with all modern amenities in a well-connected neighbourhood.",
    developerName: "Greenberry Group",
    projectName: "Greenberry Signature",
    tagline: "Contemporary high-rise living in Vrindavan Yojana",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.9050, 26.8700],
      address: "Vrindavan Yojana, Awas Vikas",
      locality: "Vrindavan Yojana",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226029",
    },
    specifications: {
      category: "Residential",
      propertyType: "Apartment",
      transactionType: "Sale",
      bhkConfig: "3 BHK",
      furnishingStatus: "Unfurnished",
      possessionStatus: "Ready to Move",
      propertyAge: "0-5 Years",
      totalFloors: "10-20",
    },
    sizeLayout: {
      builtUpArea: 1200,
      carpetArea: 980,
      superBuiltUpArea: 1450,
      areaUnit: "sqft",
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      parkingAvailable: true,
      parkingType: "Covered",
      parkingSlots: 1,
    },
    financials: {
      listedPrice: 7440000,
      priceType: "per_sqft",
      pricePerSqft: 5200,
      maintenanceCharges: 3000,
      maintenancePeriod: "monthly",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank", "Bank of Baroda"],
    },
    features: {
      amenities: [
        "Lift", "Power Backup", "Swimming Pool", "Gym", "Clubhouse",
        "Garden", "Jogging Track", "Children Play Area", "24x7 Security",
        "CCTV", "Intercom", "Gated Community", "Visitor Parking",
      ],
      isGatedCommunity: true,
      isVastuCompliant: true,
      waterSupply: "24x7",
      powerBackup: "Full",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ56789",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
      occupancyCertificate: "Available",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "Weekdays / Weekends / By Appointment",
    },
    nearbyPlaces: [
      { name: "City Montessori School", category: "Schools & Colleges", distanceMinutes: 8 },
      { name: "Sanjay Gandhi PGI", category: "Hospitals", distanceMinutes: 15 },
      { name: "Hazratganj", category: "Key Landmarks", distanceMinutes: 20 },
      { name: "Lulu Mall", category: "Malls & Multiplex", distanceMinutes: 18 },
    ],
    mediaAssets: [
      { url: "/homes/real-estate-06.jpg.jpeg", type: "image", isCover: true, order: 1 },
    ],
  },

  // ── 6. Lavanya Enclave ────────────────────────────────────────────────────
  {
    title: "Lavanya Enclave – Premium 2 & 3 BHK Flats & Residential Plots",
    slug: "lavanya-enclave",
    description: "Lavanya Enclave is a fully developed residential project located at the service lane of Amar Shaheed Path in Aurangabad Jagir, near Bijnor Road and Ramabai Ambedkar Maidan. The project offers both residential plots and 2-3 BHK apartments with excellent connectivity to Kanpur Road and Amar Shaheed Path. Along a 45-metre wide road, the project is enclosed within a well-secured gated community. This is an LDA, RERA and SBI approved project.",
    developerName: "Lavanya Developers",
    projectName: "Lavanya Enclave",
    tagline: "LDA & RERA approved — luxury at an affordable address",
    status: "active",
    isFeatured: true,
    location: {
      type: "Point",
      coordinates: [80.8900, 26.8100],
      address: "Amar Shaheed Path, Aurangabad Jagir, Bijnor Road",
      locality: "Aurangabad Jagir",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226012",
    },
    specifications: {
      category: "Residential",
      propertyType: "Apartment",
      transactionType: "Sale",
      bhkConfig: "3 BHK",
      furnishingStatus: "Unfurnished",
      possessionStatus: "Ready to Move",
      facingDirection: "East",
      propertyAge: "0-5 Years",
    },
    sizeLayout: {
      builtUpArea: 1330,
      carpetArea: 976,
      areaUnit: "sqft",
      bedrooms: 3,
      bathrooms: 2,
      balconies: 1,
      parkingAvailable: true,
      parkingType: "Open",
      parkingSlots: 1,
    },
    financials: {
      listedPrice: 8645000,
      priceType: "per_sqft",
      pricePerSqft: 6500,
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank", "ICICI Bank", "LDA Approved"],
    },
    features: {
      amenities: [
        "Badminton Court", "Landscape Garden", "Jogging Track",
        "Internal Street Lights", "Security Cabin", "CCTV Camera",
        "Children Play Area", "Gated Community",
      ],
      isGatedCommunity: true,
      isVastuCompliant: true,
      waterSupply: "24x7",
      powerBackup: "Partial",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ67890",
      titleClearance: "Clear",
      encumbranceStatus: "Encumbrance Free",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "Weekdays / Weekends / By Appointment / Anytime",
    },
    nearbyPlaces: [
      { name: "Chaudhary Charan Singh Airport", category: "Key Landmarks", distanceKm: 3 },
      { name: "Railway Station", category: "Key Landmarks", distanceKm: 5 },
      { name: "Kanpur Road", category: "Key Landmarks", distanceKm: 2 },
      { name: "Mall Palm Top", category: "Malls & Multiplex", distanceKm: 0.5 },
      { name: "Ramabai Ambedkar Maidan", category: "Key Landmarks", distanceKm: 0.2 },
    ],
    mediaAssets: [
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/03/IMG_20220227_185611.jpg", type: "image", isCover: true, order: 1 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/03/IMG_20220227_185541.jpg", type: "image", order: 2 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/03/IMG_20220301_180342.jpg", type: "image", order: 3 },
      { url: "https://lucknowhomes.in/wp-content/uploads/2022/02/0001-1-scaled.jpg", type: "floorplan", order: 4 },
    ],
  },

  // ── 7. Vikas Vihar ────────────────────────────────────────────────────────
  {
    title: "Vikas Vihar – Mixed Residential Development in Lucknow",
    slug: "vikas-vihar",
    description: "Vikas Vihar is a mixed residential development project in the Lucknow metropolitan region, offering a combination of residential plots and apartments designed for both first-time homebuyers and investors looking for long-term value appreciation.",
    developerName: "Vikas Developers",
    projectName: "Vikas Vihar",
    tagline: "Affordable mixed residential living in Lucknow",
    status: "active",
    isFeatured: false,
    location: {
      type: "Point",
      coordinates: [80.9200, 26.8350],
      address: "Lucknow Metropolitan Region",
      locality: "Lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
    },
    specifications: {
      category: "Residential",
      propertyType: "Plot",
      transactionType: "Sale",
      possessionStatus: "Ready to Move",
    },
    sizeLayout: {
      plotArea: 150,
      areaUnit: "sqm",
      parkingAvailable: true,
    },
    financials: {
      listedPrice: 3000000,
      priceType: "total",
      gstApplicable: false,
      homeLoanAvailable: true,
      approvedBanks: ["SBI", "HDFC Bank"],
    },
    features: {
      amenities: [
        "Wide Internal Roads", "Green Area", "Street Lights", "Security",
      ],
      isGatedCommunity: true,
      waterSupply: "Municipal",
    },
    legalInfo: {
      ownershipType: "Freehold",
      zoningType: "Residential",
      reraRegistered: true,
      reraId: "UPRERAPRJ78901",
      titleClearance: "Clear",
    },
    brokeragePolicy: {
      listedBy: "Agent",
      isNegotiable: true,
      documentationSupport: true,
      shortlistingSupport: true,
      siteVisitAvailability: "By Appointment",
    },
    nearbyPlaces: [
      { name: "Lucknow City Centre", category: "Key Landmarks", distanceMinutes: 20 },
    ],
    mediaAssets: [
      { url: "/homes/download-1.jpg.jpeg", type: "image", isCover: true, order: 1 },
    ],
  },
];

const DEFAULT_SECTIONS = [
  { id: "overview", label: "Overview", enabled: true, order: 0 },
  { id: "gallery", label: "Gallery", enabled: true, order: 1 },
  { id: "unit-plans", label: "Unit Plans", enabled: true, order: 2 },
  { id: "amenities", label: "Amenities", enabled: true, order: 3 },
  { id: "location", label: "Location", enabled: true, order: 4 },
  { id: "enquire", label: "Enquire", enabled: true, order: 5 },
];

const DEFAULT_NAVIGATION = [
  { label: "Overview", href: "#overview", enabled: true },
  { label: "Gallery", href: "#gallery", enabled: true },
  { label: "Unit Plans", href: "#unit-plans", enabled: true },
  { label: "Amenities", href: "#amenities", enabled: true },
  { label: "Location", href: "#location", enabled: true },
  { label: "Enquire", href: "#enquire", enabled: true },
];

const COMPANY_FIXTURES = [
  {
    name: "Pardos Developers Pvt. Ltd.",
    slug: "pardos-developers",
    shortIntro: "Premium plotted and residential development company with strong presence around Sushant Golf City.",
    fullProfile: "Pardos Developers works on premium residential layouts and launch positioning across Lucknow growth corridors. Inside Homes, this company profile powers linked listings, case studies, and conversion-first property microsites.",
    themePreset: "signature_navy",
  },
  {
    name: "Attalika Developers",
    slug: "attalika-developers",
    shortIntro: "Villa-focused residential developer positioned around premium gated inventory near Amar Shaheed Path.",
    fullProfile: "Attalika Developers focuses on premium villa inventory and plotted resale opportunities. The Homes platform uses this company layer to connect project storytelling with lead routing and case-study proof.",
    themePreset: "graphite_reserve",
  },
  {
    name: "Stellar Okas Developers",
    slug: "stellar-okas-developers",
    shortIntro: "Premium golf-view plotted inventory for high-intent buyers and investors in South Lucknow.",
    fullProfile: "Stellar Okas Developers sits in the premium plotted segment around Sushant Golf City. Homes uses this profile to connect high-ticket inventory with brand-level trust and guided advisory.",
    themePreset: "signature_navy",
  },
  {
    name: "Kailasha Enclave Developers",
    slug: "kailasha-enclave-developers",
    shortIntro: "Land-first residential inventory around Sultanpur Road and emerging South Lucknow micro-markets.",
    fullProfile: "Kailasha Enclave Developers focuses on plotted and low-density residential inventory. This company profile gives Homes a structured way to present land-led advisory and launch support.",
    themePreset: "cyan_horizon",
  },
  {
    name: "Greenberry Signature",
    slug: "greenberry-signature",
    shortIntro: "Luxury apartment positioning with lifestyle-led messaging and family-focused residential planning.",
    fullProfile: "Greenberry Signature represents premium apartment-led residential positioning. Homes ties this company record to listings, case studies, and future landing-page distribution.",
    themePreset: "cyan_horizon",
  },
  {
    name: "Lavanya Enclave Group",
    slug: "lavanya-enclave-group",
    shortIntro: "High-growth plotted development positioned on Amar Shaheed Path with investor and end-user demand.",
    fullProfile: "Lavanya Enclave Group connects plotted inventory, investor positioning, and fast-response enquiry funnels through the Homes platform.",
    themePreset: "signature_navy",
  },
  {
    name: "Vikas Vihar Estates",
    slug: "vikas-vihar-estates",
    shortIntro: "Affordable plotted and villa inventory positioned for value-first buyers entering the Lucknow market.",
    fullProfile: "Vikas Vihar Estates represents practical, value-driven inventory. Homes uses this profile to support guided discovery, proof-led content, and follow-up journeys.",
    themePreset: "graphite_reserve",
  },
] as const;

const PROPERTY_COMPANY_MAP: Record<string, string> = {
  "okas-enclave": "pardos-developers",
  "attalika-palms": "attalika-developers",
  "stellar-okas-golf-view": "stellar-okas-developers",
  "kailasha-enclave": "kailasha-enclave-developers",
  "greenberry-signature": "greenberry-signature",
  "lavanya-enclave": "lavanya-enclave-group",
  "vikas-vihar": "vikas-vihar-estates",
};

const UNIT_PLAN_FIXTURES: Record<string, Array<Record<string, string | number>>> = {
  "attalika-palms": [
    {
      name: "4 BHK Premium Villa",
      bhkLabel: "4 BHK",
      carpetArea: 1180,
      superBuiltUpArea: 1450,
      priceLabel: "Starts at ₹65 Lac",
      availability: "Ready inventory",
      floorLabel: "Ground + 1",
      description: "Large-format family villa with covered parking and gated-community amenities.",
    },
  ],
  "greenberry-signature": [
    {
      name: "3 BHK Signature Residence",
      bhkLabel: "3 BHK",
      carpetArea: 1260,
      superBuiltUpArea: 1685,
      priceLabel: "Starts at ₹88 Lac",
      availability: "Limited inventory",
      floorLabel: "Mid-rise tower",
      description: "Family-oriented premium apartment with clubhouse and green amenity access.",
    },
    {
      name: "4 BHK Corner Residence",
      bhkLabel: "4 BHK",
      carpetArea: 1680,
      superBuiltUpArea: 2140,
      priceLabel: "Starts at ₹1.32 Cr",
      availability: "On request",
      floorLabel: "Corner-stack units",
      description: "Larger format layout designed for premium buyers looking for golf-city adjacency.",
    },
  ],
  "lavanya-enclave": [
    {
      name: "Residential Plot Cluster",
      bhkLabel: "Plot",
      superBuiltUpArea: 150,
      priceLabel: "Starts at ₹39 Lac",
      availability: "Open inventory",
      floorLabel: "Plot sizes vary",
      description: "Investor and end-user friendly plotted inventory with flexible plot sizing.",
    },
  ],
};

const CASE_STUDY_FIXTURES = [
  {
    companySlug: "pardos-developers",
    propertySlugs: ["okas-enclave"],
    title: "Okas Enclave launch positioning for high-intent plotted buyers",
    slug: "okas-enclave-launch-positioning",
    summary: "Homes combined proof-led advisory, developer positioning, and structured enquiry capture to improve plotted lead quality around Sushant Golf City.",
    challenge: "The launch needed stronger trust, clearer inventory context, and faster handling of plotted-enquiry conversations.",
    solution: "We aligned company credibility, property storytelling, and enquiry routing so buyers could move from discovery to guided site visits inside a single system.",
    outcomes: [
      { label: "Qualified plotted enquiries", value: "185+" },
      { label: "Site visits arranged", value: "46" },
      { label: "Average first-response time", value: "< 2 hrs" },
    ],
    testimonialQuote: "Homes brought structure to both the listing story and the lead pipeline, making buyer conversations much easier to progress.",
  },
  {
    companySlug: "attalika-developers",
    propertySlugs: ["attalika-palms"],
    title: "Villa-led conversion journey for Attalika Palms",
    slug: "attalika-palms-villa-conversion-journey",
    summary: "The Homes advisory flow helped Attalika Palms package villa inventory, site visits, and financing conversations into one cleaner journey.",
    challenge: "Villa buyers were evaluating multiple gated communities and needed stronger differentiation plus faster follow-up.",
    solution: "Homes packaged buyer FAQs, site-visit CTAs, and comparative inventory framing around the Attalika Palms offer.",
    outcomes: [
      { label: "Weekend site visits", value: "31" },
      { label: "Negotiation-stage leads", value: "12" },
      { label: "Home-loan assist requests", value: "19" },
    ],
    testimonialQuote: "The Homes platform gave our team a sharper presentation layer and far better context on every serious buyer interaction.",
  },
  {
    companySlug: "greenberry-signature",
    propertySlugs: ["greenberry-signature"],
    title: "Lifestyle-first apartment storytelling for Greenberry Signature",
    slug: "greenberry-signature-lifestyle-storytelling",
    summary: "Homes reframed Greenberry Signature around family lifestyle, layout clarity, and amenity proof to strengthen apartment enquiry quality.",
    challenge: "The project needed more than listing data; it needed a clearer narrative around liveability, layout choice, and trust.",
    solution: "We linked room-type planning, amenity clarity, and company proof to a conversion-focused landing journey.",
    outcomes: [
      { label: "Apartment leads captured", value: "94" },
      { label: "Repeat property revisits", value: "27%" },
      { label: "WhatsApp follow-up opt-ins", value: "61" },
    ],
    testimonialQuote: "Homes helped us move from a flat listing presence to a much more confident sales conversation.",
  },
] as const;

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting database seed...\n");

  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected to MongoDB\n");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Property = mongoose.models.Property || mongoose.model("Property", PropertySchema);
  const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);
  const CaseStudy = mongoose.models.CaseStudy || mongoose.model("CaseStudy", CaseStudySchema);
  const PropertySite = mongoose.models.PropertySite || mongoose.model("PropertySite", PropertySiteSchema);

  // ── Clear existing data ──────────────────────────────────────────────────
  await PropertySite.deleteMany({});
  await CaseStudy.deleteMany({});
  await Company.deleteMany({});
  await Property.deleteMany({});
  console.log("🗑️  Cleared existing companies, case studies, microsites, and properties");

  const existingAdmin = await User.findOne({ email: "admin@homes.in" });
  if (!existingAdmin) {
    // ── Create default admin ─────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash("Admin@Homes2025!", 12);
    await User.create({
      name: "Admin User",
      email: "admin@homes.in",
      phone: "+91 88746 25303",
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });
    console.log("👤 Created admin user: admin@homes.in / Admin@Homes2025!");
    console.log("   ⚠️  Change the password immediately after first login!\n");
  } else {
    console.log("👤 Admin user already exists — skipping\n");
  }

  const existingAgent = await User.findOne({ email: "sales@homes.in" });
  if (!existingAgent) {
    const hashedPassword = await bcrypt.hash("Sales@Homes2025!", 12);
    await User.create({
      name: "Sales Agent",
      email: "sales@homes.in",
      phone: "+91 7755862936",
      password: hashedPassword,
      role: "agent",
      isActive: true,
    });
    console.log("👤 Created agent user: sales@homes.in / Sales@Homes2025!");
  } else {
    console.log("👤 Agent user already exists — skipping");
  }

  const existingCompanyManager = await User.findOne({ email: "manager@homes.in" });
  if (!existingCompanyManager) {
    const hashedPassword = await bcrypt.hash("Manager@Homes2025!", 12);
    await User.create({
      name: "Company Manager",
      email: "manager@homes.in",
      phone: "+91 9876543210",
      password: hashedPassword,
      role: "company_manager",
      isActive: true,
    });
    console.log("👤 Created company manager user: manager@homes.in / Manager@Homes2025!\n");
  } else {
    console.log("👤 Company manager user already exists — skipping\n");
  }

  const companyManager = await User.findOne({ email: "manager@homes.in" });
  const companyManagerId = companyManager?._id;

  const companyIdBySlug = new Map<string, mongoose.Types.ObjectId>();
  for (const company of COMPANY_FIXTURES) {
    const created = await Company.create({
      ...company,
      status: "published",
      featured: true,
      contact: {
        phone: "+91 88746 25303",
        email: "info@homes.in",
        whatsapp: "+91 88746 25303",
        website: "https://homes.in",
        salesLabel: "Homes Partner Desk",
      },
      address: {
        line1: "Flat No – 811, Royal Plaza",
        locality: "Sushant Golf City",
        city: "Lucknow",
        state: "Uttar Pradesh",
        pincode: "226030",
        mapLink: "https://maps.google.com/",
      },
      socialLinks: [
        { platform: "website", label: "Website", url: "https://homes.in" },
      ],
      assignedManagerIds: companyManagerId ? [companyManagerId] : [],
    });
    companyIdBySlug.set(company.slug, created._id);
    console.log(`🏢 Created company: ${created.name}`);
  }
  console.log("");

  const propertyIdBySlug = new Map<string, mongoose.Types.ObjectId>();

  // ── Seed properties ──────────────────────────────────────────────────────
  for (const property of properties) {
    const companySlug = PROPERTY_COMPANY_MAP[property.slug as string];
    const created = await Property.create({
      ...property,
      companyId: companySlug ? companyIdBySlug.get(companySlug) : undefined,
      unitPlans: UNIT_PLAN_FIXTURES[property.slug as string] ?? [],
    });
    propertyIdBySlug.set(created.slug as string, created._id);
    console.log(`🏠 Created: ${created.title}`);
    console.log(`   Slug: /projects/${created.slug}`);
    console.log(`   RERA: ${(property.legalInfo as { reraId: string }).reraId}`);
    console.log(`   Price: ₹${((property.financials as { listedPrice: number }).listedPrice / 100000).toFixed(0)} Lac onwards\n`);
  }

  for (const caseStudy of CASE_STUDY_FIXTURES) {
    const companyId = companyIdBySlug.get(caseStudy.companySlug);
    const propertyIds = caseStudy.propertySlugs
      .map((slug) => propertyIdBySlug.get(slug))
      .filter(Boolean);

    if (!companyId || propertyIds.length === 0) continue;

    const created = await CaseStudy.create({
      companyId,
      propertyIds,
      title: caseStudy.title,
      slug: caseStudy.slug,
      summary: caseStudy.summary,
      challenge: caseStudy.challenge,
      solution: caseStudy.solution,
      outcomes: caseStudy.outcomes,
      testimonialQuote: caseStudy.testimonialQuote,
      featured: true,
      publishStatus: "published",
      media: [],
    });

    console.log(`📚 Created case study: ${created.title}`);
  }
  console.log("");

  for (const property of properties) {
    const propertyId = propertyIdBySlug.get(property.slug as string);
    const companySlug = PROPERTY_COMPANY_MAP[property.slug as string];
    const companyId = companySlug ? companyIdBySlug.get(companySlug) : undefined;
    const mapLink =
      "googleMapsUrl" in property.location
        ? property.location.googleMapsUrl
        : undefined;

    if (!propertyId) continue;

    const created = await PropertySite.create({
      propertyId,
      companyId,
      siteSlug: property.slug,
      template: "signature_landing",
      themePreset:
        companySlug === "attalika-developers"
          ? "graphite_reserve"
          : companySlug === "greenberry-signature"
            ? "cyan_horizon"
            : "signature_navy",
      publishStatus: "published",
      heroTitle: property.projectName || property.title,
      heroSubtitle: property.tagline || property.description.slice(0, 220),
      heroCtaLabel: "Book Site Visit",
      heroSecondaryCtaLabel: "Get Brochure",
      contact: {
        phone: "+91 88746 25303",
        email: "info@homes.in",
        whatsapp: "+91 88746 25303",
        officeAddress: "Flat No – 811, Royal Plaza, Sushant Golf City, Lucknow",
        mapLink: mapLink || "https://maps.google.com/",
      },
      navigation: DEFAULT_NAVIGATION,
      sections: DEFAULT_SECTIONS,
      seo: {
        title: `${property.projectName || property.title} | Homes`,
        description: property.tagline || property.description.slice(0, 160),
        keywords: [property.projectName, property.location.locality, property.specifications.propertyType].filter(Boolean),
        canonicalUrl: "",
        ogImage: property.mediaAssets[0]?.url || "",
      },
      tracking: {
        sourceTag: `${property.slug}-microsite`,
        campaignTag: `${property.slug}-launch`,
        utmSource: "microsite",
        utmMedium: "organic",
        utmCampaign: property.slug,
      },
      customDomains: [],
    });

    console.log(`🌐 Created microsite: /sites/${created.siteSlug}`);
  }

  console.log("\n✅ Seed complete!");
  console.log(`📦 ${COMPANY_FIXTURES.length} companies, ${properties.length} properties, ${CASE_STUDY_FIXTURES.length} case studies, and ${properties.length} microsites seeded into MongoDB (homes database)`);
  console.log("🔑 Admin login: admin@homes.in / Admin@Homes2025!\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
