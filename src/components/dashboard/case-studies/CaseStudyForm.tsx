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
  createCaseStudy,
  updateCaseStudy,
} from "@/lib/db/actions/case-study.actions";
import {
  CaseStudyValidator,
} from "@/lib/utils/validators";
import { PUBLISH_STATUSES } from "@/lib/utils/constants";
import type { ICaseStudy, ICompany, IMediaAsset, IProperty } from "@/types";

interface CaseStudyFormProps {
  caseStudy?: ICaseStudy;
  companies: ICompany[];
  properties: IProperty[];
  canPublish: boolean;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/50";
const labelCls =
  "mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground";

type CaseStudyFormValues = z.input<typeof CaseStudyValidator>;
type CaseStudySubmitValues = z.output<typeof CaseStudyValidator>;
type CaseStudyOutcome = CaseStudySubmitValues["outcomes"][number];
type CaseStudyMedia = CaseStudySubmitValues["media"][number];

function normalizeCaseStudyMedia(
  media?: IMediaAsset
): CaseStudyMedia {
  return {
    url: media?.url ?? "",
    type: media?.type ?? "image",
    caption: media?.caption ?? "",
    isCover: media?.isCover ?? false,
    order: media?.order ?? 0,
  };
}

export function CaseStudyForm({
  caseStudy,
  companies,
  properties,
  canPublish,
}: CaseStudyFormProps) {
  const router = useRouter();
  const isEdit = Boolean(caseStudy);
  const [isPending, startTransition] = useTransition();
  const [outcomes, setOutcomes] = useState<CaseStudyOutcome[]>(
    caseStudy?.outcomes?.length
      ? caseStudy.outcomes.map((outcome) => ({ ...outcome }))
      : [{ label: "Qualified Leads", value: "185+" }]
  );
  const [media, setMedia] = useState<CaseStudyMedia[]>(
    caseStudy?.media?.length
      ? caseStudy.media.map((item) => normalizeCaseStudyMedia(item))
      : [{ url: "", type: "image", caption: "", isCover: true, order: 0 }]
  );
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>(
    caseStudy?.propertyIds ?? []
  );

  const { control, register, handleSubmit, setValue, getValues } = useForm<
    CaseStudyFormValues,
    unknown,
    CaseStudySubmitValues
  >({
    resolver: zodResolver(CaseStudyValidator),
    defaultValues: caseStudy
      ? {
          companyId: caseStudy.companyId,
          propertyIds: caseStudy.propertyIds ?? [],
          title: caseStudy.title,
          slug: caseStudy.slug,
          summary: caseStudy.summary,
          challenge: caseStudy.challenge,
          solution: caseStudy.solution,
          outcomes: caseStudy.outcomes,
          testimonialQuote: caseStudy.testimonialQuote,
          media: caseStudy.media?.map((item) => normalizeCaseStudyMedia(item)) ?? [],
          featured: caseStudy.featured,
          publishStatus: caseStudy.publishStatus,
        }
      : {
          propertyIds: [],
          outcomes: [],
          media: [],
          featured: false,
          publishStatus: "draft",
        },
  });

  const titleValue = useWatch({ control, name: "title" });

  const syncSlug = () => {
    const current = getValues("slug");
    if (!current && titleValue) {
      setValue(
        "slug",
        slugify(titleValue, { lower: true, strict: true, trim: true })
      );
    }
  };

  const onSubmit = (data: CaseStudySubmitValues) => {
    startTransition(async () => {
      const payload = {
        ...data,
        slug:
          data.slug ||
          slugify(data.title, { lower: true, strict: true, trim: true }),
        propertyIds: selectedPropertyIds,
        outcomes: outcomes.filter((item) => item.label.trim() && item.value.trim()),
        media: media.filter((item) => item.url.trim()),
        publishStatus:
          canPublish || data.publishStatus !== "published"
            ? data.publishStatus
            : "in_review",
      };

      const response = isEdit
        ? await updateCaseStudy(caseStudy!._id!, payload)
        : await createCaseStudy(payload);

      if (!response.success) {
        toast.error(response.error ?? "Failed to save case study");
        return;
      }

      toast.success(response.message ?? "Case study saved");
      router.push("/admin/case-studies");
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
              {isEdit ? "Edit Case Study" : "Add Case Study"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Build proof-driven public stories that connect builders,
              properties, and outcomes.
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
          {isEdit ? "Save Changes" : "Create Case Study"}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Company *</label>
            <select {...register("companyId")} className={inputCls}>
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
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
          <div className="sm:col-span-2">
            <label className={labelCls}>Title *</label>
            <input
              {...register("title")}
              onBlur={syncSlug}
              className={inputCls}
              placeholder="Luxury inventory launch for Rishita in Sushant Golf City"
            />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              {...register("slug")}
              className={inputCls}
              placeholder="rishita-sushant-golf-city-launch"
            />
          </div>
          <div className="flex items-center gap-3 pt-7">
            <input
              type="checkbox"
              {...register("featured")}
              className="h-4 w-4 accent-primary"
            />
            <label className="text-sm text-muted-foreground">
              Feature this case study on the homepage and About page
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Summary *</label>
            <textarea
              {...register("summary")}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Short outcome-led summary that anchors the public case-study cards."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Challenge</label>
            <textarea
              {...register("challenge")}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="What the builder or property launch needed solved."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Solution</label>
            <textarea
              {...register("solution")}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="How Homes positioned inventory, content, lead capture, and advisory."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Testimonial Quote</label>
            <textarea
              {...register("testimonialQuote")}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="A short builder-side endorsement."
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="font-serif text-xl font-medium text-foreground">
            Linked Properties
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Associate the case study with listed properties so it appears on
            company and project pages.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {properties.map((property) => (
            <label
              key={property._id}
              className="flex items-start gap-3 rounded-xl border border-border p-4 text-sm text-muted-foreground"
            >
              <input
                type="checkbox"
                checked={selectedPropertyIds.includes(property._id!)}
                onChange={(event) =>
                  setSelectedPropertyIds((prev) =>
                    event.target.checked
                      ? [...prev, property._id!]
                      : prev.filter((value) => value !== property._id)
                  )
                }
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block font-medium text-foreground">
                  {property.projectName ?? property.title}
                </span>
                <span className="block">{property.developerName}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium text-foreground">
              Outcomes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use concise proof points for the homepage and detailed case-study
              layouts.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setOutcomes((prev) => [...prev, { label: "", value: "" }])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Add Outcome
          </button>
        </div>
        <div className="space-y-3">
          {outcomes.map((outcome, index) => (
            <div
              key={`${outcome.label}-${index}`}
              className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_1fr_auto]"
            >
              <input
                value={outcome.label}
                onChange={(event) =>
                  setOutcomes((prev) =>
                    prev.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, label: event.target.value }
                        : item
                    )
                  )
                }
                className={inputCls}
                placeholder="Metric"
              />
              <input
                value={outcome.value}
                onChange={(event) =>
                  setOutcomes((prev) =>
                    prev.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, value: event.target.value }
                        : item
                    )
                  )
                }
                className={inputCls}
                placeholder="Value"
              />
              <button
                type="button"
                onClick={() =>
                  setOutcomes((prev) =>
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

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium text-foreground">
              Media
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add cover art or supporting media for the case-study page and
              teaser cards.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setMedia((prev) => [
                ...prev,
                {
                  url: "",
                  type: "image",
                  caption: "",
                  isCover: false,
                  order: prev.length,
                },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Add Media
          </button>
        </div>
        <div className="space-y-3">
          {media.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 md:grid-cols-[2fr_1fr_1fr_auto]"
            >
              <input
                value={item.url}
                onChange={(event) =>
                  setMedia((prev) =>
                    prev.map((mediaItem, itemIndex) =>
                      itemIndex === index
                        ? { ...mediaItem, url: event.target.value }
                        : mediaItem
                    )
                  )
                }
                className={inputCls}
                placeholder="https://..."
              />
              <select
                value={item.type}
                onChange={(event) =>
                  setMedia((prev) =>
                    prev.map((mediaItem, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...mediaItem,
                            type: event.target.value as
                              | "image"
                              | "floorplan"
                              | "brochure"
                              | "video"
                              | "virtual_tour",
                          }
                        : mediaItem
                    )
                  )
                }
                className={inputCls}
              >
                <option value="image">image</option>
                <option value="video">video</option>
                <option value="brochure">brochure</option>
              </select>
              <input
                value={item.caption ?? ""}
                onChange={(event) =>
                  setMedia((prev) =>
                    prev.map((mediaItem, itemIndex) =>
                      itemIndex === index
                        ? { ...mediaItem, caption: event.target.value }
                        : mediaItem
                    )
                  )
                }
                className={inputCls}
                placeholder="Caption"
              />
              <button
                type="button"
                onClick={() =>
                  setMedia((prev) =>
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
    </form>
  );
}
