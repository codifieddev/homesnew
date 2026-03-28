"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SafeImage as Image } from "@/components/shared/SafeImage";
import { usePathname } from "next/navigation";
import {
  ChevronDown, Menu, X, MapPin,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import {
  useLocaleContext,
  useSiteTemplate,
  useTranslations,
} from "@/components/shared/LocaleProvider";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { localizeHref, stripLocaleFromPathname } from "@/lib/i18n/utils";
import { cn } from "@/lib/utils";

// ─── PROJECTS DATA ────────────────────────────────────────────────────────────

const PROJECTS = [
  { name: "Okas Enclave",          slug: "okas-enclave",          type: "Plots",     location: "Sushant Golf City" },
  { name: "Attalika Palms",        slug: "attalika-palms",        type: "Villas",    location: "Pursaini, Lucknow" },
  { name: "Stellar Okas Golf View",slug: "stellar-okas-golf-view",type: "Plots",     location: "Sushant Golf City" },
  { name: "Kailasha Enclave",      slug: "kailasha-enclave",      type: "Plots",     location: "Sultanpur Road" },
  { name: "Greenberry Signature",  slug: "greenberry-signature",  type: "Apartments",location: "Vrindavan Yojana" },
  { name: "Lavanya Enclave",       slug: "lavanya-enclave",       type: "Apts & Plots",location: "Amar Shaheed Path" },
  { name: "Vikas Vihar",           slug: "vikas-vihar",           type: "Mixed",     location: "Lucknow" },
];

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/blogs", key: "blogs" },
  { href: "/contact", key: "contact" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const normalizedPathname = stripLocaleFromPathname(pathname);
  const { locale } = useLocaleContext();
  const siteTemplate = useSiteTemplate();
  const tNav = useTranslations("public-nav");
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropdownRef                        = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "surface-card border-b border-border/80 backdrop-blur-2xl"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href={localizeHref(locale, "/")} className="flex items-center flex-shrink-0">
            <Image
              src="/homes/Homes-Logo.webp"
              alt="Homes Logo"
              width={140}
              height={44}
              className="h-auto w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={localizeHref(locale, link.href)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition-colors",
                  normalizedPathname === link.href
                    ? "surface-subtle text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                )}
              >
                {tNav(`links.${link.key}`)}
              </Link>
            ))}

            {/* Projects dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-colors",
                  normalizedPathname.startsWith("/projects")
                    ? "surface-subtle text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                )}
              >
                {tNav("projects.menuLabel")}
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="surface-card absolute top-full left-1/2 mt-2 w-[340px] -translate-x-1/2 overflow-hidden rounded-[1.75rem]">
                  <div className="p-2">
                    {PROJECTS.map((project) => (
                      <Link
                        key={project.slug}
                        href={localizeHref(locale, `/projects/${project.slug}`)}
                        onClick={() => setDropdownOpen(false)}
                        className="interactive-card flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors group hover:bg-accent/80"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary-light transition-colors truncate">
                            {project.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-md">
                              {project.type}
                            </span>
                            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                              <MapPin className="w-2.5 h-2.5" /> {project.location}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border p-2">
                    <Link
                      href={localizeHref(locale, "/projects")}
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary-light"
                    >
                      {tNav("projects.viewAll")} →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {NAV_LINKS.slice(2).map((link) => (
              <Link
                key={link.href}
                href={localizeHref(locale, link.href)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition-colors",
                  normalizedPathname === link.href
                    ? "surface-subtle text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                )}
              >
                {tNav(`links.${link.key}`)}
              </Link>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden lg:inline-flex" />
            <ThemeToggle className="hidden lg:inline-flex" />
            <Link
              href={localizeHref(locale, "/#enquire")}
              className={cn(
                "primary-cta hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold sm:flex",
                siteTemplate === "immersive" && "animate-pulse-slow"
              )}
            >
              {tNav("cta.bookSiteVisit")}
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="secondary-cta lg:hidden rounded-xl p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background/96 pt-16 backdrop-blur-2xl">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            <div className="flex items-center gap-3 px-4 pb-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={localizeHref(locale, link.href)}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {tNav(`links.${link.key}`)}
              </Link>
            ))}
            <div className="pt-2">
              <p className="mb-2 px-4 text-xs uppercase tracking-widest text-muted-foreground">
                {tNav("mobile.projects")}
              </p>
              {PROJECTS.map((p) => (
                <Link
                  key={p.slug}
                  href={localizeHref(locale, `/projects/${p.slug}`)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-border">
            <Link
              href={localizeHref(locale, "/#enquire")}
              className="primary-cta flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold"
            >
              {tNav("cta.bookSiteVisit")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
