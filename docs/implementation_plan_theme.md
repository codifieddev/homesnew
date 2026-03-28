# Implementation Plan: Branding, Theme & Homepage Update

The goal is to replace the current Navy/Gold branding with a new Light/Medium/Dark palette, implement light and dark mode support, update the logo across the platform, and rebuild the homepage hero section.

## User Review Required

- **Theme Variable Strategy**: We will write a script to replace all hardcoded hex values (e.g., `bg-[#0B1521]`, `text-[#C9A96E]`) across the `src/` directory with semantic Tailwind classes (`bg-background`, `bg-card`, `text-primary`, etc.). 
- **Light/Dark Mode**: We will redefine `:root` (Light mode) and `.dark` (Dark mode) in [globals.css](file:///Users/apple/Desktop/WORK/GIT/homes/src/app/globals.css) using the provided colors:
  - Dark: `#1a3f4e`
  - Medium (Off-white): `#F4F9E9`
  - Light (Accent/Primary Blue): `#2fa3f2`
- **Logo Replacement**: We will use the provided `Homes-Logo.webp` in both the public [Navbar](file:///Users/apple/Desktop/WORK/GIT/homes/src/components/public/navigation/Navbar.tsx#34-215) and admin [Sidebar](file:///Users/apple/Desktop/WORK/GIT/homes/src/components/dashboard/Sidebar.tsx#80-162), ensuring spacious placement.

## Proposed Changes

### Configuration and Scripting

#### [NEW] /tmp/theme-updater.mjs
- Create a Node.js script to traverse all [.tsx](file:///Users/apple/Desktop/WORK/GIT/homes/src/app/admin/page.tsx) files in `src/`.
- Replace hardcoded hex values with semantic classes:
  - `#0B1521` -> `background` / `card`
  - `#12202E` -> `card` / `muted`
  - `#1A2E42` -> `border` / `muted-foreground`
  - `#C9A96E` -> `primary`
  - `#E2C99A` -> `primary/80`
  - `#F5ECD9` -> `secondary` or `accent`
- Run the script to cleanly migrate the codebase away from hardcoded hex values.

### Styling and Configuration

#### [MODIFY] src/app/globals.css
- Define the new color palette in the `@theme` block and mapped to `:root` (Light Mode) and `.dark` (Dark Mode) variables.

#### [MODIFY] src/app/layout.tsx
- Integrate `next-themes` (if installed) or a context to allow toggling between light and dark modes, or simply set the default to support system preferences (`class="dark"` configuration).

### Frontend Updates

#### [MODIFY] src/components/public/navigation/Navbar.tsx
- Replace the icon-based logo with an `Image` component loading `/homes/Homes-Logo.webp`.
- Adjust sizing to make it prominent but fit within the header.
- Ensure light/dark mode logo clarity (if needed, use filters or styling to ensure the logo is visible on both).

#### [MODIFY] src/app/(public)/page.tsx
- Completely rebuild the Hero section at the top.
- Implement a **Hero Slider** (using `embla-carousel` or standard React state).
- Overlay or place a **sleek enquiry form** securely and visibly on the Hero section to capture lead interests immediately.

### Admin Dashboard Updates

#### [MODIFY] src/components/dashboard/Sidebar.tsx
- Replace the icon-based logo at the top left with the new `Homes-Logo.webp` image.
- Ensure "clear and spacious placement of logo as authority" as requested.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no Typescript or import errors were introduced.

### Manual Verification
- Check the Frontend and Admin headers to ensure the logo is perfectly sized and placed.
- Verify that toggling light/dark modes (or viewing in both contexts) works with the new F4F9E9 / 1a3f4e / 2fa3f2 palette.
- Test the new Hero slider and verify the sleek enquiry form works visually.
