import { BadgeCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReraBadgeProps {
  reraId?: string;
  size?: "sm" | "md" | "lg";
  showId?: boolean;
  className?: string;
}

export function ReraBadge({
  reraId,
  size = "md",
  showId = false,
  className,
}: ReraBadgeProps) {
  if (!reraId) return null;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const iconSizes = { sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-4 h-4" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        "border border-secondary/20 bg-secondary/10 text-secondary",
        sizeClasses[size],
        className
      )}
    >
      <BadgeCheck className={iconSizes[size]} />
      {showId ? `RERA: ${reraId}` : "RERA Verified"}
    </span>
  );
}

export function LdaBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary", className)}>
      <ShieldCheck className="w-3 h-3" /> LDA Approved
    </span>
  );
}
