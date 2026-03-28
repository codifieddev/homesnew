import mongoose, { Schema, model, models, Document } from "mongoose";
import type { ILead } from "@/types";
import {
  LEAD_STAGES,
  LEAD_SOURCES,
  ENQUIRY_INTERESTS,
  PAGE_CONTEXTS,
} from "@/lib/utils/constants";

export type LeadDocument = ILead & Document;

const TrackingSchema = new Schema(
  {
    sourceTag: { type: String, trim: true },
    campaignTag: { type: String, trim: true },
    utmSource: { type: String, trim: true },
    utmMedium: { type: String, trim: true },
    utmCampaign: { type: String, trim: true },
    gaMeasurementId: { type: String, trim: true },
    tagManagerId: { type: String, trim: true },
    metaPixelId: { type: String, trim: true },
  },
  { _id: false }
);

// ─── ACTIVITY LOG SUB-SCHEMA ──────────────────────────────────────────────────

const LeadActivitySchema = new Schema(
  {
    action: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    performedAt: { type: Date, default: Date.now },
    stage: { type: String, enum: LEAD_STAGES },
  },
  { _id: true }
);

// ─── MAIN LEAD SCHEMA ─────────────────────────────────────────────────────────

const LeadSchema = new Schema<LeadDocument>(
  {
    // ── Contact Info ──────────────────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[+]?[\d\s\-()]{7,15}$/.test(v),
        message: "Invalid phone number format",
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },

    // ── Pipeline ──────────────────────────────────────────────────────────────
    stage: {
      type: String,
      enum: LEAD_STAGES,
      default: "new",
      required: true,
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      default: "website",
      required: true,
    },
    score: { type: Number, min: 0, max: 100, default: 0 },

    // ── Property Reference ────────────────────────────────────────────────────
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    propertySiteId: { type: Schema.Types.ObjectId, ref: "PropertySite" },
    propertyName: { type: String, trim: true },
    propertySlug: { type: String, trim: true },
    pageContext: {
      type: String,
      enum: PAGE_CONTEXTS,
      default: "main_site",
    },
    tracking: { type: TrackingSchema, default: undefined },

    // ── Agent Assignment ──────────────────────────────────────────────────────
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedAgentName: { type: String, trim: true },

    // ── Requirements ─────────────────────────────────────────────────────────
    budget: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
    },
    requirements: { type: String, trim: true, maxlength: 1000 },
    interestedIn: [{ type: String, enum: ENQUIRY_INTERESTS }],

    // ── Activity Log ─────────────────────────────────────────────────────────
    activityLog: [LeadActivitySchema],

    // ── References ────────────────────────────────────────────────────────────
    convertedFromEnquiryId: { type: Schema.Types.ObjectId, ref: "Enquiry" },
    siteVisitId: { type: Schema.Types.ObjectId, ref: "SiteVisit" },

    // ── Closure ───────────────────────────────────────────────────────────────
    lostReason: { type: String, trim: true },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────

// Kanban board query — fetch all leads grouped by stage for a given agent
LeadSchema.index({ stage: 1, assignedTo: 1, createdAt: -1 });

// Per-property lead reporting
LeadSchema.index({ propertyId: 1, stage: 1 });
LeadSchema.index({ companyId: 1, stage: 1 });
LeadSchema.index({ propertySiteId: 1, createdAt: -1 });

// Recent leads overview
LeadSchema.index({ createdAt: -1 });

// Source analytics
LeadSchema.index({ source: 1, stage: 1 });

// Phone number lookup (agents searching by client phone)
LeadSchema.index({ phone: 1 });

// ─── VIRTUALS ─────────────────────────────────────────────────────────────────

LeadSchema.virtual("isActive").get(function () {
  return this.stage !== "converted" && this.stage !== "lost";
});

LeadSchema.virtual("daysSinceCreated").get(function () {
  if (!this.createdAt) return null;
  const diff = Date.now() - new Date(this.createdAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Auto-set closedAt when stage becomes converted or lost
LeadSchema.pre("save", async function () {
  if (
    this.isModified("stage") &&
    (this.stage === "converted" || this.stage === "lost") &&
    !this.closedAt
  ) {
    this.closedAt = new Date();
  }
});

// ─── EXPORT ───────────────────────────────────────────────────────────────────

const Lead =
  (models.Lead as mongoose.Model<LeadDocument>) ||
  model<LeadDocument>("Lead", LeadSchema);

export default Lead;
