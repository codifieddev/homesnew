import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Phone,
} from "lucide-react";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { PropertyGallery } from "@/components/public/properties/PropertyGallery";
import { AmenityIcon } from "@/components/shared/AmenityIcon";
import { formatINR } from "@/lib/utils/constants";
import type { ICompany, IProperty, IPropertySite } from "@/types";

const HERO_STYLES: Record<string, string> = {
  signature_navy:
    "bg-[radial-gradient(circle_at_top_left,rgba(41,194,242,0.18),transparent_38%),linear-gradient(135deg,rgba(20,41,102,0.98),rgba(10,18,46,0.98))]",
  cyan_horizon:
    "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_35%),linear-gradient(135deg,rgba(41,194,242,0.95),rgba(20,41,102,0.98))]",
  graphite_reserve:
    "bg-[radial-gradient(circle_at_top_left,rgba(41,194,242,0.12),transparent_35%),linear-gradient(135deg,rgba(63,64,63,0.98),rgba(20,41,102,0.98))]",
};

interface PropertySiteLandingProps {
  site: IPropertySite;
  property: IProperty;
  company?: ICompany;
  preview?: boolean;
}

export function PropertySiteLanding({
  site,
  property,
  company,
  preview = false,
}: PropertySiteLandingProps) {
  const images = property.mediaAssets?.filter((asset) => asset.type === "image") ?? [];
  const brochure = property.mediaAssets?.find((asset) => asset.type === "brochure");
  const virtualTour = property.mediaAssets?.find((asset) => asset.type === "virtual_tour");
  const enabledSections = [...(site.sections ?? [])]
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
  const navigation = site.navigation?.filter((item) => item.enabled) ?? [];

  const primaryContact = {
    phone: site.contact?.phone || company?.contact?.phone,
    email: site.contact?.email || company?.contact?.email,
    whatsapp: site.contact?.whatsapp || company?.contact?.whatsapp,
    address:
      site.contact?.officeAddress ||
      [company?.address?.line1, company?.address?.locality, company?.address?.city]
        .filter(Boolean)
        .join(", "),
    mapLink:
      site.contact?.mapLink ||
      company?.address?.mapLink ||
      property.location?.googleMapsUrl,
  };

  return (
    <div className="min-h-screen bg-background">
      {preview && (
        <div className="sticky top-16 z-40 border-b border-primary/20 bg-primary/10 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
            <div>
              <p className="font-medium text-foreground">
                Previewing microsite draft
              </p>
              <p className="text-xs text-muted-foreground">
                Status: {site.publishStatus.replace(/_/g, " ")}. This page is not
                public until published.
              </p>
            </div>
            <Link
              href={`/admin/property-sites/${site._id}/edit`}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Back to editor
            </Link>
          </div>
        </div>
      )}

      <section
        className={`relative overflow-hidden border-b border-white/10 text-white ${HERO_STYLES[site.themePreset]}`}
      >
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-white/70">
            <Link href="/" className="transition-colors hover:text-white">
              Homes
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/projects" className="transition-colors hover:text-white">
              Projects
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>{property.projectName ?? property.title}</span>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {property.legalInfo?.reraRegistered && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                    RERA Verified
                  </span>
                )}
                {company?.name && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/85">
                    {company.name}
                  </span>
                )}
              </div>
              <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
                {site.heroTitle || property.projectName || property.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
                {site.heroSubtitle || property.tagline || property.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#enquire"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#142966] transition-transform hover:-translate-y-0.5"
                >
                  {site.heroCtaLabel || "Book a Site Visit"}
                  <ArrowRight className="h-4 w-4" />
                </a>
                {brochure?.url && (
                  <a
                    href={brochure.url}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
                  >
                    {site.heroSecondaryCtaLabel || "Download Brochure"}
                  </a>
                )}
                {!brochure?.url && virtualTour?.url && (
                  <a
                    href={virtualTour.url}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
                  >
                    {site.heroSecondaryCtaLabel || "Open Virtual Tour"}
                  </a>
                )}
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  {
                    label: "Starting Price",
                    value: property.financials?.listedPrice
                      ? formatINR(property.financials.listedPrice)
                      : "On request",
                  },
                  {
                    label: "Property Type",
                    value: property.specifications?.propertyType || "Residential",
                  },
                  {
                    label: "Configuration",
                    value:
                      property.specifications?.bhkConfig ||
                      property.unitPlans?.[0]?.bhkLabel ||
                      "Mixed inventory",
                  },
                  {
                    label: "Location",
                    value: property.location?.locality || property.location?.city,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-white/60">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <MapPin className="h-4 w-4 text-[#29C2F2]" />
                {property.location?.address}, {property.location?.city}
              </div>
              {primaryContact.phone && (
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#29C2F2]"
                >
                  <Phone className="h-4 w-4" />
                  {primaryContact.phone}
                </a>
              )}
              <div className="mt-6 rounded-3xl bg-white p-5 text-foreground">
                <h2 className="font-serif text-2xl font-medium">
                  Get the property deck
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Enquire once and the Homes team will route your request into
                  the shared CRM with this microsite tagged as the source.
                </p>
                <div className="mt-5">
                  <EnquiryForm
                    propertyId={property._id}
                    propertyName={property.projectName ?? property.title}
                    propertySlug={property.slug}
                    companyId={company?._id || property.companyId}
                    propertySiteId={site._id}
                    pageContext="property_site"
                    tracking={site.tracking}
                    variant="inline"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {navigation.length > 0 && (
        <nav className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-3 text-sm sm:px-6 lg:px-8">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
        {enabledSections.some((section) => section.id === "overview") && (
          <section id="overview" className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-7 bg-primary" />
                <span className="text-xs font-medium uppercase tracking-widest text-primary">
                  Overview
                </span>
              </div>
              <h2 className="font-serif text-3xl font-medium text-foreground">
                {property.projectName ?? property.title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="space-y-4">
                {[
                  ["Developer", company?.name || property.developerName],
                  ["Possession", property.specifications?.possessionStatus],
                  ["Configuration", property.specifications?.bhkConfig],
                  [
                    "Area",
                    property.sizeLayout?.builtUpArea
                      ? `${property.sizeLayout.builtUpArea} ${property.sizeLayout.areaUnit}`
                      : property.sizeLayout?.plotArea
                        ? `${property.sizeLayout.plotArea} ${property.sizeLayout.areaUnit}`
                        : undefined,
                  ],
                  ["RERA ID", property.legalInfo?.reraId],
                  ["Address", property.location?.address],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
                    >
                      <span className="text-sm text-muted-foreground">
                        {label}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {enabledSections.some((section) => section.id === "gallery") &&
          images.length > 0 && (
            <section id="gallery" className="space-y-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-7 bg-primary" />
                <span className="text-xs font-medium uppercase tracking-widest text-primary">
                  Gallery
                </span>
              </div>
              <PropertyGallery
                images={images}
                projectName={property.projectName ?? property.title}
              />
            </section>
          )}

        {enabledSections.some((section) => section.id === "unit-plans") &&
          property.unitPlans &&
          property.unitPlans.length > 0 && (
            <section id="unit-plans" className="space-y-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-7 bg-primary" />
                <span className="text-xs font-medium uppercase tracking-widest text-primary">
                  Unit Plans
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {property.unitPlans.map((plan) => (
                  <div
                    key={`${plan.name}-${plan.priceLabel}`}
                    className="rounded-2xl border border-border bg-card p-6"
                  >
                    <h3 className="font-serif text-2xl font-medium text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-primary">
                      {plan.bhkLabel || "Smartly planned inventory"}
                    </p>
                    <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                      {plan.carpetArea && (
                        <div className="flex items-center justify-between">
                          <span>Carpet Area</span>
                          <span className="font-medium text-foreground">
                            {plan.carpetArea} {property.sizeLayout?.areaUnit}
                          </span>
                        </div>
                      )}
                      {plan.superBuiltUpArea && (
                        <div className="flex items-center justify-between">
                          <span>Super Built-up</span>
                          <span className="font-medium text-foreground">
                            {plan.superBuiltUpArea} {property.sizeLayout?.areaUnit}
                          </span>
                        </div>
                      )}
                      {plan.priceLabel && (
                        <div className="flex items-center justify-between">
                          <span>Price</span>
                          <span className="font-medium text-foreground">
                            {plan.priceLabel}
                          </span>
                        </div>
                      )}
                      {plan.availability && (
                        <div className="flex items-center justify-between">
                          <span>Availability</span>
                          <span className="font-medium text-foreground">
                            {plan.availability}
                          </span>
                        </div>
                      )}
                    </div>
                    {plan.description && (
                      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                        {plan.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        {enabledSections.some((section) => section.id === "amenities") &&
          property.features?.amenities?.length > 0 && (
            <section id="amenities" className="space-y-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-7 bg-primary" />
                <span className="text-xs font-medium uppercase tracking-widest text-primary">
                  Amenities
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {property.features.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <AmenityIcon amenity={amenity} className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

        {enabledSections.some((section) => section.id === "location") && (
          <section id="location" className="grid grid-cols-1 gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  Location
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {property.location?.address}, {property.location?.locality},{" "}
                {property.location?.city}
              </p>
              {primaryContact.mapLink && (
                <a
                  href={primaryContact.mapLink}
                  target="_blank"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-light"
                >
                  Open on Google Maps <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-5 flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  Nearby Highlights
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(property.nearbyPlaces ?? []).slice(0, 8).map((place) => (
                  <div
                    key={`${place.name}-${place.category}`}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {place.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {place.category}
                        {place.distanceMinutes
                          ? ` · ${place.distanceMinutes} mins`
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {enabledSections.some((section) => section.id === "enquire") && (
          <section
            id="enquire"
            className="rounded-[2rem] border border-border bg-card p-8 sm:p-10"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px w-7 bg-primary" />
                  <span className="text-xs font-medium uppercase tracking-widest text-primary">
                    Enquire
                  </span>
                </div>
                <h2 className="font-serif text-3xl font-medium text-foreground">
                  Speak to the Homes team about this property
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Every microsite enquiry lands in the shared Homes pipeline with
                  this page tagged as the source, so follow-ups remain unified
                  across listings, campaigns, and site visits.
                </p>
                {primaryContact.phone && (
                  <a
                    href={`tel:${primaryContact.phone}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-light"
                  >
                    <Phone className="h-4 w-4" /> {primaryContact.phone}
                  </a>
                )}
              </div>
              <div className="rounded-3xl border border-border bg-background p-5">
                <EnquiryForm
                  propertyId={property._id}
                  propertyName={property.projectName ?? property.title}
                  propertySlug={property.slug}
                  companyId={company?._id || property.companyId}
                  propertySiteId={site._id}
                  pageContext="property_site"
                  tracking={site.tracking}
                  variant="inline"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
