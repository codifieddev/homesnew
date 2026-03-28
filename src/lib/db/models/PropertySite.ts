import mongoose, { Schema, model, models } from "mongoose";
import type { IPropertySite } from "@/types";
import {
  COMPANY_THEME_PRESETS,
  PROPERTY_SITE_TEMPLATES,
  PUBLISH_STATUSES,
} from "@/lib/utils/constants";

type PropertySiteRecord = Omit<IPropertySite, "propertyId" | "companyId"> & {
  propertyId: mongoose.Types.ObjectId | string;
  companyId?: mongoose.Types.ObjectId | string;
};

export type PropertySiteDocument = mongoose.HydratedDocument<PropertySiteRecord>;

const ContactSchema = new Schema(
  {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    whatsapp: { type: String, trim: true },
    officeAddress: { type: String, trim: true },
    mapLink: { type: String, trim: true },
  },
  { _id: false }
);

const NavigationItemSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const SectionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const SeoSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 320 },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    ogImage: { type: String, trim: true },
  },
  { _id: false }
);

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

const PropertySiteSchema = new Schema<PropertySiteRecord>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      unique: true,
    },
    companyId: { type: Schema.Types.ObjectId, ref: "Company" },
    siteSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    template: {
      type: String,
      enum: PROPERTY_SITE_TEMPLATES,
      default: "signature_landing",
    },
    themePreset: {
      type: String,
      enum: COMPANY_THEME_PRESETS,
      default: "signature_navy",
    },
    publishStatus: {
      type: String,
      enum: PUBLISH_STATUSES,
      default: "draft",
    },
    heroTitle: { type: String, trim: true, maxlength: 200 },
    heroSubtitle: { type: String, trim: true, maxlength: 500 },
    heroCtaLabel: { type: String, trim: true, maxlength: 60 },
    heroSecondaryCtaLabel: { type: String, trim: true, maxlength: 60 },
    contact: { type: ContactSchema, default: {} },
    navigation: { type: [NavigationItemSchema], default: [] },
    sections: { type: [SectionSchema], default: [] },
    seo: { type: SeoSchema, default: { keywords: [] } },
    tracking: { type: TrackingSchema, default: {} },
    customDomains: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PropertySiteSchema.index({ companyId: 1, publishStatus: 1 });
PropertySiteSchema.index({ siteSlug: 1, publishStatus: 1 });

const PropertySite =
  (models.PropertySite as mongoose.Model<PropertySiteRecord>) ||
  model<PropertySiteRecord>("PropertySite", PropertySiteSchema);

export default PropertySite;
