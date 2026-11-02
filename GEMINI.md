# Instructions for AI Coding Assistants (DecideOS)

## 1. Design Token Architecture & Styling Rules

> **CRITICAL ARCHITECTURAL RULE:**
> To tweak contrast, change dark mode depth, or adjust borders in the future, you no longer need to edit dozens of individual component files. Simply modify the CSS variables in `src/index.css` or the token definitions in `tailwind.config.js`. All cards, tables, text elements, and badges across the application will update automatically.

### Rule 1: Always Use Semantic Tokens
When building or modifying components, **never** introduce ad-hoc hardcoded Tailwind palette classes (e.g., `bg-slate-50`, `bg-slate-100`, `text-slate-900`, `text-slate-700`, `text-slate-500`, `border-slate-200`, `border-neutral-800`, `bg-blue-600`).
Always use the centralized semantic design tokens:

- **Surfaces**:
  - `bg-surface-page`: Main background canvas
  - `bg-surface` (or `bg-surface-card`): Primary container, card, and table background
  - `bg-surface-subtle`: Secondary/nested wells and item cards
  - `bg-surface-muted`: Inactive buttons, chips, and input fields
  - `bg-surface-elevated`: Modals, slide drawers, dropdown menus
  - `bg-surface-hover`: Row or card hover state

- **Borders & Dividers**:
  - `border-subtle`: Default subtle border (e.g., cards, tables, containers)
  - `border-muted`: Interior sub-dividers and table row borders
  - `border-strong`: Focused inputs, active filter pills, emphasized borders

- **Typography & Content Hierarchy**:
  - `text-content-primary`: Primary headings, titles, active labels
  - `text-content-secondary`: Body text, readable explanations
  - `text-content-muted`: Secondary metadata, timestamps
  - `text-content-faint`: Table header titles, kickers, placeholder text

- **Lifecycle Status**:
  - `status.overdue` (`bg-status-overdue-bg`, `text-status-overdue-text`, `border-status-overdue-border`)
  - `status.inprogress` (`bg-status-inprogress-bg`, `text-status-inprogress-text`, `border-status-inprogress-border`)
  - `status.approved` (`bg-status-approved-bg`, `text-status-approved-text`, `border-status-approved-border`)
  - `status.reviewed` (`bg-status-reviewed-bg`, `text-status-reviewed-text`, `border-status-reviewed-border`)

---

## 2. Component Guidelines

### Profile & Department Avatars
- Never hardcode bright solid saturated avatar colors (`bg-blue-600`, `bg-rose-600`, etc.).
- Always use `getDepartmentAvatarStyle(role, category)` from `src/lib/utils.ts`.
- It applies soft 100/90 tinted backgrounds with 800-weight text and subtle borders across all departments (Product, Engineering, Security, AI, Finance, Revenue, Global, Strategy).
- Do not add hardcoded `text-white` to the avatar container.

### Status Badges
- Always use the `<Badge status={decision.status}>{decision.status}</Badge>` component from `src/components/ui/Badge.tsx`.
- Status pills use a uniform neutral gray wrapper (`bg-slate-100 text-slate-700 border border-slate-200/80` / `dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700`) and semantic Lucide icons (`AlertCircle`, `CheckCircle2`, `ArrowUpRight`, `CheckCheck`, `Clock`).

### Typography & Display Fonts
- `font-cal` (`Cal Sans`) is reserved strictly for the primary page title (`h1`) and top-level KPI metric numbers.
- All other UI elements, table column headers, filter controls, and body text must use the default clean sans-serif font.
- Table headers must remain uppercase with tracking (`text-[11px] font-semibold uppercase tracking-wider`).

### Tooltips
- Keep tooltips disabled or strictly minimal; avoid noisy layout shifts.

### Filter Toolbar
- Filter dropdowns in `DecisionTable.tsx` synchronize two-way with the `AdvancedFilterDrawer`.
- Ensure new filter dimensions follow the same dropdown pattern and use design tokens.
