"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createLead } from "@/lib/db/actions/lead.actions";
import {
  ENQUIRY_INTERESTS,
  LEAD_SOURCES,
} from "@/lib/utils/constants";
import { LeadValidator, type LeadInput } from "@/lib/utils/validators";

type PropertyOption = {
  id: string;
  name: string;
  slug: string;
};

type AddLeadFormValues = z.input<typeof LeadValidator>;
type AddLeadSubmitValues = z.output<typeof LeadValidator>;

const fieldCls = "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50";
const labelCls = "mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground";

const optionalNumberField = {
  setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
};

export function AddLeadForm({
  properties,
}: {
  properties: PropertyOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["general"]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddLeadFormValues, unknown, AddLeadSubmitValues>({
    resolver: zodResolver(LeadValidator),
    defaultValues: {
      stage: "new",
      source: "website",
      interestedIn: ["general"],
    },
  });

  const selectedPropertyId = useWatch({ control, name: "propertyId" });
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) => {
      const next = current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest];

      return next.length > 0 ? next : ["general"];
    });
  };

  const onSubmit = (data: AddLeadSubmitValues) => {
    startTransition(async () => {
      const leadPayload: LeadInput = {
        ...data,
        stage: "new",
        interestedIn: selectedInterests as LeadInput["interestedIn"],
        propertyId: selectedProperty?.id,
        propertyName: selectedProperty?.name,
        propertySlug: selectedProperty?.slug,
      };

      const res = await createLead(leadPayload);

      if (res.success) {
        toast.success(res.message ?? "Lead created");
        router.push("/admin/leads");
        router.refresh();
        return;
      }

      toast.error(res.error ?? "Could not create lead");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              Add Lead
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a lead manually and drop it straight into the pipeline.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Create Lead
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input {...register("name")} className={fieldCls} placeholder="Client name" />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Phone *</label>
            <input {...register("phone")} className={fieldCls} placeholder="+91 98xxxxxxxx" />
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input {...register("email")} className={fieldCls} placeholder="name@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Source</label>
            <select {...register("source")} className={fieldCls}>
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Property</label>
            <select {...register("propertyId")} className={fieldCls}>
              <option value="">General enquiry / no property selected</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Lead Score</label>
            <input
              {...register("score", optionalNumberField)}
              type="number"
              min={0}
              max={100}
              className={fieldCls}
              placeholder="0-100"
            />
            {errors.score && <p className="mt-1 text-xs text-red-400">{errors.score.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Requirements</label>
            <textarea
              {...register("requirements")}
              rows={4}
              className={fieldCls}
              placeholder="Budget, configuration, preferred localities, timeline, or anything the agent should know."
            />
            {errors.requirements && <p className="mt-1 text-xs text-red-400">{errors.requirements.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Interested In</label>
            <div className="flex flex-wrap gap-2">
              {ENQUIRY_INTERESTS.map((interest) => {
                const active = selectedInterests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-xl border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {interest.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
