# Phase 7 — Critical Fixes & Missing Pages

## Issue 1: Homepage showing default Next.js page (CRITICAL)

**Root cause:** `src/app/page.tsx` from the original Next.js scaffold was never deleted. 
In Next.js App Router, `src/app/page.tsx` and `src/app/(public)/page.tsx` BOTH serve the `/` route — 
but the root one wins. Your homepage is in the (public) route group, so the scaffold page hides it.

**Fix — run this ONE command:**
```bash
rm src/app/page.tsx
```

That's it. After deleting the scaffold page, `src/app/(public)/page.tsx` (our homepage) takes over.

Also check if `src/app/(public)/layout.tsx` is present. If not, copy `public-layout.tsx` from Phase 5.

---

## Issue 2: /admin/leads — 404

**Root cause:** The file `src/app/admin/leads/page.tsx` was not copied from Phase 4 outputs.

**Fix:**
```bash
# Verify the file exists
ls src/app/admin/leads/page.tsx

# If missing, copy from Phase 4 outputs:
cp phase4/leads-page.tsx src/app/admin/leads/page.tsx

# Also ensure the [id] subfolder exists
mkdir -p "src/app/admin/leads/[id]"
cp phase4/lead-detail-page.tsx "src/app/admin/leads/[id]/page.tsx"
```

---

## Issue 3: /admin/settings — 404

**Root cause:** Settings page was never built in previous phases.
The sidebar showed the link but the page didn't exist.

**Fix:** Copy the new files from Phase 7 outputs:
```bash
mkdir -p src/app/admin/settings
mkdir -p src/components/dashboard/settings

cp settings-page.tsx           src/app/admin/settings/page.tsx
cp SettingsView.tsx             src/components/dashboard/settings/SettingsView.tsx
```

---

## Issue 4: /services — 404

**Root cause:** Services page was never built.

**Fix:**
```bash
mkdir -p "src/app/(public)/services"
cp services-page.tsx "src/app/(public)/services/page.tsx"
```

---

## Issue 5: /blogs — 404 (also linked in nav)

**Fix:**
```bash
mkdir -p "src/app/(public)/blogs"
cp blogs-page.tsx "src/app/(public)/blogs/page.tsx"
```

---

## Full Phase 7 Copy Commands

Run everything at once from your project root:

```bash
# Step 1: THE CRITICAL FIX — delete the scaffold root page
rm src/app/page.tsx

# Step 2: Create all missing directories
mkdir -p src/app/admin/settings
mkdir -p src/app/admin/analytics  
mkdir -p src/app/admin/properties/new
mkdir -p "src/app/admin/properties/[id]/edit"
mkdir -p "src/app/admin/leads/[id]"
mkdir -p "src/app/(public)/services"
mkdir -p "src/app/(public)/blogs"
mkdir -p src/components/dashboard/settings
mkdir -p src/components/dashboard/analytics

# Step 3: Copy Phase 7 files
cp services-page.tsx    "src/app/(public)/services/page.tsx"
cp blogs-page.tsx       "src/app/(public)/blogs/page.tsx"
cp settings-page.tsx    src/app/admin/settings/page.tsx
cp SettingsView.tsx     src/components/dashboard/settings/SettingsView.tsx

# Step 4: Copy Phase 6 files if not already done
cp analytics-page.tsx   src/app/admin/analytics/page.tsx
cp AnalyticsDashboard.tsx src/components/dashboard/analytics/AnalyticsDashboard.tsx
cp PropertyForm.tsx     src/components/dashboard/properties/PropertyForm.tsx
cp property-new-page.tsx src/app/admin/properties/new/page.tsx
cp property-edit-page.tsx "src/app/admin/properties/[id]/edit/page.tsx"

# Step 5: Re-verify Phase 4 files are all present
ls src/app/admin/leads/page.tsx              # should exist
ls "src/app/admin/leads/[id]/page.tsx"       # should exist
ls src/app/admin/enquiries/page.tsx          # should exist
ls src/app/admin/properties/page.tsx         # should exist
ls src/app/admin/site-visits/page.tsx        # should exist

# Step 6: Verify Phase 5 public files exist
ls "src/app/(public)/page.tsx"               # MUST exist (our homepage)
ls "src/app/(public)/layout.tsx"             # MUST exist (navbar + footer)
ls "src/app/(public)/projects/page.tsx"      # should exist
ls "src/app/(public)/projects/[slug]/page.tsx" # should exist

# Step 7: Commit and verify
git add .
git commit -m "fix: Phase 7 — root page conflict, missing routes, services/blogs/settings pages"

# Step 8: Build check
npm run build
```

---

## Expected Routes After All Fixes

```
✅ /                           → Homepage (hero, featured projects, services, CTA)
✅ /projects                   → All projects grid with filters
✅ /projects/[slug]            → Property detail page
✅ /about                      → About page
✅ /services                   → Services page (6 services + process)
✅ /blogs                      → Blog listing page
✅ /contact                    → Contact page with enquiry form
✅ /auth/login                 → Login page

✅ /admin                      → CRM overview with live stats
✅ /admin/enquiries            → Enquiry inbox
✅ /admin/leads                → Kanban pipeline board
✅ /admin/leads/[id]           → Lead detail + activity log
✅ /admin/properties           → Property table
✅ /admin/properties/new       → Add property form (8 sections)
✅ /admin/properties/[id]/edit → Edit property form
✅ /admin/site-visits          → Site visits list
✅ /admin/analytics            → Recharts analytics dashboard
✅ /admin/settings             → Account + team + system settings

✅ /sitemap.xml                → Auto-generated with all slugs
✅ /robots.txt                 → Blocks admin/api/auth
```
