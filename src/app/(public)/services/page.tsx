import Link from "next/link";
import {
  Building2, CalendarCheck, BadgeCheck, FileText,
  TrendingUp, ShieldCheck, Phone, ArrowRight, CheckCircle,
} from "lucide-react";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services — Homes Real Estate Advisory",
  description:
    "From property search to loan advisory and legal documentation — Homes provides end-to-end real estate services across Lucknow and Uttar Pradesh.",
};

const SERVICES = [
  {
    icon: Building2,
    number: "01",
    title: "Buy Property",
    tagline: "Find your perfect verified property",
    description:
      "Browse our curated inventory of RERA-registered residential plots, premium villas, and modern apartments. Every listing includes full legal documentation, pricing transparency, and developer background — no hidden surprises.",
    features: [
      "RERA-verified listings only",
      "Transparent pricing with per-sqft breakdown",
      "Legal clearance and title verification",
      "Bank loan pre-approval status",
      "Virtual tours and floor plans available",
    ],
    cta: "Explore Listings",
    href: "/projects",
  },
  {
    icon: CalendarCheck,
    number: "02",
    title: "Site Visit Arrangement",
    tagline: "Hassle-free property walkthroughs",
    description:
      "Once you shortlist a property, we manage the entire site visit process — from scheduling at your convenience to arranging transport and escorting you through the property with a knowledgeable advisor.",
    features: [
      "Flexible scheduling — weekdays and weekends",
      "Agent escort and on-site guidance",
      "Multiple properties in a single visit",
      "Post-visit follow-up and comparison report",
      "No pressure, no commission push",
    ],
    cta: "Book a Visit",
    href: "/#enquire",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Home Loan Advisory",
    tagline: "Fair, unbiased financing guidance",
    description:
      "We work with leading banks — SBI, HDFC, ICICI, Axis, and PNB — to help you access the best home loan rates. Our advisors assist with documentation, eligibility checks, and fast-track approvals at zero upfront fee.",
    features: [
      "Multi-bank rate comparison",
      "Eligibility assessment and pre-approval",
      "Documentation checklist and support",
      "Approval tracking until disbursal",
      "Zero upfront advisory fee",
    ],
    cta: "Check Eligibility",
    href: "/#enquire",
  },
  {
    icon: FileText,
    number: "04",
    title: "Documentation Support",
    tagline: "From agreement to registration",
    description:
      "Real estate documentation can be complex and error-prone. Our team assists with agreement drafting, stamp duty calculation, registration appointment booking, and ensures every document is correctly filed.",
    features: [
      "Agreement to Sale drafting",
      "Stamp duty and registration fee calculation",
      "Sub-registrar appointment scheduling",
      "NOC and completion certificate assistance",
      "Post-registration mutation support",
    ],
    cta: "Get Help",
    href: "/#enquire",
  },
  {
    icon: ShieldCheck,
    number: "05",
    title: "Legal Due Diligence",
    tagline: "Know exactly what you're buying",
    description:
      "Before you commit, we conduct a structured legal review — title clearance verification, encumbrance check, RERA portal cross-referencing, and society registration status — so you invest with complete confidence.",
    features: [
      "Title clearance and encumbrance check",
      "RERA portal verification",
      "Litigation history review",
      "Land use and zoning confirmation",
      "Written due diligence summary",
    ],
    cta: "Request Review",
    href: "/#enquire",
  },
  {
    icon: BadgeCheck,
    number: "06",
    title: "Investment Advisory",
    tagline: "Maximise returns in Lucknow real estate",
    description:
      "Whether you're a first-time buyer or an experienced investor, we provide data-backed recommendations on micro-markets, appreciation corridors, and rental yield opportunities across Lucknow's growth zones.",
    features: [
      "Micro-market analysis",
      "Appreciation potential assessment",
      "Rental yield projections",
      "Portfolio diversification guidance",
      "Long-term vs short-term investment strategy",
    ],
    cta: "Discuss Strategy",
    href: "/#enquire",
  },
];

const PROCESS = [
  { num: "1", title: "Initial Consultation",   desc: "Share your requirements, budget, and timeline. We listen before we recommend." },
  { num: "2", title: "Property Shortlisting",  desc: "Receive a curated list of verified properties matching your exact criteria." },
  { num: "3", title: "Site Visit",             desc: "We arrange and escort you through your shortlisted properties." },
  { num: "4", title: "Due Diligence",          desc: "Full legal and financial review before you make any commitment." },
  { num: "5", title: "Negotiation & Booking",  desc: "We negotiate on your behalf and handle the booking formalities." },
  { num: "6", title: "Registration & Handover",desc: "Documentation support through to key handover and post-sale follow-up." },
];

export default function ServicesPage() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {/* Hero */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">What We Offer</span>
          </div>
          <h1 className="mb-6 font-serif text-5xl font-medium leading-tight text-foreground sm:text-6xl">
            End-to-End Advisory,<br />
            <span className="text-secondary italic">Zero Guesswork</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            From the first property shortlist to the final registration — Homes manages every step of your real estate journey with full transparency and zero commission pressure.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.number}
                className="relative group bg-card border border-border hover:border-primary/25 rounded-2xl p-7 transition-all duration-300 flex flex-col"
              >
                {/* Top hover accent */}
                <div className="absolute top-0 left-6 right-6 h-px bg-primary/0 group-hover:bg-primary/40 transition-all duration-500 rounded-full" />

                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{service.number}</span>
                </div>

                <h3 className="mb-1 font-serif text-xl font-medium text-foreground">{service.title}</h3>
                <p className="text-xs text-primary mb-3 font-medium">{service.tagline}</p>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-secondary" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href={service.href}
                  className="flex items-center gap-2 text-sm text-primary group-hover:text-primary-light transition-colors font-medium mt-auto"
                >
                  {service.cta}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Process timeline */}
        <div>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-7 h-px bg-primary" />
              <span className="text-xs text-primary uppercase tracking-widest font-medium">Our Process</span>
              <div className="w-7 h-px bg-primary" />
            </div>
            <h2 className="mb-3 font-serif text-4xl font-medium text-foreground">
              How We Work Together
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              A clear, structured approach that keeps you informed at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROCESS.map((step, i) => (
              <div key={step.num} className="relative bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-serif text-sm font-medium text-primary">
                    {step.num}
                  </span>
                  {i < PROCESS.length - 1 && (
                    <div className="hidden h-px flex-1 bg-border sm:block" />
                  )}
                </div>
                <p className="mb-2 text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why us strip */}
        <div className="bg-primary rounded-2xl p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { num: "Zero",   label: "Upfront Advisory Fee",   sub: "We earn when you close, not before." },
              { num: "100%",   label: "RERA Verified Projects",  sub: "Every listing is compliant." },
              { num: "48 hrs", label: "Average Response Time",   sub: "We don't keep you waiting." },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-serif text-4xl font-semibold text-foreground mb-1">{item.num}</p>
                <p className="text-sm font-semibold text-foreground mb-1">{item.label}</p>
                <p className="text-xs text-foreground/60">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA form */}
        <div id="enquire" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start scroll-mt-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-px bg-primary" />
              <span className="text-xs text-primary uppercase tracking-widest font-medium">Get Started</span>
            </div>
            <h2 className="mb-5 font-serif text-4xl font-medium text-foreground">
              Ready to Begin Your Property Journey?
            </h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Tell us what you need. An advisor will call you within a few hours to discuss your requirements and suggest the best way forward.
            </p>
            <div className="space-y-4">
              {[
                { icon: Phone,     label: "Direct Line", value: "+91 88746 25303", href: "tel:+918874625303" },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <a key={c.label} href={c.href} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{c.label}</p>
                      <p className="text-sm font-medium text-foreground">{c.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="mb-6 font-serif text-xl font-medium text-foreground">Send an Enquiry</h3>
            <EnquiryForm variant="inline" />
          </div>
        </div>
      </div>
    </div>
  );
}
