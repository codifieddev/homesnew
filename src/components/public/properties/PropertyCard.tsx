"use client";

import Link from "next/link";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { MapPin, Maximize2, Star } from "lucide-react";
import {
  useLocaleContext,
  useSiteTemplate,
  useTranslations,
} from "@/components/shared/LocaleProvider";
import { localizeHref } from "@/lib/i18n/utils";
import { ReraBadge } from "./ReraBadge";
import { formatINR } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { IProperty } from "@/types";

interface PropertyCardProps {
  property: IProperty;
  featured?: boolean;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  Plot:      "bg-primary/10 text-primary border-primary/20",
  Apartment: "bg-secondary/10 text-secondary border-secondary/20",
  Villa:     "bg-accent text-foreground border-border",
  default:   "bg-accent text-foreground border-border",
};

export function PropertyCard({ property, featured = false, className }: PropertyCardProps) {
  const { locale } = useLocaleContext();
  const siteTemplate = useSiteTemplate();
  const t = useTranslations("projects");
  const coverImage = property.mediaAssets?.find((m) => m.isCover && m.type === "image");
  const price = property.financials?.listedPrice;
  const pricePerSqft = property.financials?.pricePerSqft;
  const type = property.specifications?.propertyType;
  const typeStyle = TYPE_COLORS[type ?? ""] ?? TYPE_COLORS.default;

  const primaryArea =
    property.sizeLayout?.plotArea ??
    property.sizeLayout?.builtUpArea ??
    property.sizeLayout?.carpetArea;

  const areaUnit = property.sizeLayout?.areaUnit ?? "sqft";

  return (
    <Link
      href={localizeHref(locale, `/projects/${property.slug}`)}
      className={cn(
        "surface-card interactive-card group block overflow-hidden rounded-[1.6rem]",
        siteTemplate === "immersive" ? "backdrop-blur-xl" : "",
        className
      )}
    >
      {/* Image */}
      <div className={cn("relative overflow-hidden bg-muted", featured ? "h-64" : "h-52")}>
        {coverImage?.url ? (
          <Image
            src={coverImage.url}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          /* Placeholder pattern */
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, hsl(var(--primary-light)) 0, hsl(var(--primary-light)) 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-[#0B1521]/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {property.legalInfo?.reraRegistered && (
            <ReraBadge reraId={property.legalInfo.reraId} size="sm" />
          )}
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", typeStyle)}>
            {type}
          </span>
          {property.isFeatured && (
            <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
              <Star className="w-2.5 h-2.5 fill-primary" /> {t("card.featured")}
            </span>
          )}
        </div>

        {/* Price tag */}
        {price && (
          <div className="secondary-cta absolute bottom-3 right-3 rounded-xl px-2.5 py-1.5 text-right">
            <p className="text-[9px] text-muted-foreground leading-none mb-0.5">{t("card.startingFrom")}</p>
            <p className="text-sm font-semibold text-primary leading-none">{formatINR(price)}</p>
            {pricePerSqft && (
              <p className="text-[9px] text-muted-foreground mt-0.5">₹{pricePerSqft.toLocaleString("en-IN")}/sqft</p>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-xs text-muted-foreground mb-1">{property.developerName}</p>
        <h3 className={cn(
          "font-serif font-medium text-foreground mb-2 group-hover:text-primary-light transition-colors line-clamp-2",
          featured ? "text-xl" : "text-lg"
        )}>
          {property.projectName ?? property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
          <span className="truncate">{property.location?.locality}, {property.location?.city}</span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          {property.specifications?.possessionStatus && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("card.possession")}</p>
              <p className="text-xs font-medium text-muted-foreground">{property.specifications.possessionStatus}</p>
            </div>
          )}
          {primaryArea && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("card.area")}</p>
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                {primaryArea.toLocaleString("en-IN")} {areaUnit}
              </p>
            </div>
          )}
          {property.specifications?.bhkConfig && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("card.config")}</p>
              <p className="text-xs font-medium text-muted-foreground">{property.specifications.bhkConfig}</p>
            </div>
          )}
          {property.specifications?.transactionType && (
            <div className="ml-auto">
              <span className="text-[10px] text-muted-foreground bg-accent px-2 py-1 rounded-md">
                {property.specifications.transactionType}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
