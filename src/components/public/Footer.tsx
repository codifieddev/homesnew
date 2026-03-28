import Link from "next/link";
import { Building2, Phone, Mail, MapPin } from "lucide-react";
import { getServerI18n } from "@/lib/i18n/server";
import { getRequestLocale } from "@/lib/i18n/request";
import { localizeHref } from "@/lib/i18n/utils";

const PROJECTS = [
  { name: "Okas Enclave",           slug: "okas-enclave" },
  { name: "Attalika Palms",         slug: "attalika-palms" },
  { name: "Stellar Okas Golf View", slug: "stellar-okas-golf-view" },
  { name: "Kailasha Enclave",       slug: "kailasha-enclave" },
  { name: "Greenberry Signature",   slug: "greenberry-signature" },
  { name: "Lavanya Enclave",        slug: "lavanya-enclave" },
  { name: "Vikas Vihar",            slug: "vikas-vihar" },
];

const SERVICES = [
  "Buy Property",
  "Schedule Site Visit",
  "Home Loan Advisory",
  "Investment Consulting",
  "RERA Compliance",
];

export async function Footer() {
  const [{ t }, locale] = await Promise.all([getServerI18n(), getRequestLocale()]);

  return (
    <footer className="surface-card border-t border-border/80 bg-card/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={localizeHref(locale, "/")} className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-semibold text-foreground">
                Homes<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Premium real estate advisory connecting buyers with RERA-verified properties across Lucknow and Uttar Pradesh.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <a href="tel:+918874625303" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" /> +91 88746 25303
              </a>
              <a href="mailto:info@homes.in" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" /> info@homes.in
              </a>
              <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Royal Plaza, Sushant Golf City,<br />Sultanpur Road, Lucknow – 226030</span>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-xs text-primary uppercase tracking-widest font-medium mb-5">
              {t("public-nav", "links.projects")}
            </h3>
            <ul className="space-y-3">
              {PROJECTS.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={localizeHref(locale, `/projects/${p.slug}`)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs text-primary uppercase tracking-widest font-medium mb-5">
              {t("public-nav", "links.services")}
            </h3>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s}>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Compliance */}
          <div>
            <h3 className="text-xs text-primary uppercase tracking-widest font-medium mb-5">
              {t("public-nav", "links.companies")}
            </h3>
            <ul className="space-y-3 mb-8">
              {["About Us", "Our Team", "Blogs & Insights", "Contact Us"].map((item) => (
                <li key={item}>
                  <Link href={localizeHref(locale, item === "About Us" ? "/about" : item === "Contact Us" ? "/contact" : item === "Blogs & Insights" ? "/blogs" : "/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-xs text-primary uppercase tracking-widest font-medium mb-4">
              Compliance
            </h3>
            <ul className="space-y-2">
              {["UP-RERA Registered", "GST Compliant", "LDA Approved Projects", "SBI Approved"].map((c) => (
                <li key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-primary/70" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Homes. All rights reserved. A premium real estate advisory platform.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "RERA Disclaimer"].map((link) => (
              <Link key={link} href={localizeHref(locale, "/")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
