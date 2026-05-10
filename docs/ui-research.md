# UI Research — Chunk 1 (2026-05-10)

## Search queries and findings

### 1. Glassdoor job card UI design 2026

Key patterns from modern Glassdoor-style job cards:
- Company logo prominently placed (top-left or standalone card header area)
- Job title as the primary typographic anchor (large, bold)
- Company name + location as a secondary line below the title
- Salary range always visible on the card (not hidden until click)
- Tags row: job type, remote status, category — pill/chip style
- Two CTAs: a neutral "View Job" and a high-contrast "Apply Now" (gradient or dark fill)
- Hover state: subtle lift (transform: translateY) + deeper shadow
- Card border: subtle 1px with white/transparent backdrop — glassmorphism pattern common

Current JobFinder cards already follow this pattern. Remaining gap: company logo/avatar placeholder not yet rendered.

---

### 2. Wellfound (AngelList) job board UI design 2026

Key patterns from Wellfound-style boards:
- Left sidebar filters: sticky, vertically scrollable, compact pill chips per category
- Main area: single-column job list on mobile, two-column grid on wider screens
- Each card shows: role title, company name, funding stage / employee count, location/remote badge, equity + salary
- "Match score" and "Save" bookmark icon as secondary actions
- Filter sidebar uses collapsible sections (Category, Remote, Salary, Experience)
- Pagination replaced by infinite scroll with a "Load more" fallback button
- Active filter count shown as a badge on the mobile filter toggle button

Gaps identified in JobFinder:
- Filter sidebar lacks salary range slider
- No bookmark/save functionality (future chunk)
- No infinite scroll — cursor-based pagination is fine for now

---

### 3. shadcn/ui latest components 2026

Current available components relevant to job boards:
- `Card`, `CardHeader`, `CardContent`, `CardFooter` — structured job card layout
- `Badge` — replaces manual pill spans for tags/categories
- `Button` — replaces manual button classes
- `Input`, `Select`, `Textarea` — replaces manual form inputs
- `Skeleton` — replaces `animate-pulse` divs
- `Separator` — replaces manual border divs
- `Sheet` — mobile filter drawer (slides in from left)
- `Dialog` — modal for "Apply" pre-flight / login gate
- `Toast` (via Sonner) — replaces inline message banners
- `Command` — searchable combobox for category and location filters

Decision for Chunk 2+: Integrate `Badge` and `Button` from shadcn for consistent interactive states.

---

### 4. Tailwind v4 @theme CSS tokens (oklch) 2026

Tailwind v4 introduces CSS-first configuration via `@theme` in globals.css.
Key change: color tokens can use `oklch()` for perceptually uniform color.

Example pattern:
```css
@theme {
  --color-brand-violet: oklch(0.54 0.27 290);
  --color-brand-emerald: oklch(0.72 0.19 163);
  --color-brand-amber: oklch(0.82 0.18 85);
}
```

Benefits of oklch:
- Perceptually uniform — equal luminance steps feel equal visually
- Better saturation control for gradients (avoids the "gray midpoint" issue with sRGB gradients)
- Native in all modern browsers since 2023

Current JobFinder globals.css uses hex tokens. Recommendation for Chunk 3: migrate to oklch for the brand palette.

---

### 5. Sonner toast notifications — Next.js 2026

Sonner is the modern replacement for react-hot-toast and react-toastify:
- Install: `npm install sonner`
- Add `<Toaster />` once to root layout
- Use `toast.success()`, `toast.error()`, `toast.loading()` from any client component
- Supports promise-based toasts: `toast.promise(fetch(...), { loading: "...", success: "...", error: "..." })`
- Styled with CSS variables — easily themed to match brand

Plan for Chunk 2: replace the inline success/error message banners in `PostJobForm` and `ResumeUploadForm` with Sonner toasts.

---

### 6. Job board UX best practices — filters + mobile 2026

Best practices for filter UX on job boards:

**Desktop:**
- Persistent left sidebar (280–320px) with sticky positioning
- Filter sections are collapsible with smooth animation
- Active filter count shown as a badge on section heading
- "Clear all" resets all params at once
- Filters apply immediately (no "Apply filters" button required)

**Mobile:**
- Filter trigger: a floating "Filters" button or a top bar chip with active count badge
- Filters open in a `Sheet` (bottom drawer or side drawer) — never a full-page route change
- Chips at the top of the results list show active filters with individual × remove buttons
- Sort dropdown always visible near the results count

**Pagination vs infinite scroll:**
- Cursor-based pagination is SEO-safe and accessible
- Infinite scroll works best for discovery-mode browsing; pagination better for intentional searches
- "Load more" button at the bottom of a page is the accessible hybrid

Gaps in current JobFinder:
- Mobile: no filter drawer (Sheet component) — sidebar collapses awkwardly
- No active filter chips displayed above results
- Pagination Previous/Next not disabled visually when at boundaries
