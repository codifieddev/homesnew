"use client";

import Link from "next/link";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Home,
  Users2,
  CalendarCheck,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronRight,
  BriefcaseBusiness,
  FileText,
  Globe2,
} from "lucide-react";
import {
  useLocaleContext,
  useTranslations,
} from "@/components/shared/LocaleProvider";
import { localizeHref, stripLocaleFromPathname } from "@/lib/i18n/utils";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "overview",
    href: "/admin",
    icon: LayoutDashboard,
    allowedRoles: ["super_admin", "admin", "agent", "company_manager"],
  },
  {
    labelKey: "properties",
    href: "/admin/properties",
    icon: Home,
    allowedRoles: ["super_admin", "admin", "agent", "company_manager"],
  },
  {
    labelKey: "enquiries",
    href: "/admin/enquiries",
    icon: MessageSquare,
    allowedRoles: ["super_admin", "admin", "agent", "company_manager"],
  },
  {
    labelKey: "leads",
    href: "/admin/leads",
    icon: Users2,
    allowedRoles: ["super_admin", "admin", "agent", "company_manager"],
  },
  {
    labelKey: "siteVisits",
    href: "/admin/site-visits",
    icon: CalendarCheck,
    allowedRoles: ["super_admin", "admin", "agent", "company_manager"],
  },
  {
    labelKey: "companies",
    href: "/admin/companies",
    icon: BriefcaseBusiness,
    allowedRoles: ["super_admin", "admin", "company_manager"],
  },
  {
    labelKey: "caseStudies",
    href: "/admin/case-studies",
    icon: FileText,
    allowedRoles: ["super_admin", "admin", "company_manager"],
  },
  {
    labelKey: "microsites",
    href: "/admin/property-sites",
    icon: Globe2,
    allowedRoles: ["super_admin", "admin", "company_manager"],
  },
  {
    labelKey: "analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    allowedRoles: ["super_admin", "admin"],
  },
  {
    labelKey: "settings",
    href: "/admin/settings",
    icon: Settings,
    allowedRoles: ["super_admin"],
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface DashboardSidebarProps {
  role: UserRole;
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const normalizedPathname = stripLocaleFromPathname(pathname);
  const { locale } = useLocaleContext();
  const t = useTranslations("admin-nav");

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.allowedRoles.includes(role)
  );

  return (
    <aside className="surface-card w-60 min-h-screen border-r border-border/70 flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-border">
        <Link href={localizeHref(locale, "/admin")} className="block w-36 h-auto relative">
          <Image
            src="/homes/Homes-Logo.webp"
            alt="Homes Logo"
            width={160}
            height={50}
            className="h-auto w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Section label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          {t("sidebar.mainMenu")}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          // Active if exact match for /admin, or starts-with for sub-routes
          const isActive =
            item.href === "/admin"
              ? normalizedPathname === "/admin"
              : normalizedPathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={localizeHref(locale, item.href)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "surface-subtle text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{t(`sidebar.${item.labelKey}`)}</span>
              {item.badge && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <ChevronRight className="w-3 h-3 text-primary opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — view public site */}
      <div className="p-3 border-t border-border">
        <Link
          href={localizeHref(locale, "/")}
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-accent/70 hover:text-foreground"
        >
          <Building2 className="w-4 h-4" />
          <span>{t("sidebar.viewPublicSite")}</span>
        </Link>
      </div>
    </aside>
  );
}
