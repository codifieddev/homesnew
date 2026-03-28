"use client";

import { useState, useTransition } from "react";
import slugify from "slugify";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import {
  createPropertySite,
  updatePropertySite,
} from "@/lib/db/actions/property-site.actions";
import {
  PropertySiteValidator,
} from "@/lib/utils/validators";
import {
  COMPANY_THEME_PRESETS,
  PUBLISH_STATUSES,
} from "@/lib/utils/constants";
import type { ICompany, IProperty, IPropertySite } from "@/types";

interface PropertySiteFormProps {
  site?: IPropertySite;
  properties: IProperty[];
  companies: ICompany[];
  canPublish: boolean;
  initialPropertyId?: string;
}

const DEFAULT_SECTIONS = [
  { id: "overview", label: "Overview", enabled: true, order: 0 },
  { id: "gallery", label: "Gallery", enabled: true, order: 1 },
  { id: "unit-plans", label: "Unit Plans", enabled: true, order: 2 },
  { id: "amenities", label: "Amenities", enabled: true, order: 3 },
  { id: "location", label: "Location", enabled: true, order: 4 },
  { id: "enquire", label: "Enquire", enabled: true, order: 5 },
];

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/50";
const labelCls =
  "mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground";

type PropertySiteFormValues = z.input<typeof PropertySiteValidator>;
type PropertySiteSubmitValues = z.output<typeof PropertySiteValidator>;
type PropertySiteSection = PropertySiteSubmitValues["sections"][number];

export function PropertySiteForm({
  site,
  properties,
  companies,
  canPublish,
  initialPropertyId,
}: PropertySiteFormProps) {
  const router = useRouter();
  const isEdit = Boolean(site);
  const [isPending, startTransition] = useTransition();
  const [sections, setSections] = useState<PropertySiteSection[]>(
    site?.sections?.length ? site.sections : DEFAULT_SECTIONS
  );

  const { control, register, handleSubmit, setValue, getValues } =
    useForm<PropertySiteFormValues, unknown, PropertySiteSubmitValues>({
      resolver: zodResolver(PropertySiteValidator),
      defaultValues: site
        ? {
            propertyId: site.propertyId,
            companyId: site.companyId ?? "",
            siteSlug: site.siteSlug,
            template: site.template,
            themePreset: site.themePreset,
            publishStatus: site.publishStatus,
            heroTitle: site.heroTitle,
            heroSubtitle: site.heroSubtitle,
            heroCtaLabel: site.heroCtaLabel,
            heroSecondaryCtaLabel: site.heroSecondaryCtaLabel,
            contact: site.contact ?? {},
            navigation: site.navigation ?? [],
            sections: site.sections ?? [],
            seo: site.seo ?? { keywords: [] },
            tracking: site.tracking ?? {},
            customDomains: site.customDomains ?? [],
          }
        : {
            propertyId: initialPropertyId,
            companyId: "",
            template: "signature_landing",
            themePreset: "signature_navy",
            publishStatus: "draft",
            contact: {},
            navigation: [],
            sections: [],
            seo: { keywords: [] },
            tracking: {},
            customDomains: [],
          },
    });

  const propertyId = useWatch({ control, name: "propertyId" });

  const syncSlugFromProperty = () => {
    const property = properties.find((item) => item._id === propertyId);
    const current = getValues("siteSlug");

    if (!current && property) {
      setValue(
        "siteSlug",
        slugify(property.slug || property.title, {
          lower: true,
          strict: true,
          trim: true,
        })
      );
    }
  };

  const onSubmit = (data: PropertySiteSubmitValues) => {
    startTransition(async () => {
      const activeSections = [...sections].sort((a, b) => a.order - b.order);
      const payload = {
        ...data,
        siteSlug:
          data.siteSlug ||
          slugify(data.heroTitle || propertyId || "", {
            lower: true,
            strict: true,
            trim: true,
          }),
        sections: activeSections,
        navigation: activeSections
          .filter((section) => section.enabled)
          .map((section) => ({
            label: section.label,
            href: section.id === "enquire" ? "#enquire" : `#${section.id}`,
            enabled: true,
          })),
        publishStatus:
          canPublish || data.publishStatus !== "published"
            ? data.publishStatus
            : "in_review",
        customDomains: (data.customDomains ?? []).filter(Boolean),
      };

      const response = isEdit
        ? await updatePropertySite(site!._id!, payload)
        : await createPropertySite(payload);

      if (!response.success) {
        toast.error(response.error ?? "Failed to save property microsite");
        return;
      }

      toast.success(response.message ?? "Property microsite saved");
      router.push("/admin/property-sites");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              {isEdit ? "Edit Microsite" : "Add Microsite"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure a focused property landing page that inherits shared
              project data and feeds enquiries back into the main pool.
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-primary-light disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEdit ? "Save Changes" : "Create Microsite"}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Property *</label>
            <select
              {...register("propertyId")}
              onBlur={syncSlugFromProperty}
              className={inputCls}
            >
              <option value="">Select property</option>
              {properties.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.projectName ?? property.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Company Override</label>
            <select {...register("companyId")} className={inputCls}>
              <option value="">Inherit from property company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Microsite Slug *</label>
            <input
              {...register("siteSlug")}
              className={inputCls}
              placeholder="attalika-palms"
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select {...register("publishStatus")} className={inputCls}>
              {PUBLISH_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Theme Preset</label>
            <select {...register("themePreset")} className={inputCls}>
              {COMPANY_THEME_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Template</label>
            <input
              value="signature_landing"
              readOnly
              className={`${inputCls} opacity-70`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Hero Title</label>
            <input
              {...register("heroTitle")}
              className={inputCls}
              placeholder="A conversion-first headline for this property landing page"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Hero Subtitle</label>
            <textarea
              {...register("heroSubtitle")}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Support copy for the hero section. Leave blank to inherit the property description."
            />
          </div>
          <div>
            <label className={labelCls}>Primary CTA Label</label>
            <input
              {...register("heroCtaLabel")}
              className={inputCls}
              placeholder="Book Site Visit"
            />
          </div>
          <div>
            <label className={labelCls}>Secondary CTA Label</label>
            <input
              {...register("heroSecondaryCtaLabel")}
              className={inputCls}
              placeholder="Download Brochure"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-xl font-medium text-foreground">
            Contact Overrides
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Phone</label>
              <input {...register("contact.phone")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input {...register("contact.email")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input {...register("contact.whatsapp")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Office Address</label>
              <textarea
                {...register("contact.officeAddress")}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>Map Link</label>
              <input {...register("contact.mapLink")} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-xl font-medium text-foreground">
            SEO & Tracking
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>SEO Title</label>
              <input {...register("seo.title")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>SEO Description</label>
              <textarea
                {...register("seo.description")}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>Canonical URL</label>
              <input {...register("seo.canonicalUrl")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Source Tag</label>
              <input {...register("tracking.sourceTag")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Campaign Tag</label>
              <input
                {...register("tracking.campaignTag")}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-serif text-xl font-medium text-foreground">
            Section Toggles
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reorder and enable the fixed single-page sections. Navigation items
            will be generated from the enabled sections automatically.
          </p>
        </div>
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {section.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  #{section.id}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(event) =>
                    setSections((prev) =>
                      prev.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, enabled: event.target.checked }
                          : item
                      )
                    )
                  }
                  className="h-4 w-4 accent-primary"
                />
                Enabled
              </label>
              <input
                type="number"
                min={0}
                value={section.order}
                onChange={(event) =>
                  setSections((prev) =>
                    prev.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, order: Number(event.target.value) || 0 }
                        : item
                    )
                  )
                }
                className={`${inputCls} w-24`}
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
