"use client";

import { useState, useTransition } from "react";
import slugify from "slugify";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  createCompany,
  updateCompany,
} from "@/lib/db/actions/company.actions";
import {
  CompanyValidator,
} from "@/lib/utils/validators";
import {
  COMPANY_THEME_PRESETS,
  PUBLISH_STATUSES,
} from "@/lib/utils/constants";
import type { ICompany } from "@/types";

interface ManagerOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CompanyFormProps {
  company?: ICompany;
  managers: ManagerOption[];
  canManageAssignments: boolean;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/50";
const labelCls =
  "mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground";

type CompanyFormValues = z.input<typeof CompanyValidator>;
type CompanySubmitValues = z.output<typeof CompanyValidator>;
type CompanySocialLink = CompanySubmitValues["socialLinks"][number];

export function CompanyForm({
  company,
  managers,
  canManageAssignments,
}: CompanyFormProps) {
  const router = useRouter();
  const isEdit = Boolean(company);
  const [isPending, startTransition] = useTransition();
  const [socialLinks, setSocialLinks] = useState<CompanySocialLink[]>(
    company?.socialLinks?.length
      ? company.socialLinks.map((link) => ({
          platform: link.platform,
          label: link.label ?? "",
          url: link.url,
        }))
      : [{ platform: "website", label: "", url: "" }]
  );
  const [assignedManagerIds, setAssignedManagerIds] = useState<string[]>(
    company?.assignedManagerIds ?? []
  );

  const { control, register, handleSubmit, setValue, getValues } = useForm<
    CompanyFormValues,
    unknown,
    CompanySubmitValues
  >({
    resolver: zodResolver(CompanyValidator),
    defaultValues: company
      ? {
          name: company.name,
          slug: company.slug,
          logo: company.logo,
          shortIntro: company.shortIntro,
          fullProfile: company.fullProfile,
          contact: company.contact ?? {},
          address: company.address ?? {},
          socialLinks: company.socialLinks ?? [],
          themePreset: company.themePreset,
          featured: company.featured,
          status: company.status,
          assignedManagerIds: company.assignedManagerIds ?? [],
        }
      : {
          themePreset: "signature_navy",
          featured: false,
          status: "draft",
          contact: {},
          address: {},
          socialLinks: [],
          assignedManagerIds: [],
        },
  });

  const nameValue = useWatch({ control, name: "name" });

  const syncSlug = () => {
    const current = getValues("slug");
    if (!current && nameValue) {
      setValue(
        "slug",
        slugify(nameValue, { lower: true, strict: true, trim: true })
      );
    }
  };

  const updateSocialLink = (
    index: number,
    key: "platform" | "label" | "url",
    value: string
  ) => {
    setSocialLinks((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  };

  const onSubmit = (data: CompanySubmitValues) => {
    startTransition(async () => {
      const payload = {
        ...data,
        slug:
          data.slug ||
          slugify(data.name, { lower: true, strict: true, trim: true }),
        socialLinks: socialLinks.filter(
          (item) => item.platform.trim() && item.url.trim()
        ),
        assignedManagerIds,
      };

      const response = isEdit
        ? await updateCompany(company!._id!, payload)
        : await createCompany(payload);

      if (!response.success) {
        toast.error(response.error ?? "Failed to save company");
        return;
      }

      toast.success(response.message ?? "Company saved");
      router.push("/admin/companies");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
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
              {isEdit ? "Edit Company" : "Add Company"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure the developer profile used across trust sections, case
              studies, and property microsites.
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
          {isEdit ? "Save Changes" : "Create Company"}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Company Name *</label>
            <input
              {...register("name")}
              onBlur={syncSlug}
              className={inputCls}
              placeholder="Rishita Developers"
            />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              {...register("slug")}
              className={inputCls}
              placeholder="rishita-developers"
            />
          </div>
          <div>
            <label className={labelCls}>Logo URL</label>
            <input
              {...register("logo")}
              className={inputCls}
              placeholder="/logos/rishita.webp"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Short Intro</label>
            <textarea
              {...register("shortIntro")}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Trusted Lucknow developer with a strong plotted and residential portfolio."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Full Profile</label>
            <textarea
              {...register("fullProfile")}
              rows={6}
              className={`${inputCls} resize-none`}
              placeholder="Detailed company story, positioning, market experience, and brand credibility."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-xl font-medium text-foreground">
            Contact
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Phone</label>
              <input
                {...register("contact.phone")}
                className={inputCls}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                {...register("contact.email")}
                className={inputCls}
                placeholder="sales@example.com"
              />
            </div>
            <div>
              <label className={labelCls}>WhatsApp</label>
              <input
                {...register("contact.whatsapp")}
                className={inputCls}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input
                {...register("contact.website")}
                className={inputCls}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className={labelCls}>Sales Label</label>
              <input
                {...register("contact.salesLabel")}
                className={inputCls}
                placeholder="Sales Team"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-xl font-medium text-foreground">
            Address & Publishing
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Address</label>
              <input
                {...register("address.line1")}
                className={inputCls}
                placeholder="Office line 1"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Locality</label>
                <input
                  {...register("address.locality")}
                  className={inputCls}
                  placeholder="Gomti Nagar"
                />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input
                  {...register("address.city")}
                  className={inputCls}
                  placeholder="Lucknow"
                />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input
                  {...register("address.state")}
                  className={inputCls}
                  placeholder="Uttar Pradesh"
                />
              </div>
              <div>
                <label className={labelCls}>Pincode</label>
                <input
                  {...register("address.pincode")}
                  className={inputCls}
                  placeholder="226010"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Google Map Link</label>
              <input
                {...register("address.mapLink")}
                className={inputCls}
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <label className={labelCls}>Status</label>
                <select {...register("status")} className={inputCls}>
                  {PUBLISH_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                {...register("featured")}
                className="h-4 w-4 accent-primary"
              />
              Show this company in homepage and about-page trust sections
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium text-foreground">
              Social Links
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add website, LinkedIn, Instagram, or channel links for the public
              company page.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setSocialLinks((prev) => [
                ...prev,
                { platform: "", label: "", url: "" },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Add Link
          </button>
        </div>

        <div className="space-y-3">
          {socialLinks.map((link, index) => (
            <div
              key={`${link.platform}-${index}`}
              className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_1fr_2fr_auto]"
            >
              <input
                value={link.platform}
                onChange={(event) =>
                  updateSocialLink(index, "platform", event.target.value)
                }
                className={inputCls}
                placeholder="Platform"
              />
              <input
                value={link.label ?? ""}
                onChange={(event) =>
                  updateSocialLink(index, "label", event.target.value)
                }
                className={inputCls}
                placeholder="Label"
              />
              <input
                value={link.url}
                onChange={(event) =>
                  updateSocialLink(index, "url", event.target.value)
                }
                className={inputCls}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() =>
                  setSocialLinks((prev) =>
                    prev.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
                className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {canManageAssignments && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-xl font-medium text-foreground">
            Assigned Company Managers
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {managers.map((manager) => (
              <label
                key={manager.id}
                className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm text-muted-foreground"
              >
                <input
                  type="checkbox"
                  checked={assignedManagerIds.includes(manager.id)}
                  onChange={(event) =>
                    setAssignedManagerIds((prev) =>
                      event.target.checked
                        ? [...prev, manager.id]
                        : prev.filter((value) => value !== manager.id)
                    )
                  }
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>
                  <span className="block font-medium text-foreground">
                    {manager.name}
                  </span>
                  <span className="block">{manager.email}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
