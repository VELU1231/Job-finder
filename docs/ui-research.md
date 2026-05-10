# UI Research Log

Date: 2026-05-10

Method

- Ran the six required searches against current public web results.
- Cross-checked official docs where available for component, styling, and notification guidance.

## 1. Glassdoor job card UI design 2026

Search term: `Glassdoor job card UI design 2026`

Findings

- Current Glassdoor result pages still prioritize dense cards with clear company identity, salary/status metadata, and fast scan hierarchy over oversized marketing visuals.
- Public redesign examples trend toward compact cards with stronger grouping: role, company, location, compensation, benefits, and quick actions separated into readable rows.
- For JobFinder, the useful pattern is a high-information card with strong first-line hierarchy and compact metadata chips, not a sparse hero-card treatment.

References

- https://www.glassdoor.com/Job/us-ui-ux-designer-jobs-SRCH_IL.0,2_IN1_KO3,17.htm
- https://dribbble.com/shots/27286550-Glassdoor-Jobs-Dashbord-UX-Redesign
- https://www.behance.net/search/projects/job%20cards%20ui

## 2. Wellfound job board UI design 2026

Search term: `Wellfound job board UI design 2026`

Findings

- Wellfound continues to frame job discovery around startup context, emphasizing role fit, salary/equity, remote status, and company stage in a single glance.
- The stronger takeaway is lightweight, founder/startup-oriented metadata near the title instead of burying differentiators below the fold.
- For JobFinder, this supports sharper secondary metadata lines and stronger compensation/remote badges directly on cards.

References

- https://wellfound.com/
- https://wellfound.com/role/ui-ux-designer
- https://wellfound.com/role/ui-designer

## 3. shadcn ui latest components 2026

Search term: `shadcn ui latest components 2026`

Findings

- Official changelog remains the primary source for newly added or updated building blocks.
- The library still favors composable primitives over monolithic widgets, which fits the current app structure better than adding another heavy UI kit.
- For upcoming UX work, useful shadcn patterns include sheet/drawer flows for mobile filters, toast integration, skeletons, dropdown menus, badges, and empty states.

References

- https://ui.shadcn.com/docs/changelog
- https://github.com/shadcn-ui/ui
- https://www.shadcn.io/

## 4. Tailwind v4 @theme CSS tokens oklch 2026

Search term: `Tailwind v4 @theme CSS tokens oklch 2026`

Findings

- Tailwind v4 official docs push theme variables as the design-token API instead of legacy config-first customization.
- Tailwind v4 release guidance explicitly supports modern CSS tokens and encourages color systems expressed with OKLCH for more predictable contrast and palette tuning.
- For JobFinder, the right direction is centralized tokens in CSS using `@theme`, then consuming them through utilities rather than ad hoc inline styles or scattered hex values.

References

- https://tailwindcss.com/docs/theme
- https://tailwindcss.com/blog/tailwindcss-v4

## 5. sonner toast notifications next.js 2026

Search term: `sonner toast notifications next.js 2026`

Findings

- Sonner remains a current lightweight toast choice for React/Next.js projects because it is minimal, modern, and aligns well with shadcn-style app shells.
- For this repo, Sonner is the preferred replacement for `alert()` and `confirm()` because it avoids blocking browser dialogs and fits client-side form workflows.
- Toast usage should be centralized in layout or a shared provider, with success/error messaging mapped to user actions like post submission, upload status, and API failures.

References

- https://github.com/emilkowalski/sonner
- https://modern-ui.org/docs/components/sonner

## 6. job board UX best practices filters mobile 2026

Search term: `job board UX best practices filters mobile 2026`

Findings

- Mobile filtering patterns continue to favor a bottom-sheet or full-screen filter panel instead of a permanently visible sidebar.
- Users need persistent visibility into how many filters are active and whether results changed after applying them.
- The best direction for JobFinder is a mobile-first filter trigger with applied-filter counts, clear reset/apply actions, and sticky result context rather than a desktop-only sidebar pattern.

References

- https://mobbin.com/explore/mobile/flows/filtering-sorting
- https://heurilens.com/blog/technical-ux/mobile-ux-best-practices-data-driven-guide
- https://www.uxdesigninstitute.com/blog/2026-job-search-strategies-for-ux/

## Implications For Chunk 2+

- Job cards should be information-dense but visually cleaner: stronger title/company hierarchy, tighter metadata, clearer compensation and remote signals.
- Mobile filters should move toward a sheet/drawer interaction with explicit apply/reset affordances and active-filter counts.
- Theme work should consolidate into Tailwind v4 tokens and OKLCH-based palette decisions, avoiding inline color styles.
- Toasts should replace blocking browser dialogs in all interactive flows.