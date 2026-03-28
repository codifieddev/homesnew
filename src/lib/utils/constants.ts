// ─── PROPERTY ────────────────────────────────────────────────────────────────

export const PROPERTY_CATEGORIES = ["Residential", "Commercial", "Land"] as const;

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Plot",
  "Independent House",
  "Penthouse",
  "Studio",
  "Shop",
  "Office Space",
  "Warehouse",
  "Agricultural Land",
] as const;

export const TRANSACTION_TYPES = ["Sale", "Rent", "Lease"] as const;

export const BHK_CONFIGS = [
  "Studio",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "4+ BHK",
] as const;

export const FURNISHING_STATUS = [
  "Unfurnished",
  "Semi-Furnished",
  "Fully Furnished",
] as const;

export const PROPERTY_AGE = [
  "New",
  "Under Construction",
  "0-5 Years",
  "5-10 Years",
  "10+ Years",
] as const;

export const POSSESSION_STATUS = [
  "Ready to Move",
  "Under Construction",
] as const;

export const FACING_DIRECTIONS = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
] as const;

export const FLOOR_NUMBERS = [
  "Ground",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "High Floor",
  "Penthouse",
] as const;

export const TOTAL_FLOORS = [
  "1",
  "2-5",
  "5-10",
  "10-20",
  "20+",
] as const;

export const PARKING_TYPES = [
  "Covered",
  "Open",
  "Reserved",
  "Stacked",
] as const;

export const WATER_SUPPLY_OPTIONS = [
  "24x7",
  "Scheduled",
  "Borewell",
  "Municipal",
  "Tanker",
] as const;

export const POWER_BACKUP_OPTIONS = ["Full", "Partial", "None"] as const;

export const GAS_CONNECTION_OPTIONS = [
  "Pipeline",
  "Cylinder",
  "None",
] as const;

export const OWNERSHIP_TYPES = [
  "Freehold",
  "Leasehold",
  "Cooperative Society",
] as const;

export const ZONING_TYPES = [
  "Residential",
  "Commercial",
  "Mixed",
  "Agricultural",
  "Industrial",
] as const;

export const LISTING_BY = [
  "Owner",
  "Builder",
  "Broker",
  "Agent",
] as const;

export const PROPERTY_STATUSES = [
  "active",
  "blocked",
  "sold",
  "archived",
] as const;

export const AREA_UNITS = ["sqft", "sqm", "sqyd", "acres", "bigha"] as const;

// ─── COMMON AMENITIES LIST ────────────────────────────────────────────────────

export const AMENITIES_LIST = [
  "Lift",
  "Power Backup",
  "24x7 Security",
  "CCTV",
  "Intercom",
  "Swimming Pool",
  "Gym",
  "Clubhouse",
  "Garden",
  "Jogging Track",
  "Children Play Area",
  "Yoga Park",
  "Badminton Court",
  "Tennis Court",
  "Indoor Games",
  "Rainwater Harvesting",
  "Solar Power",
  "Sewage Treatment Plant",
  "Gated Community",
  "Visitor Parking",
  "Shopping Complex",
  "Wide Internal Roads",
  "Street Lights",
  "Footpaths",
  "Green Area",
  "Landscape Garden",
  "Community Hall",
  "Library",
  "Co-working Space",
  "Pet Zone",
  "Fire Safety",
  "EV Charging",
] as const;

export const REAL_ESTATE_ICON_KEYS = [
  "Accessibility",
  "ArrowUpDown",
  "Building2",
  "Camera",
  "CircleParking",
  "CloudRain",
  "Cpu",
  "Dog",
  "Droplets",
  "Dumbbell",
  "Flower2",
  "Footprints",
  "House",
  "Leaf",
  "LibraryBig",
  "Phone",
  "PlugZap",
  "ShieldCheck",
  "ShoppingCart",
  "Store",
  "ToyBrick",
  "Trees",
  "Trophy",
  "Waves",
  "Wifi",
  "Zap",
] as const;

export type RealEstateIconKey = (typeof REAL_ESTATE_ICON_KEYS)[number];

export const AMENITY_ICON_MAP: Record<
  (typeof AMENITIES_LIST)[number],
  RealEstateIconKey
> = {
  Lift: "ArrowUpDown",
  "Power Backup": "Zap",
  "24x7 Security": "ShieldCheck",
  CCTV: "Camera",
  Intercom: "Phone",
  "Swimming Pool": "Waves",
  Gym: "Dumbbell",
  Clubhouse: "House",
  Garden: "Trees",
  "Jogging Track": "Footprints",
  "Children Play Area": "ToyBrick",
  "Yoga Park": "Flower2",
  "Badminton Court": "Trophy",
  "Tennis Court": "Trophy",
  "Indoor Games": "Trophy",
  "Rainwater Harvesting": "CloudRain",
  "Solar Power": "Zap",
  "Sewage Treatment Plant": "Droplets",
  "Gated Community": "Building2",
  "Visitor Parking": "CircleParking",
  "Shopping Complex": "ShoppingCart",
  "Wide Internal Roads": "Building2",
  "Street Lights": "PlugZap",
  Footpaths: "Footprints",
  "Green Area": "Leaf",
  "Landscape Garden": "Trees",
  "Community Hall": "House",
  Library: "LibraryBig",
  "Co-working Space": "Cpu",
  "Pet Zone": "Dog",
  "Fire Safety": "ShieldCheck",
  "EV Charging": "PlugZap",
};

// ─── NEARBY PLACE CATEGORIES ──────────────────────────────────────────────────

export const NEARBY_CATEGORIES = [
  "Schools & Colleges",
  "Hospitals",
  "Malls & Multiplex",
  "Key Landmarks",
  "Metro Stations",
  "IT Parks",
  "Restaurants",
] as const;

// ─── LEADS ────────────────────────────────────────────────────────────────────

export const LEAD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "site_visit_scheduled",
  "negotiation",
  "converted",
  "lost",
] as const;

export const LEAD_STAGE_LABELS: Record<string, string> = {
  new: "New Lead",
  contacted: "Contacted",
  qualified: "Qualified",
  site_visit_scheduled: "Site Visit Scheduled",
  negotiation: "Negotiation",
  converted: "Converted",
  lost: "Lost",
};

export const LEAD_STAGE_COLORS: Record<string, string> = {
  new: "blue",
  contacted: "yellow",
  qualified: "purple",
  site_visit_scheduled: "orange",
  negotiation: "pink",
  converted: "green",
  lost: "red",
};

export const LEAD_SOURCES = [
  "website",
  "whatsapp",
  "99acres",
  "magicbricks",
  "housing",
  "referral",
  "walkin",
  "phone",
  "social_media",
  "other",
] as const;

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  "99acres": "99acres",
  magicbricks: "MagicBricks",
  housing: "Housing.com",
  referral: "Referral",
  walkin: "Walk-in",
  phone: "Phone",
  social_media: "Social Media",
  other: "Other",
};

// ─── ENQUIRIES ────────────────────────────────────────────────────────────────

export const ENQUIRY_STATUSES = [
  "new",
  "reviewed",
  "converted",
  "spam",
] as const;

export const ENQUIRY_INTERESTS = [
  "buying",
  "site_visit",
  "home_loan",
  "investment",
  "general",
] as const;

// ─── SITE VISITS ─────────────────────────────────────────────────────────────

export const SITE_VISIT_STATUSES = [
  "scheduled",
  "completed",
  "no_show",
  "rescheduled",
  "cancelled",
] as const;

export const SITE_VISIT_OUTCOMES = [
  "positive",
  "neutral",
  "negative",
  "converted",
  "pending",
] as const;

// ─── USERS ────────────────────────────────────────────────────────────────────

export const USER_ROLES = [
  "super_admin",
  "admin",
  "agent",
  "company_manager",
] as const;

// ─── COMPANIES / PUBLISHING ───────────────────────────────────────────────────

export const PUBLISH_STATUSES = [
  "draft",
  "in_review",
  "published",
  "archived",
] as const;

export const COMPANY_THEME_PRESETS = [
  "signature_navy",
  "cyan_horizon",
  "graphite_reserve",
] as const;

export const PROPERTY_SITE_TEMPLATES = ["signature_landing"] as const;

export const PAGE_CONTEXTS = ["main_site", "property_site"] as const;

export const COMPANY_THEME_LABELS: Record<string, string> = {
  signature_navy: "Signature Navy",
  cyan_horizon: "Cyan Horizon",
  graphite_reserve: "Graphite Reserve",
};

export const PUBLISH_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  published: "Published",
  archived: "Archived",
};

// ─── BUDGET RANGES (for search filters) ──────────────────────────────────────

export const BUDGET_RANGES = [
  { label: "Under ₹25 Lac", min: 0, max: 2500000 },
  { label: "₹25L – ₹50L", min: 2500000, max: 5000000 },
  { label: "₹50L – ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr – ₹2 Cr", min: 10000000, max: 20000000 },
  { label: "₹2 Cr – ₹5 Cr", min: 20000000, max: 50000000 },
  { label: "Above ₹5 Cr", min: 50000000, max: Infinity },
] as const;

// ─── INDIAN STATES ────────────────────────────────────────────────────────────

export const INDIAN_STATES = [
  "Uttar Pradesh",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "Rajasthan",
  "Haryana",
  "Punjab",
  "West Bengal",
] as const;

// ─── PRICE FORMATTERS ────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lac`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatArea(value: number, unit: string = "sqft"): string {
  return `${value.toLocaleString("en-IN")} ${unit}`;
}
