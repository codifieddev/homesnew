"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowLeft, Save, Loader2, Plus, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { createProperty, updateProperty } from "@/lib/db/actions/property.actions";
import { PropertyValidator } from "@/lib/utils/validators";
import { MediaGallery } from "@/components/dashboard/properties/MediaGallery";
import { AmenityIcon } from "@/components/shared/AmenityIcon";
import {
  PROPERTY_CATEGORIES, PROPERTY_TYPES, TRANSACTION_TYPES, BHK_CONFIGS,
  FURNISHING_STATUS, PROPERTY_AGE, POSSESSION_STATUS, FACING_DIRECTIONS,
  PARKING_TYPES, WATER_SUPPLY_OPTIONS, POWER_BACKUP_OPTIONS,
  OWNERSHIP_TYPES, ZONING_TYPES, AREA_UNITS, AMENITIES_LIST,
} from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { ICompany, IMediaAsset, INearbyPlace, IProperty, IUnitPlan } from "@/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface PropertyFormProps {
  property?: IProperty; // if provided = edit mode
  companies: ICompany[];
}

type PropertyFormValues = z.input<typeof PropertyValidator>;
type PropertySubmitValues = z.output<typeof PropertyValidator>;
type PropertyMediaAsset = PropertySubmitValues["mediaAssets"][number];
type PropertyNearbyPlace = PropertySubmitValues["nearbyPlaces"][number];
type PropertyUnitPlan = PropertySubmitValues["unitPlans"][number];

function normalizeMediaAsset(asset: IMediaAsset): PropertyMediaAsset {
  return {
    url: asset.url,
    type: asset.type,
    caption: asset.caption ?? "",
    isCover: asset.isCover ?? false,
    order: asset.order ?? 0,
  };
}

function normalizeNearbyPlace(place: INearbyPlace): PropertyNearbyPlace {
  return {
    name: place.name,
    category: place.category,
    distanceMinutes: place.distanceMinutes,
    distanceKm: place.distanceKm,
  };
}

function normalizeUnitPlan(plan: IUnitPlan): PropertyUnitPlan {
  return {
    name: plan.name,
    bhkLabel: plan.bhkLabel,
    carpetArea: plan.carpetArea,
    superBuiltUpArea: plan.superBuiltUpArea,
    priceLabel: plan.priceLabel,
    availability: plan.availability,
    floorLabel: plan.floorLabel,
    facingDirection: plan.facingDirection,
    floorplanUrl: plan.floorplanUrl,
    walkthroughUrl: plan.walkthroughUrl,
    description: plan.description,
  };
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

function FormSection({
  title, number, open, onToggle, children,
}: {
  title: string; number: string; open: boolean;
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-[11px] font-medium text-primary">
            {number}
          </span>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border px-6 pb-6 pt-2">{children}</div>}
    </div>
  );
}

// ─── FIELD HELPERS ────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/50";
const labelCls = "mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground";
const gridCls  = "grid grid-cols-1 sm:grid-cols-2 gap-4";
const grid3cls  = "grid grid-cols-1 sm:grid-cols-3 gap-4";

const optionalNumberField = {
  setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
};

const requiredNumberField = {
  setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
};

function registerNumberField(
  register: UseFormRegister<PropertyFormValues>,
  name: Parameters<UseFormRegister<PropertyFormValues>>[0],
  required = false
) {
  return register(name, required ? requiredNumberField : optionalNumberField);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function PropertyForm({ property, companies }: PropertyFormProps) {
  const router = useRouter();
  const isEdit = !!property;
  const [isPending, startTransition] = useTransition();
  const [openSection, setOpenSection] = useState<string>("basic");

  // Amenities multi-select state
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property?.features?.amenities ?? []
  );

  // Nearby places state
  const [nearbyPlaces, setNearbyPlaces] = useState(
    property?.nearbyPlaces?.map((place) => normalizeNearbyPlace(place)) ?? []
  );
  const [mediaAssets, setMediaAssets] = useState(
    property?.mediaAssets?.map((asset) => normalizeMediaAsset(asset)) ?? []
  );
  const [unitPlans, setUnitPlans] = useState<PropertyUnitPlan[]>(
    property?.unitPlans?.map((plan) => normalizeUnitPlan(plan)) ?? []
  );

  const { register, handleSubmit, formState: { errors }, setValue, control } =
    useForm<PropertyFormValues, unknown, PropertySubmitValues>({
      resolver: zodResolver(PropertyValidator),
      defaultValues: isEdit
        ? {
            title: property.title,
            description: property.description,
            developerName: property.developerName,
            companyId: property.companyId ?? "",
            projectName: property.projectName,
            tagline: property.tagline,
            status: (property.status as "active" | "blocked" | "sold" | "archived") ?? "active",
            isFeatured: property.isFeatured,
            location: property.location,
            specifications: property.specifications as never,
            sizeLayout: property.sizeLayout as never,
            financials: property.financials as never,
            features: { ...property.features, amenities: property.features?.amenities ?? [] } as never,
            legalInfo: property.legalInfo as never,
            brokeragePolicy: property.brokeragePolicy as never,
            mediaAssets: property.mediaAssets?.map((asset) => normalizeMediaAsset(asset)) ?? [],
            nearbyPlaces: property.nearbyPlaces?.map((place) => normalizeNearbyPlace(place)) ?? [],
            unitPlans: property.unitPlans?.map((plan) => normalizeUnitPlan(plan)) ?? [],
          }
        : {
            companyId: "",
            status: "active",
            isFeatured: false,
            specifications: { category: "Residential", transactionType: "Sale", possessionStatus: "Ready to Move" },
            financials: { gstApplicable: false, homeLoanAvailable: true, priceType: "total" },
            features: { isGatedCommunity: false, amenities: [] },
            legalInfo: { ownershipType: "Freehold", zoningType: "Residential", reraRegistered: false },
            brokeragePolicy: { listedBy: "Agent", isNegotiable: true, documentationSupport: true, shortlistingSupport: true },
            sizeLayout: { parkingAvailable: false, areaUnit: "sqft" },
            mediaAssets: [],
            nearbyPlaces: [],
            unitPlans: [],
          },
    });

  const propertyType = useWatch({ control, name: "specifications.propertyType" });
  const isPlot = propertyType === "Plot" || propertyType === "Agricultural Land";
  const isCommercial = propertyType === "Shop" || propertyType === "Office Space" || propertyType === "Warehouse";
  const isHouse = propertyType === "Villa" || propertyType === "Independent House" || propertyType === "Penthouse";

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addNearbyPlace = () => {
    setNearbyPlaces((prev) => [
      ...prev,
      { name: "", category: "Key Landmarks", distanceMinutes: undefined },
    ]);
  };

  const removeNearbyPlace = (index: number) => {
    setNearbyPlaces((prev) => prev.filter((_, i) => i !== index));
  };

  const addUnitPlan = () => {
    setUnitPlans((prev) => [
      ...prev,
      {
        name: "",
        bhkLabel: "",
        carpetArea: undefined,
        superBuiltUpArea: undefined,
        priceLabel: "",
        availability: "",
        floorLabel: "",
        description: "",
      },
    ]);
  };

  const updateUnitPlan = (
    index: number,
    key: keyof PropertyUnitPlan,
    value: string | number | undefined
  ) => {
    setUnitPlans((prev) =>
      prev.map((plan, planIndex) =>
        planIndex === index ? { ...plan, [key]: value } : plan
      )
    );
  };

  const removeUnitPlan = (index: number) => {
    setUnitPlans((prev) => prev.filter((_, planIndex) => planIndex !== index));
  };

  const onSubmit = (data: PropertySubmitValues) => {
    startTransition(async () => {
      const payload = {
        ...data,
        features: { ...data.features, amenities: selectedAmenities },
        mediaAssets: mediaAssets.filter((asset) => asset.url.trim()),
        nearbyPlaces: nearbyPlaces.filter((p) => p.name.trim()),
        unitPlans: unitPlans.filter((plan) => plan.name.trim()),
      };

      const res = isEdit
        ? await updateProperty(property._id!, payload)
        : await createProperty(payload);

      if (res.success) {
        toast.success(res.message ?? (isEdit ? "Property updated" : "Property created"));
        if (isEdit) {
          router.push("/admin/properties");
        } else if (res.data?._id) {
          router.push(`/admin/properties/${res.data._id}/edit`);
        } else {
          router.push("/admin/properties");
        }
        router.refresh();
      } else {
        toast.error(res.error ?? "Something went wrong");
      }
    });
  };

  const toggle = (key: string) => setOpenSection((prev) => (prev === key ? "" : key));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-medium text-foreground">
              {isEdit ? "Edit Property" : "Add New Property"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {isEdit ? `Editing: ${property.projectName ?? property.title}` : "Fill in the property details below. You can upload the gallery after the first save."}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-light text-foreground text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Save Changes" : "Create Property"}
        </button>
      </div>

      {/* ── SECTION 1: Basic Information ─────────────────────────────────────── */}
      <FormSection title="Basic Information (Type & Category)" number="1" open={openSection === "basic"} onToggle={() => toggle("basic")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            <div>
              <label className={labelCls}>Property Type *</label>
              <select {...register("specifications.propertyType")} className={inputCls}>
                <option value="">Select…</option>
                {PROPERTY_TYPES.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select {...register("specifications.category")} className={inputCls}>
                {PROPERTY_CATEGORIES.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Transaction Type *</label>
              <select {...register("specifications.transactionType")} className={inputCls}>
                {TRANSACTION_TYPES.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 2: Identity ──────────────────────────────────────────────── */}
      <FormSection title="Property Identity" number="2" open={openSection === "identity"} onToggle={() => toggle("identity")}>
        <div className="space-y-4 mt-4">
          <div className={gridCls}>
            <div className="sm:col-span-2">
              <label className={labelCls}>Project / Listing Title *</label>
              <input {...register("title")} placeholder="e.g. Okas Enclave – Premium Residential Plots" className={inputCls} />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Developer Name *</label>
              <input {...register("developerName")} placeholder="e.g. Pardos Developers" className={inputCls} />
              {errors.developerName && <p className="text-xs text-red-400 mt-1">{errors.developerName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Linked Company</label>
              <select {...register("companyId")} className={inputCls}>
                <option value="">Unassigned / Developer fallback</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Project Name</label>
              <input {...register("projectName")} placeholder="Short project name" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Tagline</label>
              <input {...register("tagline")} placeholder="e.g. Nature meets modern living in Sushant Golf City" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Detailed description of the property, location highlights, and investment rationale…"
                className={cn(inputCls, "resize-none")}
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select {...register("status")} className={inputCls}>
                {["active", "blocked", "sold", "archived"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" {...register("isFeatured")} id="featured" className="w-4 h-4 accent-primary" />
              <label htmlFor="featured" className="text-sm text-muted-foreground cursor-pointer">Mark as Featured (shows on homepage)</label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 3: Location ─────────────────────────────────────────────── */}
      <FormSection title="Location & Address" number="3" open={openSection === "location"} onToggle={() => toggle("location")}>
        <div className="space-y-4 mt-4">
          <div className={gridCls}>
            <div className="sm:col-span-2">
              <label className={labelCls}>Full Address *</label>
              <input {...register("location.address")} placeholder="e.g. Sushant Golf City, Sultanpur Road" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Locality / Area *</label>
              <input {...register("location.locality")} placeholder="e.g. Sushant Golf City" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>City *</label>
              <input {...register("location.city")} placeholder="Lucknow" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>State *</label>
              <input {...register("location.state")} placeholder="Uttar Pradesh" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pincode</label>
              <input {...register("location.pincode")} placeholder="226030" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Longitude (decimal)</label>
              <input
                {...registerNumberField(register, "location.coordinates.0", true)}
                type="number"
                step="any"
                placeholder="80.9462"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Latitude (decimal)</label>
              <input
                {...registerNumberField(register, "location.coordinates.1", true)}
                type="number"
                step="any"
                placeholder="26.8467"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Google Maps URL</label>
              <input {...register("location.googleMapsUrl")} placeholder="https://maps.google.com/..." className={inputCls} />
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 4: Specifications ────────────────────────────────────────── */}
      <FormSection title="Property Specifications" number="4" open={openSection === "specs"} onToggle={() => toggle("specs")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            {!isPlot && (
              <>
                <div>
                  <label className={labelCls}>BHK Config</label>
                  <select {...register("specifications.bhkConfig")} className={inputCls}>
                    <option value="">Select…</option>
                    {BHK_CONFIGS.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Furnishing</label>
                  <select {...register("specifications.furnishingStatus")} className={inputCls}>
                    <option value="">Select…</option>
                    {FURNISHING_STATUS.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Property Age</label>
                  <select {...register("specifications.propertyAge")} className={inputCls}>
                    <option value="">Select…</option>
                    {PROPERTY_AGE.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className={labelCls}>Possession Status *</label>
              <select {...register("specifications.possessionStatus")} className={inputCls}>
                {POSSESSION_STATUS.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Facing Direction</label>
              <select {...register("specifications.facingDirection")} className={inputCls}>
                <option value="">Select…</option>
                {FACING_DIRECTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
            {!isPlot && !isHouse && (
              <div>
                <label className={labelCls}>Floor Number</label>
                <input {...register("specifications.floorNumber")} placeholder="e.g. Ground / 5th" className={inputCls} />
              </div>
            )}
            {!isPlot && (
              <div>
                <label className={labelCls}>Total Floors</label>
                <input {...register("specifications.totalFloors")} placeholder="e.g. 10" className={inputCls} />
              </div>
            )}
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" {...register("specifications.isCornerUnit")} className="w-4 h-4 accent-primary" />
              <label className="text-sm text-muted-foreground">Corner Unit / Plot</label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 5: Size & Layout ─────────────────────────────────────────── */}
      <FormSection title="Size & Layout" number="5" open={openSection === "size"} onToggle={() => toggle("size")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            <div>
              <label className={labelCls}>Area Unit</label>
              <select {...register("sizeLayout.areaUnit")} className={inputCls}>
                {AREA_UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
              </select>
            </div>
            
            {!isPlot && (
              <>
                <div>
                  <label className={labelCls}>Built-up Area</label>
                  <input {...registerNumberField(register, "sizeLayout.builtUpArea")} type="number" placeholder="1200" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Carpet Area</label>
                  <input {...registerNumberField(register, "sizeLayout.carpetArea")} type="number" placeholder="980" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Super Built-up Area</label>
                  <input {...registerNumberField(register, "sizeLayout.superBuiltUpArea")} type="number" placeholder="1450" className={inputCls} />
                </div>
              </>
            )}

            {(isPlot || isHouse || isCommercial) && (
              <>
                <div>
                  <label className={labelCls}>Plot Area</label>
                  <input {...registerNumberField(register, "sizeLayout.plotArea")} type="number" placeholder="200" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Plot Dimensions</label>
                  <input {...register("sizeLayout.plotDimensions")} placeholder="30×40 ft" className={inputCls} />
                </div>
              </>
            )}

            {!isPlot && !isCommercial && (
              <>
                <div>
                  <label className={labelCls}>Bedrooms</label>
                  <input {...registerNumberField(register, "sizeLayout.bedrooms")} type="number" placeholder="3" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Bathrooms</label>
                  <input {...registerNumberField(register, "sizeLayout.bathrooms")} type="number" placeholder="3" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Balconies</label>
                  <input {...registerNumberField(register, "sizeLayout.balconies")} type="number" placeholder="2" className={inputCls} />
                </div>
              </>
            )}
          </div>
          
          <div className={gridCls}>
            <div className="flex items-center gap-3 pt-1">
              <input type="checkbox" {...register("sizeLayout.parkingAvailable")} className="w-4 h-4 accent-primary" />
              <label className="text-sm text-muted-foreground">Parking Available</label>
            </div>
            <div>
              <label className={labelCls}>Parking Type</label>
              <select {...register("sizeLayout.parkingType")} className={inputCls}>
                <option value="">Select…</option>
                {PARKING_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>No. of Parking Slots</label>
              <input {...registerNumberField(register, "sizeLayout.parkingSlots")} type="number" placeholder="1" className={inputCls} />
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 6: Pricing ───────────────────────────────────────────────── */}
      <FormSection title="Pricing & Financials" number="6" open={openSection === "pricing"} onToggle={() => toggle("pricing")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            <div>
              <label className={labelCls}>Listed Price (INR) *</label>
              <input {...registerNumberField(register, "financials.listedPrice", true)} type="number" placeholder="5625000" className={inputCls} />
              {errors.financials?.listedPrice && <p className="text-xs text-red-400 mt-1">{errors.financials.listedPrice.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Price Type</label>
              <select {...register("financials.priceType")} className={inputCls}>
                {["total", "per_sqft", "monthly_rent"].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Price per Sqft</label>
              <input {...registerNumberField(register, "financials.pricePerSqft")} type="number" placeholder="5000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Maintenance Charges (₹/mo)</label>
              <input {...registerNumberField(register, "financials.maintenanceCharges")} type="number" placeholder="2500" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Stamp Duty %</label>
              <input {...registerNumberField(register, "financials.stampDutyPercent")} type="number" placeholder="7" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Registration Charges %</label>
              <input {...registerNumberField(register, "financials.registrationChargesPercent")} type="number" placeholder="1" className={inputCls} />
            </div>
          </div>
          <div className={gridCls}>
            <div>
              <label className={labelCls}>Approved Banks (comma-separated)</label>
              <input
                placeholder="SBI, HDFC Bank, ICICI Bank"
                className={inputCls}
                defaultValue={property?.financials?.approvedBanks?.join(", ")}
                onChange={(e) => {
                  const banks = e.target.value.split(",").map((b) => b.trim()).filter(Boolean);
                  setValue("financials.approvedBanks", banks);
                }}
              />
            </div>
            <div className="flex flex-col gap-3 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register("financials.gstApplicable")} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-muted-foreground">GST Applicable (Under Construction)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register("financials.homeLoanAvailable")} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-muted-foreground">Home Loan Available</span>
              </label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 7: Unit Plans ─────────────────────────────────────────────── */}
      <FormSection title="Room Types & Unit Plans" number="7" open={openSection === "unitPlans"} onToggle={() => toggle("unitPlans")}>
        <div className="space-y-3 mt-4">
          {unitPlans.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground">
              Add room types, layouts, and walk-through links to power property detail pages and microsites.
            </div>
          )}
          {unitPlans.map((plan, index) => (
            <div key={`${plan.name}-${index}`} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Unit Plan {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeUnitPlan(index)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div className={grid3cls}>
                <div>
                  <label className={labelCls}>Name *</label>
                  <input
                    value={plan.name}
                    onChange={(event) => updateUnitPlan(index, "name", event.target.value)}
                    className={inputCls}
                    placeholder="Tower A - 3 BHK"
                  />
                </div>
                <div>
                  <label className={labelCls}>BHK / Config</label>
                  <input
                    value={plan.bhkLabel ?? ""}
                    onChange={(event) => updateUnitPlan(index, "bhkLabel", event.target.value)}
                    className={inputCls}
                    placeholder="3 BHK + Study"
                  />
                </div>
                <div>
                  <label className={labelCls}>Availability</label>
                  <input
                    value={plan.availability ?? ""}
                    onChange={(event) => updateUnitPlan(index, "availability", event.target.value)}
                    className={inputCls}
                    placeholder="Limited inventory"
                  />
                </div>
                <div>
                  <label className={labelCls}>Carpet Area</label>
                  <input
                    type="number"
                    value={plan.carpetArea ?? ""}
                    onChange={(event) =>
                      updateUnitPlan(
                        index,
                        "carpetArea",
                        event.target.value === "" ? undefined : Number(event.target.value)
                      )
                    }
                    className={inputCls}
                    placeholder="1180"
                  />
                </div>
                <div>
                  <label className={labelCls}>Super Built-up Area</label>
                  <input
                    type="number"
                    value={plan.superBuiltUpArea ?? ""}
                    onChange={(event) =>
                      updateUnitPlan(
                        index,
                        "superBuiltUpArea",
                        event.target.value === "" ? undefined : Number(event.target.value)
                      )
                    }
                    className={inputCls}
                    placeholder="1450"
                  />
                </div>
                <div>
                  <label className={labelCls}>Price Label</label>
                  <input
                    value={plan.priceLabel ?? ""}
                    onChange={(event) => updateUnitPlan(index, "priceLabel", event.target.value)}
                    className={inputCls}
                    placeholder="Starts at ₹1.35 Cr"
                  />
                </div>
                <div>
                  <label className={labelCls}>Floor Label</label>
                  <input
                    value={plan.floorLabel ?? ""}
                    onChange={(event) => updateUnitPlan(index, "floorLabel", event.target.value)}
                    className={inputCls}
                    placeholder="Mid-rise floors"
                  />
                </div>
                <div>
                  <label className={labelCls}>Floorplan URL</label>
                  <input
                    value={plan.floorplanUrl ?? ""}
                    onChange={(event) => updateUnitPlan(index, "floorplanUrl", event.target.value)}
                    className={inputCls}
                    placeholder="/uploads/properties/slug/floorplan-1.webp"
                  />
                </div>
                <div>
                  <label className={labelCls}>3D / Walkthrough URL</label>
                  <input
                    value={plan.walkthroughUrl ?? ""}
                    onChange={(event) => updateUnitPlan(index, "walkthroughUrl", event.target.value)}
                    className={inputCls}
                    placeholder="https://example.com/virtual-tour"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={plan.description ?? ""}
                    onChange={(event) => updateUnitPlan(index, "description", event.target.value)}
                    rows={2}
                    className={cn(inputCls, "resize-none")}
                    placeholder="Who this layout suits best, view highlights, and layout notes."
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addUnitPlan}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary-light border border-primary/20 hover:border-primary/40 px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Unit Plan
          </button>
        </div>
      </FormSection>

      {/* ── SECTION 8: Media Gallery ─────────────────────────────────────────── */}
      <FormSection title="Media Gallery" number="8" open={openSection === "media"} onToggle={() => toggle("media")}>
        <div className="mt-4">
          <MediaGallery
            propertyId={property?._id}
            initialAssets={mediaAssets}
            onChange={(assets) =>
              setMediaAssets(assets.map((asset) => normalizeMediaAsset(asset)))
            }
          />
        </div>
      </FormSection>

      {/* ── SECTION 9: Amenities ─────────────────────────────────────────────── */}
      <FormSection title="Features & Amenities" number="9" open={openSection === "amenities"} onToggle={() => toggle("amenities")}>
        <div className="space-y-5 mt-4">
          <div className={gridCls}>
            <div>
              <label className={labelCls}>Water Supply</label>
              <select {...register("features.waterSupply")} className={inputCls}>
                <option value="">Select…</option>
                {WATER_SUPPLY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Power Backup</label>
              <select {...register("features.powerBackup")} className={inputCls}>
                <option value="">Select…</option>
                {POWER_BACKUP_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {["isGatedCommunity", "isVastuCompliant", "isPetFriendly", "isGreenBuilding", "hasSmartHome", "isWheelchairAccessible"].map((field) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer rounded-xl border border-border bg-background px-3 py-2 transition-colors hover:bg-accent">
                <input type="checkbox" {...register(`features.${field}` as never)} className="w-3.5 h-3.5 accent-primary" />
                <span className="text-xs text-muted-foreground capitalize">{field.replace(/is|has/g, "").replace(/([A-Z])/g, " $1").trim()}</span>
              </label>
            ))}
          </div>
          <div>
            <label className={labelCls}>Amenities</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {AMENITIES_LIST.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-all",
                    selectedAmenities.includes(amenity)
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <AmenityIcon amenity={amenity} className="h-3.5 w-3.5" />
                  {amenity}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{selectedAmenities.length} selected</p>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 10: Legal ────────────────────────────────────────────────── */}
      <FormSection title="Legal & Compliance" number="10" open={openSection === "legal"} onToggle={() => toggle("legal")}>
        <div className="space-y-4 mt-4">
          <div className={grid3cls}>
            <div>
              <label className={labelCls}>Ownership Type</label>
              <select {...register("legalInfo.ownershipType")} className={inputCls}>
                {OWNERSHIP_TYPES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Zoning Type</label>
              <select {...register("legalInfo.zoningType")} className={inputCls}>
                {ZONING_TYPES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Title Clearance</label>
              <select {...register("legalInfo.titleClearance")} className={inputCls}>
                {["Clear", "Under Litigation", "NA"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2.5 pt-5">
              <input type="checkbox" {...register("legalInfo.reraRegistered")} className="w-4 h-4 accent-primary" />
              <label className="text-sm text-muted-foreground">RERA Registered</label>
            </div>
            <div>
              <label className={labelCls}>RERA ID</label>
              <input {...register("legalInfo.reraId")} placeholder="UPRERAPRJ123456" className={inputCls} />
              {errors.legalInfo?.reraId && <p className="text-xs text-red-400 mt-1">{errors.legalInfo.reraId.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Occupancy Certificate</label>
              <select {...register("legalInfo.occupancyCertificate")} className={inputCls}>
                <option value="">Select…</option>
                {["Available", "Applied", "Not Available"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── SECTION 11: Nearby Places ────────────────────────────────────────── */}
      <FormSection title="Nearby Places" number="11" open={openSection === "nearby"} onToggle={() => toggle("nearby")}>
        <div className="space-y-3 mt-4">
          {nearbyPlaces.map((place, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-start">
              <input
                value={place.name}
                onChange={(e) => {
                  const updated = [...nearbyPlaces];
                  updated[index] = { ...updated[index], name: e.target.value };
                  setNearbyPlaces(updated);
                }}
                placeholder="Place name"
                className={cn(inputCls, "col-span-4")}
              />
              <select
                value={place.category}
                onChange={(e) => {
                  const updated = [...nearbyPlaces];
                  updated[index] = { ...updated[index], category: e.target.value as typeof place.category };
                  setNearbyPlaces(updated);
                }}
                className={cn(inputCls, "col-span-4")}
              >
                {["Schools & Colleges","Hospitals","Malls & Multiplex","Key Landmarks","IT Parks","Metro Stations"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                value={place.distanceMinutes ?? ""}
                onChange={(e) => {
                  const updated = [...nearbyPlaces];
                  updated[index] = { ...updated[index], distanceMinutes: Number(e.target.value) || undefined };
                  setNearbyPlaces(updated);
                }}
                placeholder="Mins"
                className={cn(inputCls, "col-span-3")}
              />
              <button
                type="button"
                onClick={() => removeNearbyPlace(index)}
                className="col-span-1 flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addNearbyPlace}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary-light border border-primary/20 hover:border-primary/40 px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Place
          </button>
        </div>
      </FormSection>

      {/* Bottom save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-light text-foreground text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Save Changes" : "Create Property"}
        </button>
      </div>
    </form>
  );
}
