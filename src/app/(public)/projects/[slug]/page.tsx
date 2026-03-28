import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { getPropertyBySlug, getAllPropertySlugs } from "@/lib/db/actions/property.actions";
import { getPublishedPropertySiteForProperty } from "@/lib/db/actions/property-site.actions";
import { ReraBadge } from "@/components/public/properties/ReraBadge";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { PropertyGallery } from "@/components/public/properties/PropertyGallery";
import { AmenityIcon } from "@/components/shared/AmenityIcon";
import {
  MapPin, Maximize2, BedDouble, Bath, Car,
  CheckCircle, ChevronRight, BadgeCheck, Phone,
} from "lucide-react";
import { getServerI18n } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/utils";
import { formatINR } from "@/lib/utils/constants";
import type { Metadata } from "next";

// ─── STATIC PARAMS ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

// ─── METADATA ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPropertyBySlug(slug);
  if (!res.success || !res.data) return { title: "Property Not Found" };

  const p = res.data;
  return {
    title: `${p.projectName ?? p.title} — ${p.location?.locality}, ${p.location?.city}`,
    description: p.description?.slice(0, 160),
    openGraph: {
      title: p.projectName ?? p.title,
      description: p.description?.slice(0, 160),
      images: p.mediaAssets?.find((m) => m.isCover)?.url
        ? [{ url: p.mediaAssets.find((m) => m.isCover)!.url }]
        : [],
    },
  };
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { locale } = await getServerI18n();
  const { slug } = await params;
  const res = await getPropertyBySlug(slug);

  if (!res.success || !res.data) notFound();

  const p = res.data;
  const siteRes = p._id
    ? await getPublishedPropertySiteForProperty(p._id)
    : { success: false as const };
  const site = siteRes.success ? siteRes.data : undefined;
  const price = p.financials?.listedPrice;
  const images = p.mediaAssets?.filter((m) => m.type === "image") ?? [];
  const floorplans = p.mediaAssets?.filter((m) => m.type === "floorplan") ?? [];
  const brochure = p.mediaAssets?.find((m) => m.type === "brochure");
  const unitPlans = p.unitPlans ?? [];

  // Group nearby places by category
  const nearbyByCategory: Record<string, typeof p.nearbyPlaces> = {};
  p.nearbyPlaces?.forEach((place) => {
    if (!nearbyByCategory[place.category]) nearbyByCategory[place.category] = [];
    nearbyByCategory[place.category].push(place);
  });

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.projectName ?? p.title,
    description: p.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: p.location?.address,
      addressLocality: p.location?.locality,
      addressRegion: p.location?.state,
      postalCode: p.location?.pincode,
      addressCountry: "IN",
    },
    offers: price ? {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
    } : undefined,
  };

  return (
    <>
      <Script
        id={`property-jsonld-${slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-background min-h-screen pt-16">

        {/* ── HERO BAR ──────────────────────────────────────────────────────── */}
        <div className="border-b border-border bg-background/95 sticky top-16 z-30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Link href={localizeHref(locale, "/")} className="transition-colors hover:text-primary">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href={localizeHref(locale, "/projects")} className="transition-colors hover:text-primary">Projects</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-muted-foreground">{p.projectName ?? p.title}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {p.legalInfo?.reraRegistered && (
                  <ReraBadge reraId={p.legalInfo.reraId} size="sm" showId />
                )}
                <span className="rounded-md bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                  {p.specifications?.propertyType}
                </span>
                <span className="rounded-md bg-accent px-2 py-0.5 text-xs capitalize text-muted-foreground">
                  {p.specifications?.possessionStatus}
                </span>
              </div>
            </div>
            {price && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Starting From</p>
                <p className="font-serif text-2xl font-semibold text-primary">{formatINR(price)}</p>
                {p.financials?.pricePerSqft && (
                  <p className="text-xs text-muted-foreground">₹{p.financials.pricePerSqft.toLocaleString("en-IN")}/sqft</p>
                )}
                {site && (
                  <Link
                    href={localizeHref(locale, `/sites/${site.siteSlug}`)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary-light"
                  >
                    Open Property Microsite <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT / MAIN ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Gallery */}
              {images.length > 0 && <PropertyGallery images={images} projectName={p.projectName ?? p.title} />}

              {/* Title + overview */}
              <div>
                <h1 className="mb-2 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                  {p.projectName ?? p.title}
                </h1>
                <div className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {p.location?.address}, {p.location?.city} – {p.location?.pincode}
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{p.description}</p>
              </div>

              {/* Key specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    icon: Maximize2,
                    label: "Plot / Built-up Area",
                    value: p.sizeLayout?.plotArea
                      ? `${p.sizeLayout.plotArea.toLocaleString("en-IN")} ${p.sizeLayout.areaUnit}`
                      : p.sizeLayout?.builtUpArea
                      ? `${p.sizeLayout.builtUpArea.toLocaleString("en-IN")} ${p.sizeLayout.areaUnit}`
                      : null,
                  },
                  {
                    icon: BedDouble,
                    label: "Bedrooms",
                    value: p.sizeLayout?.bedrooms ? `${p.sizeLayout.bedrooms} BHK` : p.specifications?.bhkConfig ?? null,
                  },
                  {
                    icon: Bath,
                    label: "Bathrooms",
                    value: p.sizeLayout?.bathrooms ? `${p.sizeLayout.bathrooms} Baths` : null,
                  },
                  {
                    icon: Car,
                    label: "Parking",
                    value: (p.specifications?.propertyType === "Plot" || p.specifications?.propertyType === "Agricultural Land")
                      ? null
                      : p.sizeLayout?.parkingAvailable
                        ? `${p.sizeLayout.parkingSlots ?? 1} ${p.sizeLayout.parkingType ?? "Parking"}`
                        : "No Parking",
                  },
                ]
                  .filter((s) => s.value)
                  .map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <div key={spec.label} className="bg-card border border-border rounded-xl p-4">
                        <Icon className="w-4 h-4 text-primary mb-2" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{spec.label}</p>
                        <p className="text-sm font-medium text-foreground">{spec.value}</p>
                      </div>
                    );
                  })}
              </div>

              {/* Full specifications table */}
              <div>
                <h2 className="mb-5 font-serif text-2xl font-medium text-foreground">Specifications</h2>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {[
                        ["Developer", p.developerName],
                        ["Project Area", p.sizeLayout?.plotDimensions],
                        ["Property Type", p.specifications?.propertyType],
                        ["Transaction", p.specifications?.transactionType],
                        ["Configuration", p.specifications?.bhkConfig],
                        ["Furnishing", p.specifications?.furnishingStatus],
                        ["Possession", p.specifications?.possessionStatus],
                        ["Property Age", p.specifications?.propertyAge],
                        ["Facing Direction", p.specifications?.facingDirection],
                        ["Floor", p.specifications?.floorNumber],
                        ["Total Floors", p.specifications?.totalFloors],
                        ["Ownership", p.legalInfo?.ownershipType],
                        ["Zoning", p.legalInfo?.zoningType],
                        ["Title Clearance", p.legalInfo?.titleClearance],
                        ["OC Status", p.legalInfo?.occupancyCertificate],
                        ["GST Applicable", p.financials?.gstApplicable ? "Yes (Under Construction)" : "No (Ready to Move)"],
                        ["Approved Banks", p.financials?.approvedBanks?.join(", ")],
                        ["Stamp Duty (Approx)", p.financials?.stampDutyPercent ? `${p.financials.stampDutyPercent}%` : "As per state (~7%)"],
                      ]
                        .filter(([, v]) => v)
                        .map(([label, value], i, arr) => (
                          <tr key={label} className={i < arr.length - 1 ? "border-b border-border" : ""}>
                            <td className="w-[45%] px-5 py-3.5 text-sm text-muted-foreground">{label}</td>
                            <td className={`px-5 py-3.5 text-sm font-medium ${label === "RERA ID" ? "text-secondary" : "text-foreground"}`}>
                              {value}
                            </td>
                          </tr>
                        ))}
                      {p.legalInfo?.reraId && (
                        <tr>
                          <td className="px-5 py-3.5 text-sm text-muted-foreground">RERA Registration</td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-1.5 text-sm text-secondary font-medium">
                              <BadgeCheck className="w-4 h-4" /> {p.legalInfo.reraId}
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Amenities */}
              {p.features?.amenities && p.features.amenities.length > 0 && (
                <div>
                  <h2 className="mb-5 font-serif text-2xl font-medium text-foreground">Amenities</h2>
                  <div className="flex flex-wrap gap-2.5">
                    {p.features.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-primary bg-primary/8 border border-primary/20 px-3.5 py-2 rounded-xl"
                      >
                        <AmenityIcon amenity={amenity} className="h-3.5 w-3.5 flex-shrink-0" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor plans */}
              {floorplans.length > 0 && (
                <div>
                  <h2 className="mb-5 font-serif text-2xl font-medium text-foreground">Floor Plans</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {floorplans.map((fp, i) => (
                      <div key={i} className="relative aspect-[4/3] bg-card border border-border rounded-xl overflow-hidden">
                        <Image
                          src={fp.url}
                          alt={fp.caption ?? `Floor plan ${i + 1}`}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unitPlans.length > 0 && (
                <div>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl font-medium text-foreground">
                        Unit Plans
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Compare available layouts, planning notes, and pricing
                        cues for this project.
                      </p>
                    </div>
                    {site && (
                      <Link
                        href={`/sites/${site.siteSlug}#unit-plans`}
                        className="text-sm text-primary hover:text-primary-light"
                      >
                        Open microsite view
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {unitPlans.map((plan) => (
                      <div
                        key={`${plan.name}-${plan.priceLabel ?? "plan"}`}
                        className="rounded-2xl border border-border bg-card p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-serif text-xl font-medium text-foreground">
                              {plan.name}
                            </h3>
                            <p className="mt-1 text-sm text-primary">
                              {plan.bhkLabel || p.specifications?.bhkConfig || "Smart layout"}
                            </p>
                          </div>
                          {plan.priceLabel && (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                              {plan.priceLabel}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                          {plan.carpetArea && (
                            <div className="rounded-xl border border-border bg-background px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide">Carpet Area</p>
                              <p className="mt-1 font-medium text-foreground">
                                {plan.carpetArea} {p.sizeLayout?.areaUnit}
                              </p>
                            </div>
                          )}
                          {plan.superBuiltUpArea && (
                            <div className="rounded-xl border border-border bg-background px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide">Super Built-up</p>
                              <p className="mt-1 font-medium text-foreground">
                                {plan.superBuiltUpArea} {p.sizeLayout?.areaUnit}
                              </p>
                            </div>
                          )}
                          {plan.availability && (
                            <div className="rounded-xl border border-border bg-background px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide">Availability</p>
                              <p className="mt-1 font-medium text-foreground">{plan.availability}</p>
                            </div>
                          )}
                          {plan.floorLabel && (
                            <div className="rounded-xl border border-border bg-background px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide">Floor</p>
                              <p className="mt-1 font-medium text-foreground">{plan.floorLabel}</p>
                            </div>
                          )}
                        </div>

                        {(plan.description || plan.facingDirection) && (
                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            {plan.description}
                            {plan.description && plan.facingDirection ? " " : ""}
                            {plan.facingDirection ? `Facing: ${plan.facingDirection}.` : ""}
                          </p>
                        )}

                        {(plan.floorplanUrl || plan.walkthroughUrl) && (
                          <div className="mt-4 flex flex-wrap gap-3">
                            {plan.floorplanUrl && (
                              <a
                                href={plan.floorplanUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-light"
                              >
                                View plan <ChevronRight className="h-4 w-4" />
                              </a>
                            )}
                            {plan.walkthroughUrl && (
                              <a
                                href={plan.walkthroughUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-light"
                              >
                                Open walkthrough <ChevronRight className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby places */}
              {Object.keys(nearbyByCategory).length > 0 && (
                <div>
                  <h2 className="mb-5 font-serif text-2xl font-medium text-foreground">Nearby Places</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(nearbyByCategory).map(([category, places]) => (
                      <div key={category} className="bg-card border border-border rounded-xl p-5">
                        <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">{category}</p>
                        <ul className="space-y-2">
                          {places.map((place, i) => (
                            <li key={i} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{place.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {place.distanceMinutes ? `${place.distanceMinutes} mins` : place.distanceKm ? `${place.distanceKm} km` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map placeholder */}
              {p.location?.coordinates && (
                <div>
                  <h2 className="mb-5 font-serif text-2xl font-medium text-foreground">Location</h2>
                  <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.location.address}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.location.city}, {p.location.state} – {p.location.pincode}</p>
                    </div>
                    {p.location.googleMapsUrl && (
                      <a
                        href={p.location.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-primary hover:text-primary-light border border-primary/20 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                      >
                        Open in Maps
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Enquiry form card */}
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-36">
                <h3 className="mb-5 font-serif text-lg font-medium text-foreground">
                  Enquire About This Property
                </h3>
                <EnquiryForm
                  propertyId={p._id}
                  propertyName={p.projectName ?? p.title}
                  propertySlug={p.slug}
                  variant="sidebar"
                />

                {/* Direct call CTA */}
                <div className="mt-5 pt-5 border-t border-border">
                  <a
                    href="tel:+918874625303"
                    className="flex items-center justify-center gap-2.5 w-full py-3 border border-border hover:border-primary/30 text-muted-foreground hover:text-primary rounded-xl text-sm font-medium transition-all"
                  >
                    <Phone className="w-4 h-4" /> +91 88746 25303
                  </a>
                </div>
              </div>

              {/* Brochure download */}
              {brochure && (
                <a
                  href={brochure.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 rounded-2xl text-sm font-medium transition-all"
                >
                  Download Brochure
                </a>
              )}

              {/* Compliance card */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Compliance</p>
                {p.legalInfo?.reraRegistered && p.legalInfo.reraId && (
                  <div className="flex items-center gap-2">
                    <ReraBadge reraId={p.legalInfo.reraId} size="sm" showId />
                  </div>
                )}
                {p.financials?.approvedBanks && p.financials.approvedBanks.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Bank Approved</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.financials.approvedBanks.slice(0, 4).map((bank) => (
                        <span key={bank} className="rounded-md bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">
                          {bank}
                        </span>
                        ))}
                      </div>
                    </div>
                )}
                {p.features?.isGatedCommunity && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary" /> Gated Community
                  </div>
                )}
                {p.features?.isVastuCompliant && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary" /> Vastu Compliant
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
