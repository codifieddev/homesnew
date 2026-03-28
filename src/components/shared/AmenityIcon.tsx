"use client";

import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  ArrowUpDown,
  Building2,
  Camera,
  CircleParking,
  CloudRain,
  Cpu,
  Dog,
  Droplets,
  Dumbbell,
  Flower2,
  Footprints,
  House,
  Leaf,
  LibraryBig,
  Phone,
  PlugZap,
  ShieldCheck,
  ShoppingCart,
  Store,
  ToyBrick,
  Trees,
  Trophy,
  Waves,
  Wifi,
  Zap,
} from "lucide-react";
import {
  AMENITY_ICON_MAP,
  type RealEstateIconKey,
} from "@/lib/utils/constants";

const ICONS: Record<RealEstateIconKey, LucideIcon> = {
  Accessibility,
  ArrowUpDown,
  Building2,
  Camera,
  CircleParking,
  CloudRain,
  Cpu,
  Dog,
  Droplets,
  Dumbbell,
  Flower2,
  Footprints,
  House,
  Leaf,
  LibraryBig,
  Phone,
  PlugZap,
  ShieldCheck,
  ShoppingCart,
  Store,
  ToyBrick,
  Trees,
  Trophy,
  Waves,
  Wifi,
  Zap,
};

export function AmenityIcon({
  amenity,
  className,
}: {
  amenity: string;
  className?: string;
}) {
  const iconKey = AMENITY_ICON_MAP[amenity as keyof typeof AMENITY_ICON_MAP] ?? "Building2";
  const Icon = ICONS[iconKey];

  return <Icon className={className} aria-hidden="true" />;
}
