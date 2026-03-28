# What Else Can Be Done — Future Improvements

A structured list of what would logically make the Homes platform more efficient, categorised by impact and implementation complexity.

---

## Tier 1 — High Impact, Implementable Now

### 1. WhatsApp Business API Integration
**Why:** Every enquiry form already has a phone number. The most natural next-step action in Indian real estate is a WhatsApp message — not an email.
**What:** When an enquiry is submitted → automatically send a WhatsApp message to the prospect via the WhatsApp Business Cloud API confirming receipt, plus a message to the assigned agent notifying them of the new lead.
**Files:** Add `src/lib/integrations/whatsapp.ts` and call it from `submitEnquiry()` action.

### 2. Automated Lead Scoring
**Why:** Agents currently score leads manually (0–100). The data to compute this automatically already exists in the DB.
**What:** Score based on: site visit interest (+ 20), home loan interest (+10), specific property referenced (+15), budget range provided (+15), source quality (website +10 vs walkin +20), recency (+varies), response count (+5 per response).
**Files:** Add `computeLeadScore()` utility called on every `updateLeadStage()` and `convertEnquiryToLead()`.

### 3. Lead Stage Deadline Alerts
**Why:** Leads sit in stages for too long with no action. The "Contacted" stage is where most go cold.
**What:** A cron job (or Vercel CRON) that runs daily, finds leads untouched for 72+ hours, and sends the assigned agent a WhatsApp/email nudge. Add a `lastActivityAt` field to the Lead schema that updates on every activity log entry.
**Implementation:** Vercel CRON → API route → queries stale leads → sends alerts.

### 4. Property Enquiry Source Tracking (UTM)
**Why:** Currently all enquiries from the website are tagged as `source: "website"`. You can't tell which marketing channel (Google, Meta, 99acres) drove the enquiry.
**What:** Capture UTM parameters from the URL on enquiry submission. Store `utm_source`, `utm_medium`, `utm_campaign` on the Enquiry document.
**Files:** Add a hidden field to `EnquiryForm.tsx` that reads URL params and passes them to `submitEnquiry()`.

### 5. Site Visit Reminder Notifications
**Why:** No-show rate is a real problem. Reminder notifications 24h and 1h before a scheduled visit would reduce it significantly.
**What:** On `scheduleSiteVisit()`, schedule two reminders — one 24h before, one 1h before — via WhatsApp or SMS to the client phone number.
**Implementation:** Store `scheduledAt` on the visit → cron checks upcoming visits → sends reminders via WhatsApp API.

---

## Tier 2 — Medium Impact, Next Sprint

### 6. CMS for Blogs
**Why:** The blogs page currently shows static placeholder posts. Real blog content drives organic SEO traffic for long-tail queries like "buy plot sushant golf city lucknow".
**What:** Add a `posts` MongoDB collection with: `title`, `slug`, `content` (markdown or rich text), `category`, `publishedAt`, `author`, `seoMeta`. Build an admin editor page at `/admin/blogs/new`.
**SEO impact:** High — blog posts targeting property-related keywords are the primary way real estate sites capture top-of-funnel organic traffic.

### 7. Saved Properties / Wishlist
**Why:** Buyers browsing multiple properties have no way to save or compare them across sessions.
**What:** A localStorage-based "saved properties" list on the public portal. No login required. Add a heart icon to each `PropertyCard`. Show a `/saved` page with comparison view.
**Files:** Add `useSavedProperties()` hook, `SaveButton` component, `/saved` page.

### 8. Property Comparison Tool
**Why:** Buyers shortlisting 2–3 properties want a side-by-side spec comparison.
**What:** Allow selecting up to 3 properties → compare in a table view showing price, area, amenities, RERA status, nearby places.
**Files:** `src/app/(public)/compare/page.tsx`, `ComparisonTable` component.

### 9. EMI Calculator Widget
**Why:** Every buyer's first question is "what will my monthly EMI be?" — having a live calculator on each property page keeps them engaged and reduces the need to call.
**What:** An interactive client component on the property detail page: loan amount (auto-filled from property price), interest rate slider, tenure slider → live EMI calculation + total interest breakdown.
**Files:** `EmiCalculator.tsx` component in `src/components/public/properties/`.

### 10. Property Status Email Notifications
**Why:** When a property moves from "active" to "sold" or "blocked", enquired leads should be notified so they can pivot to alternatives.
**What:** On `togglePropertyStatus()`, if status changes to `sold` or `blocked` → query all leads linked to that property → send notification emails.
**Implementation:** Add Resend (or Nodemailer) integration → call from Server Action.

---

## Tier 3 — System Efficiency

### 11. Image Upload with Cloudinary/UploadThing
**Why:** Currently media assets are just URLs. There's no way to upload images from the admin dashboard — it requires a developer to add URLs manually.
**What:** Integrate UploadThing (already in the original dependency plan) to the `PropertyForm`. Add a drag-and-drop image uploader that uploads to Cloudinary, gets the URL back, and adds it to `mediaAssets[]`.
**Files:** `src/components/dashboard/properties/MediaUploader.tsx`.

### 12. Real-time Enquiry Notification (Admin)
**Why:** Agents currently have to refresh the page to see new enquiries.
**What:** Use Next.js Server-Sent Events (SSE) or polling to push a notification badge to the sidebar when a new enquiry arrives.
**Implementation:** API route at `/api/enquiries/stream` → sidebar polls or subscribes → badge count updates.

### 13. Lead Duplicate Detection
**Why:** The same person might submit enquiries from multiple pages, creating duplicate leads that agents waste time on.
**What:** On `convertEnquiryToLead()`, check if a lead with the same phone number already exists. If yes, don't create a new lead — instead add an activity log entry to the existing one noting the new property interest.

### 14. Property View Count Analytics Page
**Why:** The `viewCount` field on properties increments on every public page view, but it's never displayed anywhere in the admin.
**What:** Add a "Top Viewed Properties" widget to the analytics dashboard using the viewCount data that already exists.
**Quick to build:** Just add one more chart to `AnalyticsDashboard.tsx`.

### 15. Google Maps Embed on Property Pages
**Why:** The current location card is just text + a "Open in Maps" link. A proper embedded map gives buyers instant location context without leaving the page.
**What:** Embed a Google Maps iframe using the stored `location.coordinates` (`[lng, lat]`). Use the free Maps Embed API (no billing required for basic embeds).
**Files:** `MapEmbed.tsx` component in `src/components/public/properties/`.

---

## Tier 4 — Scale When Ready

### 16. Multi-Tenancy Activation
**Why:** The architecture was designed to be white-label from day one. Every schema has a `tenantId` pattern built in.
**What:** Activate the tenant layer when you want to onboard a second real estate business onto the same platform. Create a `tenants` collection, add `tenantId` to all schemas, scope all Server Action queries by tenant.
**Business model:** Monthly SaaS subscription per tenant business.

### 17. Developer / Builder Portal (B2B)
**Why:** The property developers (Pardos Developers, Attalika Developers etc.) want to see how their project is performing — lead volume, site visits, conversions.
**What:** A read-only portal at `/portal` scoped to a developer's properties. Shows: live enquiry count, stage distribution, site visit schedule, conversion rate.
**RBAC addition:** New `b2b_owner` role — already defined in the constants.

### 18. Post-Sale Maintenance Module (Work Orders)
**Why:** The `workOrders` schema was partially designed in the original architecture spec. Post-sale property management is a natural expansion.
**What:** Tenant/owner submits issue → creates WorkOrder → agent assigns contractor → status tracked to resolution.
**Schema:** Already partially designed. Needs `contractors` collection and work order UI.

### 19. Automated SEO Sitemap Updates
**Why:** When a new property is added, the sitemap should update immediately without a redeploy.
**What:** The `src/app/sitemap.ts` already queries live properties — it's always fresh. Just set `revalidate` headers correctly for the sitemap route so it's re-generated on each request or on a schedule.

### 20. Performance: Redis Caching for Property Listings
**Why:** `getProperties()` runs a MongoDB query on every page load for `/projects`. Under traffic, this becomes a bottleneck.
**What:** Cache the active property list in Redis (Upstash) with a 5-minute TTL. Invalidate on any property mutation. This can reduce DB load by 90% for the most-accessed route.

---

## Priority Order for the Next Sprint

1. **Delete `src/app/page.tsx`** (5 seconds, unblocks the entire frontend)
2. **WhatsApp notification on enquiry** (highest ROI for a real estate business)
3. **Automated lead scoring** (saves agent time, improves pipeline quality)
4. **Image upload via UploadThing** (currently the biggest admin workflow gap)
5. **EMI calculator on property pages** (increases time-on-page and conversion)
6. **Blog CMS** (highest long-term SEO value)
7. **Lead duplicate detection** (data hygiene)
8. **Google Maps embed** (immediate UX improvement on property pages)
