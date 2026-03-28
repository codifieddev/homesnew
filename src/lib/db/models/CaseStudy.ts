import mongoose, { Schema, model, models } from "mongoose";
import type { ICaseStudy } from "@/types";
import { PUBLISH_STATUSES } from "@/lib/utils/constants";

type CaseStudyRecord = Omit<ICaseStudy, "companyId" | "propertyIds"> & {
  companyId: mongoose.Types.ObjectId | string;
  propertyIds: Array<mongoose.Types.ObjectId | string>;
};

export type CaseStudyDocument = mongoose.HydratedDocument<CaseStudyRecord>;

const OutcomeSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const MediaSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
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

const CaseStudySchema = new Schema<CaseStudyRecord>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    propertyIds: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: { type: String, required: true, trim: true },
    challenge: { type: String, trim: true },
    solution: { type: String, trim: true },
    outcomes: { type: [OutcomeSchema], default: [] },
    testimonialQuote: { type: String, trim: true, maxlength: 500 },
    media: { type: [MediaSchema], default: [] },
    featured: { type: Boolean, default: false },
    publishStatus: {
      type: String,
      enum: PUBLISH_STATUSES,
      default: "draft",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CaseStudySchema.index({ companyId: 1, publishStatus: 1 });
CaseStudySchema.index({ featured: 1, publishStatus: 1 });
CaseStudySchema.index({ title: "text", summary: "text", challenge: "text", solution: "text" });

const CaseStudy =
  (models.CaseStudy as mongoose.Model<CaseStudyRecord>) ||
  model<CaseStudyRecord>("CaseStudy", CaseStudySchema);

export default CaseStudy;
