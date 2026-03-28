/**
 * LEAD SEED SCRIPT
 * Run with: node --import tsx scripts/seed-leads.ts
 *
 * This script expects the base seed to have already created:
 * 1. At least one active user
 * 2. The 7 property documents
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not set in .env.local");
}

const STAGES = [
  "new",
  "contacted",
  "qualified",
  "site_visit_scheduled",
  "negotiation",
  "converted",
  "lost",
] as const;

const SOURCES = [
  "website",
  "whatsapp",
  "99acres",
  "magicbricks",
  "referral",
  "walkin",
  "phone",
] as const;

const INTERESTS = [
  "buying",
  "site_visit",
  "investment",
  "general",
  "home_loan",
] as const;

type LeadStage = (typeof STAGES)[number];
type LeadSource = (typeof SOURCES)[number];
type LeadInterest = (typeof INTERESTS)[number];

type LeadTemplate = {
  name: string;
  phone: string;
  email?: string;
  stage: LeadStage;
  source: LeadSource;
  score: number;
  interestedIn: LeadInterest[];
  assigned: boolean;
  requirements: string;
  daysAgo: number;
  lostReason?: string;
};

type SeedUser = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  role: string;
  isActive: boolean;
};

type SeedProperty = {
  _id: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  projectName?: string;
  status?: string;
  financials?: {
    listedPrice?: number;
  };
  location?: {
    locality?: string;
    city?: string;
  };
};

type SeedLead = {
  name: string;
  phone: string;
  email?: string;
  stage: LeadStage;
  source: LeadSource;
  score: number;
  propertyId: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  propertySiteId?: mongoose.Types.ObjectId;
  pageContext?: string;
  propertyName: string;
  propertySlug: string;
  assignedTo?: mongoose.Types.ObjectId;
  assignedAgentName?: string;
  budget: {
    min: number;
    max: number;
  };
  requirements: string;
  interestedIn: LeadInterest[];
  activityLog: Array<{
    action: string;
    note: string;
    performedBy: mongoose.Types.ObjectId;
    performedAt: Date;
    stage: string;
  }>;
  lostReason?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: String,
    isActive: Boolean,
  },
  { timestamps: true }
);

const PropertySchema = new mongoose.Schema(
  {
    companyId: mongoose.Schema.Types.ObjectId,
    title: String,
    slug: String,
    projectName: String,
    status: String,
    financials: {
      listedPrice: Number,
    },
    location: {
      locality: String,
      city: String,
    },
  },
  { timestamps: true }
);

const PropertySiteSchema = new mongoose.Schema(
  {
    propertyId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const LeadActivitySchema = new mongoose.Schema(
  {
    action: String,
    note: String,
    performedBy: mongoose.Schema.Types.ObjectId,
    performedAt: Date,
    stage: String,
  },
  { _id: true }
);

const LeadSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    stage: { type: String, enum: STAGES },
    source: { type: String, enum: SOURCES },
    score: Number,
    propertyId: mongoose.Schema.Types.ObjectId,
    companyId: mongoose.Schema.Types.ObjectId,
    propertySiteId: mongoose.Schema.Types.ObjectId,
    pageContext: String,
    propertyName: String,
    propertySlug: String,
    assignedTo: mongoose.Schema.Types.ObjectId,
    assignedAgentName: String,
    budget: {
      min: Number,
      max: Number,
    },
    requirements: String,
    interestedIn: [{ type: String, enum: INTERESTS }],
    activityLog: [LeadActivitySchema],
    lostReason: String,
    closedAt: Date,
  },
  { timestamps: true }
);

const User =
  (mongoose.models.User as mongoose.Model<SeedUser>) ||
  mongoose.model<SeedUser>("User", UserSchema);
const Property =
  (mongoose.models.Property as mongoose.Model<SeedProperty>) ||
  mongoose.model<SeedProperty>("Property", PropertySchema);
const PropertySite =
  (mongoose.models.PropertySite as mongoose.Model<{ _id: mongoose.Types.ObjectId; propertyId: mongoose.Types.ObjectId }>) ||
  mongoose.model("PropertySite", PropertySiteSchema);
const Lead =
  (mongoose.models.Lead as mongoose.Model<SeedLead>) ||
  mongoose.model<SeedLead>("Lead", LeadSchema);

const LEAD_TEMPLATES: LeadTemplate[] = [
  {
    name: "Aarav Singh",
    phone: "9876543210",
    email: "aarav.singh@example.com",
    stage: "new",
    source: "website",
    score: 24,
    interestedIn: ["buying", "general"],
    assigned: false,
    requirements: "Looking for a plotted development in South Lucknow for end use within 3 months.",
    daysAgo: 1,
  },
  {
    name: "Nidhi Verma",
    phone: "9839012456",
    email: "nidhi.verma@example.com",
    stage: "contacted",
    source: "whatsapp",
    score: 38,
    interestedIn: ["buying", "site_visit"],
    assigned: true,
    requirements: "Needs a ready-to-move villa with 3+ bedrooms and covered parking near Amar Shaheed Path.",
    daysAgo: 2,
  },
  {
    name: "Ritesh Mehra",
    phone: "9811122233",
    email: "ritesh.mehra@example.com",
    stage: "qualified",
    source: "99acres",
    score: 56,
    interestedIn: ["investment", "buying"],
    assigned: true,
    requirements: "Investor evaluating premium plots with resale upside and clean title documentation.",
    daysAgo: 5,
  },
  {
    name: "Pooja Shukla",
    phone: "9897812345",
    email: "pooja.shukla@example.com",
    stage: "site_visit_scheduled",
    source: "magicbricks",
    score: 68,
    interestedIn: ["site_visit", "buying"],
    assigned: true,
    requirements: "Prefers a family-focused township with schools and hospitals within 15 minutes.",
    daysAgo: 6,
  },
  {
    name: "Manish Tiwari",
    phone: "9807001122",
    email: "manish.tiwari@example.com",
    stage: "negotiation",
    source: "referral",
    score: 82,
    interestedIn: ["buying", "home_loan"],
    assigned: true,
    requirements: "Shortlisted two options and wants help closing after home-loan pre-approval.",
    daysAgo: 9,
  },
  {
    name: "Sneha Agarwal",
    phone: "9871004455",
    email: "sneha.agarwal@example.com",
    stage: "converted",
    source: "walkin",
    score: 91,
    interestedIn: ["buying", "site_visit"],
    assigned: true,
    requirements: "Walk-in buyer who finalized a corner plot after the second site visit.",
    daysAgo: 12,
  },
  {
    name: "Rahul Bansal",
    phone: "9765432109",
    email: "rahul.bansal@example.com",
    stage: "lost",
    source: "phone",
    score: 41,
    interestedIn: ["buying", "general"],
    assigned: true,
    requirements: "Looking for immediate possession but paused after price comparison.",
    daysAgo: 14,
    lostReason: "Chose another project closer to Gomti Nagar extension.",
  },
  {
    name: "Ishita Kapoor",
    phone: "9823456781",
    email: "ishita.kapoor@example.com",
    stage: "new",
    source: "website",
    score: 27,
    interestedIn: ["investment"],
    assigned: false,
    requirements: "Exploring early-stage investment opportunities with strong appreciation potential.",
    daysAgo: 1,
  },
  {
    name: "Varun Khanna",
    phone: "9819988776",
    email: "varun.khanna@example.com",
    stage: "contacted",
    source: "referral",
    score: 43,
    interestedIn: ["buying", "home_loan"],
    assigned: true,
    requirements: "Needs financing support and wants a gated community with strong security.",
    daysAgo: 4,
  },
  {
    name: "Tanya Srivastava",
    phone: "9899001122",
    email: "tanya.srivastava@example.com",
    stage: "qualified",
    source: "whatsapp",
    score: 59,
    interestedIn: ["site_visit", "buying"],
    assigned: true,
    requirements: "Interested in a site visit this weekend for a premium plot near Sushant Golf City.",
    daysAgo: 7,
  },
  {
    name: "Ankit Arora",
    phone: "9810203040",
    email: "ankit.arora@example.com",
    stage: "site_visit_scheduled",
    source: "99acres",
    score: 66,
    interestedIn: ["site_visit", "investment"],
    assigned: true,
    requirements: "Investor wants to inspect plot frontage and internal roads before making an offer.",
    daysAgo: 8,
  },
  {
    name: "Komal Jain",
    phone: "9887766554",
    email: "komal.jain@example.com",
    stage: "negotiation",
    source: "magicbricks",
    score: 79,
    interestedIn: ["buying", "site_visit"],
    assigned: true,
    requirements: "Comparing final commercials across two shortlisted villa communities.",
    daysAgo: 10,
  },
  {
    name: "Saurabh Mishra",
    phone: "9873300112",
    email: "saurabh.mishra@example.com",
    stage: "converted",
    source: "phone",
    score: 94,
    interestedIn: ["buying", "home_loan"],
    assigned: true,
    requirements: "Closed after loan sanction and paperwork support from the sales team.",
    daysAgo: 15,
  },
  {
    name: "Neha Saxena",
    phone: "9822001144",
    email: "neha.saxena@example.com",
    stage: "lost",
    source: "walkin",
    score: 36,
    interestedIn: ["buying"],
    assigned: true,
    requirements: "Family wanted faster possession and dropped out after the first follow-up.",
    daysAgo: 11,
    lostReason: "Budget shifted below the available inventory range.",
  },
  {
    name: "Karan Malhotra",
    phone: "9760012345",
    email: "karan.malhotra@example.com",
    stage: "qualified",
    source: "website",
    score: 53,
    interestedIn: ["investment", "general"],
    assigned: true,
    requirements: "Exploring resale plots with immediate registration and long-term rental upside nearby.",
    daysAgo: 3,
  },
  {
    name: "Priya Narang",
    phone: "9897123456",
    email: "priya.narang@example.com",
    stage: "site_visit_scheduled",
    source: "whatsapp",
    score: 64,
    interestedIn: ["site_visit", "buying"],
    assigned: true,
    requirements: "Needs a Saturday site visit for a family purchase decision with parents attending.",
    daysAgo: 5,
  },
  {
    name: "Aditya Tripathi",
    phone: "9814509876",
    email: "aditya.tripathi@example.com",
    stage: "contacted",
    source: "referral",
    score: 47,
    interestedIn: ["home_loan", "buying"],
    assigned: true,
    requirements: "Requested bank tie-up details and total cost sheet before visiting the project.",
    daysAgo: 2,
  },
  {
    name: "Mehak Sethi",
    phone: "9876043211",
    email: "mehak.sethi@example.com",
    stage: "new",
    source: "magicbricks",
    score: 29,
    interestedIn: ["investment", "site_visit"],
    assigned: false,
    requirements: "Outbound callback pending for a first-time investor comparing plot sizes and entry pricing.",
    daysAgo: 1,
  },
];

function hoursAfter(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function buildBudget(listedPrice: number | undefined, score: number) {
  const base = listedPrice && listedPrice > 0 ? listedPrice : 5000000;
  const spread = score >= 80 ? 0.08 : score >= 60 ? 0.12 : 0.18;

  return {
    min: Math.round(base * (1 - spread)),
    max: Math.round(base * (1 + spread)),
  };
}

function reachedStage(current: LeadStage, target: LeadStage) {
  const currentIndex = STAGES.indexOf(current);
  const targetIndex = STAGES.indexOf(target);

  if (current === "lost" && ["converted", "negotiation"].includes(target)) {
    return false;
  }

  return currentIndex >= targetIndex;
}

function buildActivityLog(params: {
  stage: LeadStage;
  source: LeadSource;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  assigned: boolean;
  propertyName: string;
  requirements: string;
  interestedIn: LeadInterest[];
  createdAt: Date;
  lostReason?: string;
}) {
  const {
    stage,
    source,
    actorId,
    actorName,
    assigned,
    propertyName,
    requirements,
    interestedIn,
    createdAt,
    lostReason,
  } = params;

  const activityLog = [
    {
      action: "Lead created from seed data",
      note: `Imported against ${propertyName} from ${source.replace(/_/g, " ")}. Focus: ${interestedIn.join(", ")}.`,
      performedBy: actorId,
      performedAt: hoursAfter(createdAt, 1),
      stage: "new",
    },
  ];

  if (assigned) {
    activityLog.push({
      action: `Lead assigned to ${actorName}`,
      note: "Assigned automatically during dev seed setup for dashboard testing.",
      performedBy: actorId,
      performedAt: hoursAfter(createdAt, 3),
      stage: "new",
    });
  }

  if (reachedStage(stage, "contacted")) {
    activityLog.push({
      action: "Initial contact completed",
      note: `Spoke with the buyer and confirmed requirement: ${requirements}`,
      performedBy: actorId,
      performedAt: hoursAfter(createdAt, 18),
      stage: "contacted",
    });
  }

  if (reachedStage(stage, "qualified")) {
    activityLog.push({
      action: "Lead qualified",
      note: "Budget, buying timeline, and preferred configuration were confirmed.",
      performedBy: actorId,
      performedAt: hoursAfter(createdAt, 36),
      stage: "qualified",
    });
  }

  if (reachedStage(stage, "site_visit_scheduled")) {
    activityLog.push({
      action: "Site visit scheduled",
      note: `Site visit planned for ${propertyName} after shortlist confirmation.`,
      performedBy: actorId,
      performedAt: hoursAfter(createdAt, 54),
      stage: "site_visit_scheduled",
    });
  }

  if (reachedStage(stage, "negotiation")) {
    activityLog.push({
      action: "Negotiation started",
      note: "Shared final pricing, payment plan, and documentation checklist.",
      performedBy: actorId,
      performedAt: hoursAfter(createdAt, 78),
      stage: "negotiation",
    });
  }

  if (stage === "converted") {
    activityLog.push({
      action: "Lead converted",
      note: "Client confirmed the booking and moved to documentation.",
      performedBy: actorId,
      performedAt: hoursAfter(createdAt, 102),
      stage: "converted",
    });
  }

  if (stage === "lost") {
    activityLog.push({
      action: "Lead marked as lost",
      note: lostReason ?? "Client did not proceed after follow-up.",
      performedBy: actorId,
      performedAt: hoursAfter(createdAt, 72),
      stage: "lost",
    });
  }

  return activityLog;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const seedUser =
    (await User.findOne({
      isActive: true,
      role: { $in: ["super_admin", "admin"] },
    })) ||
    (await User.findOne({ isActive: true }));

  if (!seedUser) {
    throw new Error("No active user found. Run the base seed first.");
  }

  const properties = await Property.find({ status: "active" })
    .sort({ createdAt: 1 })
    .select("title projectName slug financials location companyId")
    .lean();

  if (properties.length === 0) {
    throw new Error("No properties found. Run the base seed first.");
  }

  await Lead.deleteMany({});
  console.log("Cleared existing leads");

  const propertySites = await PropertySite.find({})
    .select("propertyId")
    .lean();
  const siteByPropertyId = new Map(
    propertySites.map((site) => [site.propertyId.toString(), site._id])
  );

  const leadsToInsert = LEAD_TEMPLATES.map((template, index) => {
    const property = properties[index % properties.length];
    const propertySiteId = siteByPropertyId.get(property._id.toString());
    const createdAt = daysAgo(template.daysAgo);
    const budget = buildBudget(property.financials?.listedPrice, template.score);
    const activityLog = buildActivityLog({
      stage: template.stage,
      source: template.source,
      actorId: seedUser._id,
      actorName: seedUser.name,
      assigned: template.assigned,
      propertyName: property.projectName || property.title,
      requirements: template.requirements,
      interestedIn: template.interestedIn,
      createdAt,
      lostReason: template.lostReason,
    });
    const updatedAt = activityLog[activityLog.length - 1]?.performedAt ?? createdAt;

    return {
      name: template.name,
      phone: template.phone,
      email: template.email,
      stage: template.stage,
      source: template.source,
      score: template.score,
      propertyId: property._id,
      companyId: property.companyId,
      propertySiteId,
      pageContext: propertySiteId ? "property_site" : "main_site",
      propertyName: property.projectName || property.title,
      propertySlug: property.slug,
      assignedTo: template.assigned ? seedUser._id : undefined,
      assignedAgentName: template.assigned ? seedUser.name : undefined,
      budget,
      requirements: template.requirements,
      interestedIn: template.interestedIn,
      activityLog,
      lostReason: template.stage === "lost" ? template.lostReason : undefined,
      closedAt: ["converted", "lost"].includes(template.stage) ? updatedAt : undefined,
      createdAt,
      updatedAt,
    };
  });

  await Lead.insertMany(leadsToInsert);

  const stageCounts = LEAD_TEMPLATES.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] ?? 0) + 1;
    return acc;
  }, {});

  const sourceCounts = LEAD_TEMPLATES.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.source] = (acc[lead.source] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Seeded ${leadsToInsert.length} leads across ${properties.length} properties`);
  console.log("Stage distribution:", stageCounts);
  console.log("Source distribution:", sourceCounts);
}

main()
  .catch((error) => {
    console.error("Lead seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
