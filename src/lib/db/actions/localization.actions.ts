"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db/connection";
import AppSettings from "@/lib/db/models/AppSettings";
import { withRole } from "@/lib/auth/utils";
import type { ApiResponse } from "@/types";
import {
  DEFAULT_LOCALE,
  DEFAULT_SITE_TEMPLATE,
  FALLBACK_ENABLED_LOCALES,
  FALLBACK_LOCALE_ORDER,
  SUPPORTED_LOCALES,
  type Locale,
  type RuntimePresentationSettings,
  type RuntimeLocaleSettings,
  type SiteTemplate,
  SITE_TEMPLATES,
} from "@/lib/i18n/config";

const LocalizationSettingsValidator = z.object({
  defaultLocale: z.enum(SUPPORTED_LOCALES),
  enabledLocales: z.array(z.enum(SUPPORTED_LOCALES)).min(1),
  localeOrder: z
    .array(z.enum(SUPPORTED_LOCALES))
    .min(SUPPORTED_LOCALES.length)
    .transform((order) => {
      const deduped = Array.from(new Set(order));
      return SUPPORTED_LOCALES.filter((locale) => deduped.includes(locale));
    }),
});

const PresentationSettingsValidator = z.object({
  siteTemplate: z.enum(SITE_TEMPLATES),
});

export async function getLocalizationSettings(): Promise<
  ApiResponse<RuntimeLocaleSettings>
> {
  try {
    await withRole(["super_admin"]);
    await connectDB();

    const settings = await AppSettings.findOne({ key: "app" }).lean();

    const enabledLocales = (settings?.localization?.enabledLocales ??
      FALLBACK_ENABLED_LOCALES) as Locale[];
    const localeOrder = (settings?.localization?.localeOrder ??
      FALLBACK_LOCALE_ORDER) as Locale[];
    const defaultLocale = (settings?.localization?.defaultLocale ??
      DEFAULT_LOCALE) as Locale;

    return {
      success: true,
      data: {
        defaultLocale,
        enabledLocales,
        localeOrder,
      },
    };
  } catch (error) {
    console.error("[getLocalizationSettings]", error);
    return { success: false, error: "Failed to load localization settings" };
  }
}

export async function getPresentationSettings(): Promise<
  ApiResponse<RuntimePresentationSettings>
> {
  try {
    await withRole(["super_admin"]);
    await connectDB();

    const settings = await AppSettings.findOne({ key: "app" }).lean();

    return {
      success: true,
      data: {
        siteTemplate: (settings?.presentation?.siteTemplate ??
          DEFAULT_SITE_TEMPLATE) as SiteTemplate,
      },
    };
  } catch (error) {
    console.error("[getPresentationSettings]", error);
    return { success: false, error: "Failed to load presentation settings" };
  }
}

export async function updateLocalizationSettings(
  rawData: RuntimeLocaleSettings
): Promise<ApiResponse<RuntimeLocaleSettings>> {
  try {
    await withRole(["super_admin"]);
    await connectDB();

    const data = LocalizationSettingsValidator.parse(rawData);
    const enabledSet = new Set(data.enabledLocales);

    if (!enabledSet.has(data.defaultLocale)) {
      return {
        success: false,
        error: "Default locale must remain enabled",
      };
    }

    const localeOrder = [
      ...data.localeOrder.filter((locale) => enabledSet.has(locale)),
      ...data.enabledLocales.filter((locale) => !data.localeOrder.includes(locale)),
    ] as Locale[];

    await AppSettings.findOneAndUpdate(
      { key: "app" },
      {
        key: "app",
        localization: {
          defaultLocale: data.defaultLocale,
          enabledLocales: data.enabledLocales,
          localeOrder,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");

    return {
      success: true,
      data: {
        defaultLocale: data.defaultLocale,
        enabledLocales: data.enabledLocales,
        localeOrder,
      },
      message: "Localization settings updated",
    };
  } catch (error) {
    console.error("[updateLocalizationSettings]", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid localization settings payload",
      };
    }
    return { success: false, error: "Failed to update localization settings" };
  }
}

export async function updatePresentationSettings(
  rawData: RuntimePresentationSettings
): Promise<ApiResponse<RuntimePresentationSettings>> {
  try {
    await withRole(["super_admin"]);
    await connectDB();

    const data = PresentationSettingsValidator.parse(rawData);

    await AppSettings.findOneAndUpdate(
      { key: "app" },
      {
        $set: {
          key: "app",
          "presentation.siteTemplate": data.siteTemplate,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");

    return {
      success: true,
      data: {
        siteTemplate: data.siteTemplate,
      },
      message: "Presentation settings updated",
    };
  } catch (error) {
    console.error("[updatePresentationSettings]", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid presentation settings payload",
      };
    }
    return { success: false, error: "Failed to update presentation settings" };
  }
}
