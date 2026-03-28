# Multilingual Foundation and Premium Motion Redesign for Homes

## Summary
- Add a **scalable multilingual architecture** for both public and admin using **locale-prefixed routing** from day one: `/en`, `/hi`, later `/hr`, `/ar`.
- Use **typed JSON translation catalogs in-repo** as the source of truth, with a clear, discoverable folder/namespace structure and a small language-management surface in admin for enable/disable/default ordering. No DB-managed string editing in v1.
- Redesign the **public experience first** with a premium glass-commercial visual system and structured motion architecture, while also upgrading the **admin shell and shared admin primitives** so localization and visual language stay consistent.

## Implementation Changes
### 1. Internationalization Architecture
- Move the App Router under a locale segment: `app/[lang]/...`, with proxy-based locale negotiation and redirect to the best supported locale.
- Keep **route names and slugs canonical in English** in v1; localize UI copy, metadata, labels, navigation, and form text, not property/company slugs.
- Add a typed locale system:
  - supported locales registry
  - default locale
  - RTL-aware locale metadata for Arabic readiness
  - `getDictionary(lang)` server loader with namespace-based JSON files
  - client-safe translation access for interactive components
- Translation catalogs should live in a visible repo path such as `src/locales/<lang>/<namespace>.json`, with namespaces for:
  - `common`
  - `public-nav`
  - `home`
  - `about`
  - `projects`
  - `companies`
  - `case-studies`
  - `forms`
  - `admin-common`
  - `admin-nav`
  - `admin-crm`
  - `admin-properties`
  - `admin-companies`
  - `admin-microsites`
- Add a validation/check script that fails on:
  - missing keys
  - extra keys
  - invalid locale registration
- Add admin language settings for:
  - enabled locales
  - default locale
  - display labels
  - locale order
  - RTL flag metadata
- Do not implement full inline translation editing in admin in v1. Instead, add a **translation registry view** that shows active locales, namespace files, and missing-key status so catalogs are easy to find and maintain.

### 2. Locale Routing, Auth, SEO, and Metadata
- Update `proxy.ts` to handle both:
  - locale negotiation/redirection for public and admin
  - auth protection inside locale-prefixed admin routes
- All auth redirects and protected-route logic must preserve locale context.
- Update root and nested layouts so:
  - `<html lang>` reflects the current locale
  - `dir="rtl"` is set automatically for Arabic when added
  - metadata/open graph/canonical handling is locale-aware
- Update sitemap/robots/canonical generation to include localized routes and alternates.
- Public switcher should change locale while preserving the current route when possible.
- Admin switcher should do the same and localize shell/navigation/content strings.

### 3. Translation Rollout Scope
- Localize **all public pages** and **all admin shell/shared UI** in this phase.
- Admin page-level localization should include:
  - sidebar
  - header
  - shared buttons, forms, tabs, filters, empty states, toasts, workflow labels
  - CRM screens already in scope
- Seed English as canonical source and ship **Hindi fully translated** for the initial supported pair.
- Croatian and Arabic should be supported by architecture only in this phase:
  - locale registry
  - alternates
  - RTL readiness
  - empty catalogs/template generation
- Add a locale key policy:
  - keys are semantic, stable, and namespace-scoped
  - no inline user-facing literals in app code outside translation bootstrapping

### 4. Premium Glass + Motion Design System
- Introduce a **shared motion and surface design system** instead of page-by-page ad hoc animation.
- Add a small motion layer with:
  - reusable reveal primitives
  - stagger containers
  - hover lift/glow wrappers
  - marquee/orbit/background ambient primitives
  - reduced-motion fallbacks
- Bring in **Framer Motion** for the structured motion layer; keep CSS transitions for simple cases.
- Define a premium visual system in global tokens:
  - layered glass surfaces
  - blurred translucent panels
  - soft radial highlights
  - atmospheric background gradients/patterns
  - stronger shadow hierarchy
  - hover depth and tactile CTA states
- Preserve the current navy/cyan/graphite brand base, but extend it with:
  - glass overlays
  - elevated neutral surfaces
  - more expressive accent gradients
  - high-contrast readable light/dark variants
- Motion rules:
  - ambient motion only in hero/background/supporting sections
  - reveal-on-scroll for section entries
  - richer CTA/button hover interactions
  - no disruptive motion in dense admin workflows
  - full reduced-motion support via media query and motion config

### 5. Public Experience Upgrade
- Redesign the key public surfaces with the new system:
  - navbar
  - hero
  - homepage sections
  - about
  - projects index
  - property detail
  - companies
  - case studies
  - contact
  - microsites
- Make Lucknow Homes feel more commercial and premium by upgrading:
  - section hierarchy
  - CTA prominence
  - trust/proof storytelling
  - partner/company showcase
  - enquiry forms
  - hover states across cards and listings
- Add richer animated CTA behavior:
  - hover glow/lift
  - subtle pulse for primary CTA blocks
  - success-state polish in enquiry flows
- Use the shared motion primitives for consistency instead of unique one-off effects per page.

### 6. Admin Visual Upgrade
- Upgrade the admin **shell and shared surfaces** in this phase, not every deep screen:
  - sidebar
  - header
  - cards
  - tables
  - tabs
  - filter bars
  - forms
  - dialogs/dropdowns
  - empty states
- Apply glass-lite treatment in admin:
  - more restrained translucency
  - cleaner depth
  - better hover/focus states
  - improved motion only for transitions and feedback
- Keep the admin optimized for readability and task speed; avoid decorative ambient motion inside dense operational views.

## Public APIs / Interfaces / Types
- Add `Locale` and locale registry types with support metadata such as label, enabled state, default flag, and `dir`.
- Add translation dictionary loader interfaces and typed translation namespaces.
- Update route structure to locale-prefixed App Router paths.
- Update proxy/auth redirect behavior to be locale-aware.
- Add admin-facing language settings model/config surface for enabled locales and default locale.
- Add motion utility components/hooks and shared glass/surface design tokens.
- Add Framer Motion dependency and reduced-motion handling policy.

## Test Plan
- Locale routing:
  - root redirects to the negotiated locale
  - locale switcher preserves route context
  - unsupported locale returns 404 or redirects per policy
- Auth + admin:
  - unauthenticated admin access redirects to locale-correct login
  - authenticated redirects preserve locale
  - admin shell renders localized labels in English and Hindi
- Translations:
  - missing-key validation fails CI/check script
  - English and Hindi catalogs stay in sync
  - shared components render translated copy instead of inline literals
- SEO/metadata:
  - localized metadata is emitted per locale
  - sitemap includes locale variants
  - canonical and alternate tags are correct
- Design/motion:
  - reduced-motion mode disables non-essential motion
  - hover/focus states remain accessible
  - light/dark contrast remains readable with new glass surfaces
- Public UX:
  - homepage, about, projects, companies, case studies, property pages, and microsites render correctly in English and Hindi
  - enquiry forms work identically across locales
- Regression:
  - CRM/admin flows continue to work after locale prefixing
  - existing property/company/case-study/microsite routes still resolve correctly under locale prefixes

## Assumptions and Defaults
- Locale strategy is **prefix all locales**, including English.
- Translation source of truth is **typed JSON catalogs in the repo**, not PO files and not DB-first editing.
- V1 localizes **public fully** and **admin shell/shared UI fully**, while deeper admin visual redesign stays selective.
- Route slugs remain canonical English in v1; localized slugs are deferred.
- Hindi ships fully in this phase; Croatian and Arabic are architecture-ready but not fully translated yet.
- Arabic RTL support is built into layout and token decisions now, even if Arabic copy lands later.
- Motion uses Framer Motion for structure, with CSS transitions retained for simple interactions.
