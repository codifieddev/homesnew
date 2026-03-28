import { Schema, model, models } from "mongoose";
import {
  DEFAULT_SITE_TEMPLATE,
  SITE_TEMPLATES,
  SUPPORTED_LOCALES,
} from "@/lib/i18n/config";

const LocalizationSchema = new Schema(
  {
    defaultLocale: {
      type: String,
      enum: SUPPORTED_LOCALES,
      default: "en",
    },
    enabledLocales: {
      type: [String],
      enum: SUPPORTED_LOCALES,
      default: ["en", "hi"],
    },
    localeOrder: {
      type: [String],
      enum: SUPPORTED_LOCALES,
      default: ["en", "hi", "hr", "ar"],
    },
  },
  { _id: false }
);

const PresentationSchema = new Schema(
  {
    siteTemplate: {
      type: String,
      enum: SITE_TEMPLATES,
      default: DEFAULT_SITE_TEMPLATE,
    },
  },
  { _id: false }
);

const AppSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "app",
    },
    localization: {
      type: LocalizationSchema,
      default: () => ({
        defaultLocale: "en",
        enabledLocales: ["en", "hi"],
        localeOrder: ["en", "hi", "hr", "ar"],
      }),
    },
    presentation: {
      type: PresentationSchema,
      default: () => ({
        siteTemplate: DEFAULT_SITE_TEMPLATE,
      }),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const AppSettings =
  models.AppSettings ||
  model("AppSettings", AppSettingsSchema);

export default AppSettings;
