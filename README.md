# Homes — Enterprise Real Estate Advisory Platform

> Full-stack, production-grade real estate platform — public property portal + internal CRM. White-label architecture adaptable for any real estate business.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Decisions](#architecture-decisions)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Database Schema Design](#database-schema-design)
- [Server Actions Reference](#server-actions-reference)
- [Public Portal Pages](#public-portal-pages)
- [CRM Dashboard Modules](#crm-dashboard-modules)
- [Known Fixes Applied](#known-fixes-applied)
- [Development Phases](#development-phases)
- [Environment Setup](#environment-setup)
- [Design System](#design-system)
- [Current Project Status](#current-project-status)

---

## Project Overview

**Homes** is a white-label real estate SaaS platform. One codebase, one database — any real estate consultancy runs their entire business on it.

It now supports:
- clean default English URLs with locale-prefixed alternate languages
- a repo-managed translation system for English and Hindi, with Croatian and Arabic scaffolded
- a two-mode presentation layer: `classic` and `immersive`
- Playwright regression coverage for routing, auth, and core public/admin smoke paths

| Interface | Audience | Purpose |
|---|---|---|
| Public Portal | Buyers, investors | RERA-verified listings, enquire, book site visits |
| Admin Dashboard | Agents, admins | Manage properties, track leads, manage enquiries, analytics |

Immediate client: **Lucknow Homes** (Lucknow, UP).

---

## Architecture Decisions

### Auth Split (Edge + Node)

```
src/lib/auth/
├── auth.config.ts        → Edge-safe (callbacks, pages only)
├── middleware-auth.ts    → NextAuth instance for proxy.ts
└── config.ts             → Full NextAuth (Node — DB + bcrypt)
```

`proxy.ts` (route guard) uses `middleware-auth.ts`.
All Server Actions use the full `config.ts` via `auth()`.

### Rendering Strategy

| Route | Strategy | Reason |
|---|---|---|
| `/` | SSG | Static homepage |
| `/projects` | SSR | Live filter + count |
| `/projects/[slug]` | ISR (generateStaticParams) | Pre-rendered + revalidated |
| `/admin/*` | SSR | Always fresh, auth-protected |
| `/sitemap.xml` | Dynamic | Includes all active slugs |

### Localization + Template Strategy

| Concern | Decision |
|---|---|
| Default locale | English with clean URLs (`/about`, not `/en/about`) |
| Alternate locales | Prefixed (`/hi/about`, `/hr/about`, `/ar/about`) |
| Translation source | JSON catalogs under `src/locales/<locale>/<namespace>.json` |
| Locale persistence | `homes-locale` cookie + proxy header forwarding |
| Presentation modes | `classic` for restrained UI, `immersive` for glass + motion experience |
| Admin editing | Locale configuration is managed in settings; translation text stays file-based in v1 |

### RBAC Matrix

| Route | super_admin | admin | company_manager | agent |
|---|---|---|---|---|
| `/admin` overview | ✅ | ✅ | ✅ scoped | ✅ |
| Properties CRUD | ✅ | ✅ | ✅ scoped | 👁 View |
| Companies / Case Studies / Microsites | ✅ | ✅ | ✅ scoped | ❌ |
| Enquiries / Leads / Visits | ✅ | ✅ | ✅ scoped | ✅ |
| Analytics | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

---

## Technology Stack

| Category | Tech | Notes |
|---|---|---|
| Framework | Next.js 16 App Router | SSR, SSG, ISR, Server Actions |
| Language | TypeScript 5+ | End-to-end types |
| Database | MongoDB Atlas | Flexible schema |
| ODM | Mongoose 9+ | Property, CRM, company, case-study, and microsite schemas |
| Styling | Tailwind CSS v4 | Semantic light/dark tokens in `globals.css` |
| Components | ShadCN UI (Nova/Zinc) | Admin UI |
| Auth | NextAuth v5 | JWT, edge-split config |
| Forms | React Hook Form + Zod | Client + server validation |
| Charts | Recharts | Analytics — BarChart, PieChart, FunnelChart |
| Icons | Lucide React | |
| Notifications | Sonner | Toast system |
| Localization | Custom App Router i18n layer | Locale-aware proxy, JSON dictionaries, clean default URLs |
| Motion / UX | Framer Motion | Ambient motion, reveal primitives, hover polish, reduced-motion support |
| QA | Playwright | Route, auth, locale, and smoke regression coverage |

---

## Folder Structure

```
homes/
├── src/
│   ├── app/
│   │   ├── (public)/                    ✅ Public portal
│   │   │   ├── layout.tsx               ✅ Navbar + Footer
│   │   │   ├── page.tsx                 ✅ Homepage (SSG)
│   │   │   ├── about/page.tsx           ✅ About + team
│   │   │   ├── contact/page.tsx         ✅ Contact form
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx             ✅ Company profiles index
│   │   │   │   └── [slug]/page.tsx      ✅ Company profile page
│   │   │   ├── case-studies/
│   │   │   │   ├── page.tsx             ✅ Public case studies index
│   │   │   │   └── [slug]/page.tsx      ✅ Case study detail page
│   │   │   ├── sites/
│   │   │   │   └── [siteSlug]/page.tsx  ✅ Property microsite landing page
│   │   │   └── projects/
│   │   │       ├── page.tsx             ✅ All projects (SSR)
│   │   │       └── [slug]/page.tsx      ✅ Detail page (ISR)
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx               ✅ Auth shell
│   │   │   ├── page.tsx                 ✅ Live stats overview
│   │   │   ├── analytics/page.tsx       ✅ Recharts dashboard
│   │   │   ├── enquiries/page.tsx       ✅ Enquiry inbox
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx             ✅ Kanban pipeline
│   │   │   │   ├── new/page.tsx         ✅ Manual lead creation
│   │   │   │   └── [id]/page.tsx        ✅ Lead detail
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx             ✅ Company admin list
│   │   │   │   ├── new/page.tsx         ✅ Create company
│   │   │   │   └── [id]/edit/page.tsx   ✅ Edit company
│   │   │   ├── case-studies/
│   │   │   │   ├── page.tsx             ✅ Case-study admin list
│   │   │   │   ├── new/page.tsx         ✅ Create case study
│   │   │   │   └── [id]/edit/page.tsx   ✅ Edit case study
│   │   │   ├── property-sites/
│   │   │   │   ├── page.tsx             ✅ Microsite admin list
│   │   │   │   ├── new/page.tsx         ✅ Create microsite
│   │   │   │   └── [id]/edit/page.tsx   ✅ Edit microsite
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx             ✅ Property table
│   │   │   │   ├── new/page.tsx         ✅ Add property form
│   │   │   │   └── [id]/edit/page.tsx   ✅ Edit property form
│   │   │   └── site-visits/page.tsx     ✅ Site visits list
│   │   │
│   │   ├── auth/login/page.tsx          ✅ (Suspense-wrapped)
│   │   ├── api/auth/[...nextauth]/      ✅
│   │   ├── sitemap.ts                   ✅ Dynamic sitemap
│   │   ├── robots.ts                    ✅ robots.txt
│   │   ├── globals.css                  ✅ Tailwind v4 theme
│   │   └── layout.tsx                   ✅ Root layout
│   │
│   ├── components/
│   │   ├── ui/                          ShadCN
│   │   ├── public/
│   │   │   ├── navigation/Navbar.tsx    ✅ Sticky + mobile menu
│   │   │   ├── hero/HeroSearch.tsx      ✅ 3-field search bar
│   │   │   ├── properties/
│   │   │   │   ├── PropertyCard.tsx     ✅
│   │   │   │   ├── PropertyGallery.tsx  ✅ Lightbox
│   │   │   │   ├── ProjectsFilter.tsx   ✅ Pill filters
│   │   │   │   └── ReraBadge.tsx        ✅
│   │   │   ├── forms/EnquiryForm.tsx    ✅ → submitEnquiry()
│   │   │   └── Footer.tsx              ✅
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx              ✅ Role-aware nav
│   │   │   ├── Header.tsx               ✅ User menu
│   │   │   ├── companies/               ✅ Company admin UI
│   │   │   ├── case-studies/            ✅ Case-study admin UI
│   │   │   ├── analytics/
│   │   │   │   └── AnalyticsDashboard.tsx ✅ Charts + KPI cards
│   │   │   ├── enquiries/EnquiryInbox.tsx ✅
│   │   │   ├── leads/
│   │   │   │   ├── LeadsKanban.tsx      ✅
│   │   │   │   └── LeadDetail.tsx       ✅
│   │   │   ├── property-sites/          ✅ Microsite admin UI
│   │   │   ├── properties/
│   │   │   │   ├── PropertyTable.tsx    ✅
│   │   │   │   ├── MediaGallery.tsx     ✅ Local media manager
│   │   │   │   └── PropertyForm.tsx     ✅ Company-linked property + unit-plan form
│   │   │   └── sitevisits/SiteVisitsView.tsx ✅
│   │   └── shared/                      ✅ AuthProvider, ThemeProvider, ThemeToggle, AmenityIcon
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── connection.ts            ✅ Singleton
│   │   │   ├── models/                  ✅ Property, CRM, company, case-study, and microsite schemas
│   │   │   └── actions/                 ✅ Property, company, case-study, microsite, lead, enquiry, visit, and media actions
│   │   ├── auth/                        ✅ Edge-split
│   │   ├── i18n/                        ✅ Locale config, dictionary loading, route helpers
│   │   └── utils/
│   │       ├── constants.ts             ✅
│   │       └── validators.ts            ✅
│   │
│   ├── locales/                         ✅ JSON translation catalogs by locale + namespace
│   ├── types/index.ts                   ✅
│   ├── types/next-auth.d.ts             ✅
│   └── proxy.ts                         ✅
│
├── scripts/seed.ts                      ✅
├── scripts/validate-locales.ts          ✅
├── tests/e2e/                           ✅ Playwright end-to-end coverage
├── next.config.ts                       ✅ Image domains
└── package.json
```

---

## Database Schema Design

| Collection | Key Design | Indexes |
|---|---|---|
| `properties` | 6 attribute groups, GeoJSON, company linkage, unit plans, media gallery | 2dsphere, compound search, text, featured, company/status |
| `companies` | Canonical builder/developer entity, manager assignments, theme preset, publish workflow | slug unique, featured/status, assigned managers |
| `caseStudies` | Company-linked proof content with outcomes and property associations | slug unique, company/status, featured/status |
| `propertySites` | One primary microsite per property, shared property inheritance, theme/contact/SEO overrides | propertyId unique, siteSlug unique, company/status |
| `leads` | 7-stage pipeline, activity log, company/site attribution, async pre-save | {stage, assignedTo}, {propertyId, stage}, {companyId, stage} |
| `enquiries` | Raw submissions, 24h dedup, company/site tagging | {status, createdAt}, {propertyId}, {companyId}, {propertySiteId} |
| `users` | bcrypt, select:false, initials virtual | {email} unique |
| `siteVisits` | Scheduling, outcomes, scoped company/site linkage, async pre-save | {agentId, scheduledAt}, {propertyId}, {companyId} |

### Lead Pipeline
```
new → contacted → qualified → site_visit_scheduled → negotiation → converted → lost
```

---

## Server Actions Reference

**Server actions now span property, company, case-study, microsite, enquiry, lead, site-visit, and media flows.**

**`property.actions.ts`** — getProperties, getPropertyBySlug, getPropertyById, getFeaturedProperties, createProperty, updateProperty, togglePropertyStatus, toggleFeatured, deleteProperty, getAllPropertySlugs, getPropertyStats

**`company.actions.ts`** — getFeaturedCompanies, getPublishedCompanies, getCompanyProfileBySlug, getAdminCompanies, getCompanyById, createCompany, updateCompany

**`case-study.actions.ts`** — getFeaturedCaseStudies, getPublishedCaseStudies, getCaseStudyPageData, getAdminCaseStudies, getCaseStudyById, createCaseStudy, updateCaseStudy

**`property-site.actions.ts`** — getAllPublishedPropertySiteSlugs, getPublishedPropertySiteBySlug, getAdminPropertySites, getPropertySiteById, getPropertySiteByPropertyId, createPropertySite, updatePropertySite

**`property-media.actions.ts`** — uploadPropertyMedia, setPropertyCoverImage, reorderPropertyMedia, deletePropertyMedia

**`enquiry.actions.ts`** — submitEnquiry (public, 24h dedup), getEnquiries, getEnquiryStats, markEnquiryReviewed, markEnquirySpam, convertEnquiryToLead

**`lead.actions.ts`** — getLeads, getLeadsKanban, getLeadById, createLead, updateLeadStage, assignLead, addLeadActivity, updateLeadScore, markLeadLost, getLeadStats, getAgents

**`sitevisit.actions.ts`** — scheduleSiteVisit, getSiteVisits, getUpcomingVisits, updateSiteVisitStatus, getSiteVisitStats

---

## Public Portal Pages

| Page | Route | Description |
|---|---|---|
| Homepage | `/` | Hero, featured properties, services, trust, featured companies, case studies, enquiry CTA |
| All Projects | `/projects` | SSR grid, pill filters (type/possession/budget), pagination |
| Property Detail | `/projects/[slug]` | ISR, full specs, gallery lightbox, amenities, nearby, sidebar form |
| Companies | `/companies` | Public company profiles index |
| Company Profile | `/companies/[slug]` | Company story, linked properties, linked case studies, enquiry CTA |
| Case Studies | `/case-studies` | Proof-led public stories index |
| Case Study Detail | `/case-studies/[slug]` | Outcome-led story tied to company + properties |
| Property Microsite | `/sites/[siteSlug]` | Single-page property landing page using shared property data + microsite overrides |
| About | `/about` | Team, company story, values, partner proof, compliance badges |
| Contact | `/contact` | Contact cards, enquiry form |
| Sitemap | `/sitemap.xml` | Auto-generated — includes active properties, companies, case studies, and published microsites |
| Robots | `/robots.txt` | Blocks /admin /api /auth |

---

## CRM Dashboard Modules

| Module | Route | Key Features |
|---|---|---|
| Overview | `/admin` | Live stats, pipeline chart, upcoming visits, quick actions |
| Analytics | `/admin/analytics` | Funnel chart, source bars, type pie, visit progress bars, stage table |
| Enquiry Inbox | `/admin/enquiries` | Status tabs, convert-to-lead, mark reviewed/spam |
| Leads Kanban | `/admin/leads` | 5-column board, stage move, score display |
| Add Lead | `/admin/leads/new` | Manual lead entry wired to `createLead` |
| Lead Detail | `/admin/leads/[id]` | Activity timeline, agent assign, inline notes |
| Companies | `/admin/companies` | Builder/developer profiles, featured trust layer, manager scope |
| Case Studies | `/admin/case-studies` | Proof stories linked to companies and properties |
| Property Microsites | `/admin/property-sites` | Single-page landing site management tied to listed properties |
| Property Table | `/admin/properties` | Status filter, search, status/featured toggles, row actions |
| Add Property | `/admin/properties/new` | Property form with company linkage, unit plans, and post-save gallery setup |
| Edit Property | `/admin/properties/[id]/edit` | Deep-merged updates, preserved media, unit plans, local gallery tools |
| Site Visits | `/admin/site-visits` | Visit cards, complete/no-show actions, stats |

---

## Known Fixes Applied

These fixes were made during development and are already incorporated:

| Fix | Details |
|---|---|
| **Tailwind v4 migration** | `globals.css` uses `@import "tailwindcss"` + `@theme {}` block instead of v3 config |
| **TypeScript serialization** | Server Action serialize helpers removed explicit type assertions |
| **Mongoose async pre-save** | `Lead.ts` and `SiteVisit.ts` pre-save hooks converted to async, removing `next()` callback conflicts |
| **budgetRange field mismatch** | `convertEnquiryToLead` correctly maps enquiry budget to lead requirements |
| **ObjectId hardening** | Lead/enquiry writes validate actor ids, sanitize optional property refs, and log invalid inputs with field context |
| **Property edit stability** | Edit flow now deep-merges nested payloads, preserves `mediaAssets`, and tolerates blank optional number inputs |
| **Local media gallery** | Admin property edit supports upload, cover selection, drag reorder, and safe delete for local `/uploads/properties/*` assets |
| **Theme parity** | Public navbar and admin header now expose a reusable light/dark toggle and core CRM/property screens use semantic tokens |
| **Locale routing stability** | Proxy now preserves locale context without self-fetch loops, keeps English URLs clean, and normalizes stray `/en/*` requests |
| **Client/server hook boundaries** | Locale-aware interactive property cards now render as client components, eliminating server-side hook invocation errors |
| **Playwright smoke coverage** | Auth, locale routing, public smoke pages, and admin guards are covered by automated browser tests |
| **Edge runtime error** | Auth config split: `auth.config.ts` (edge-safe) + full `config.ts` (node only). `proxy.ts` uses edge-safe instance |
| **useSearchParams Suspense** | Login page wrapped in `<Suspense>` boundary for static prerendering |

---

## Development Phases

| Phase | Focus | Status |
|---|---|---|
| **Phase 0** | Bootstrap — Next.js 16, ShadCN, folder structure | ✅ Complete |
| **Phase 1** | Database — core CRM + property schemas, connection singleton, seed | ✅ Complete |
| **Phase 2** | Auth + RBAC — NextAuth v5, edge-split, proxy.ts, login UI | ✅ Complete |
| **Phase 3** | Server Actions — 33 actions, Zod validators | ✅ Complete |
| **Phase 4** | CRM Dashboard — Kanban, inbox, property table, visits | ✅ Complete |
| **Phase 5** | Public Portal — homepage, project pages, enquiry forms | ✅ Complete |
| **Phase 6** | Analytics, property form, about page, sitemap, robots | ✅ Complete |
| **Phase 7** | Companies, case studies, property microsites, scoped company-manager RBAC | ✅ Complete |
| **Phase 8** | Localization foundation, site-template system, premium motion layer, Playwright smoke coverage | ✅ Complete |
| **Phase 9** | Long-term custom domains, AI growth features, platform ops split | 🔄 Next |

---

## Environment Setup

```bash
git clone <repo-url> && cd homes
npm install
cp .env.example .env.local
npm run seed
npm run seed:leads
npm run dev
npx playwright install chromium
npm run build
npm run validate:locales
npm run test:e2e
```

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/homes
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Homes
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts

```json
"scripts": {
  "dev":   "next dev",
  "build": "next build --webpack",
  "start": "next start",
  "seed":  "node --import tsx scripts/seed.ts",
  "seed:leads": "node --import tsx scripts/seed-leads.ts",
  "validate:locales": "node --import tsx scripts/validate-locales.ts",
  "test:e2e": "playwright test"
}
```

### Seed Notes

- `npm run seed` creates the base users, companies, 7 company-linked properties, case studies, and published property microsites.
- `npm run seed:leads` clears and reseeds the `leads` collection with 18 realistic records spanning all stages and sources.
- Property gallery uploads are stored locally under `public/uploads/properties/<slug>/` and assume persistent disk storage.

### Operational Notes

- Public locale switching is cookie-backed and intentionally uses a full navigation so server-rendered locale context always refreshes correctly.
- Default English routes stay unprefixed. Hindi and future locales stay prefixed.
- Playwright uses `http://127.0.0.1:3100` during tests to avoid local auth callback mismatches.
- If you change translation catalogs, run `npm run validate:locales` before pushing.

---

## Design System

### Palette (Tailwind v4 `@theme` block)

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#F7F9FC` / `#0C1430` | App canvas in light / dark mode |
| `--foreground` | `#142966` / `#F6FAFF` | Primary text in light / dark mode |
| `--card` | `#FFFFFF` / `#142966` | Elevated surfaces |
| `--accent` | `#E8F7FD` / `#1B326F` | Pills, chips, soft surfaces |
| `--primary` | `#29C2F2` | Accent CTA and highlight color |
| `--secondary` | `#3F403F` | Trust/compliance/supporting contrast color |

### Typography

| Role | Font | Weights |
|---|---|---|
| Headlines | Playfair Display | 400, 500, 600, 700 |
| Body / UI | DM Sans | 300, 400, 500, 600 |

### Key Utilities
- `text-gradient-primary` — primary-accent text gradient
- `bg-grid-pattern` — subtle primary grid overlay for hero backgrounds
- `line-clamp-2 / -3` — Text truncation utilities

### Presentation Modes

| Template | Use Case | Characteristics |
|---|---|---|
| `classic` | Safer, restrained commercial presentation | Cleaner surfaces, lighter hover states, minimal motion |
| `immersive` | Premium showcase experience | Glass surfaces, ambient motion, reveal effects, stronger CTA feedback |

---

## Current Project Status

### ✅ Current State

- Public trust/authenticity layer is live on `/` and `/about` using featured companies and case studies.
- Company profiles, public case-study pages, and property microsites are available under `/companies/*`, `/case-studies/*`, and `/sites/*`.
- Admin users can manage companies, case studies, and microsites from the dashboard.
- `company_manager` is a scoped role that can work only inside assigned companies, properties, leads, enquiries, and site visits.
- Properties now support `companyId`, `unitPlans[]`, preserved media galleries, and microsite inheritance.
- English and Hindi are live across public pages and shared admin UI, with Croatian and Arabic scaffolded for later rollout.
- The app ships with both `classic` and `immersive` site templates through shared presentation settings.
- Playwright smoke coverage is in place for locale routing, admin auth, public pages, and key guard flows.

### 🔄 Up Next — Production Deploy and Expansion

Final QA checklist before going live:
- [ ] Test full enquiry → lead → site visit → converted flow end-to-end
- [ ] Verify all 7 seeded properties render correctly on public pages
- [ ] Verify both `classic` and `immersive` presentation modes across public core pages
- [ ] Expand Playwright from smoke coverage into full CRM create/edit flows
- [ ] Run Lighthouse audit — target 90+ Performance, 100 SEO, 100 Accessibility
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure MongoDB Atlas IP allowlist for production server
- [ ] Set up Vercel project — connect repo, add all env vars
- [ ] Enable Vercel Analytics for Core Web Vitals monitoring
- [ ] Change default admin password before go-live
- [ ] Add real RERA IDs to seeded properties
- [ ] Upload actual property images and replace placeholder URLs

---

## Contributing

1. Business logic → `src/lib/db/actions/` — never in components
2. New DB fields → `src/types/index.ts` first, then schema, then validator
3. Auth guards → `requireAuth()` or `withRole()` as first line of every action
4. Maintain edge/node split — never import Mongoose in `proxy.ts` or `auth.config.ts`
5. Soft deletes only — `status: "archived"` not hard delete
6. All Tailwind uses v4 syntax — `@theme {}` not `tailwind.config.ts` extend

---

*Built with Next.js 16, MongoDB Atlas, Tailwind CSS v4, ShadCN UI, and NextAuth v5.*
*One codebase — any real estate business.*
