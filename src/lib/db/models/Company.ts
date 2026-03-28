import mongoose, { Document, Schema, model, models } from "mongoose";
import type { ICompany } from "@/types";
import {
  COMPANY_THEME_PRESETS,
  PUBLISH_STATUSES,
} from "@/lib/utils/constants";

export type CompanyDocument = ICompany & Document;

const ContactSchema = new Schema(
  {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    whatsapp: { type: String, trim: true },
    website: { type: String, trim: true },
    salesLabel: { type: String, trim: true },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    line1: { type: String, trim: true },
    locality: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    mapLink: { type: String, trim: true },
  },
  { _id: false }
);

const SocialLinkSchema = new Schema(
  {
    platform: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const CompanySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: { type: String, trim: true },
    shortIntro: { type: String, trim: true, maxlength: 220 },
    fullProfile: { type: String, trim: true, maxlength: 5000 },
    contact: { type: ContactSchema, default: {} },
    address: { type: AddressSchema, default: {} },
    socialLinks: [SocialLinkSchema],
    themePreset: {
      type: String,
      enum: COMPANY_THEME_PRESETS,
      default: "signature_navy",
    },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: PUBLISH_STATUSES,
      default: "draft",
    },
    assignedManagerIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CompanySchema.index({ featured: 1, status: 1 });
CompanySchema.index({ assignedManagerIds: 1, status: 1 });
CompanySchema.index({ name: "text", shortIntro: "text", fullProfile: "text" });

const Company =
  (models.Company as mongoose.Model<CompanyDocument>) ||
  model<CompanyDocument>("Company", CompanySchema);

export default Company;
