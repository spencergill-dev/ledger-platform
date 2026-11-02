# DecideOS — Strategic Decision Intelligence Platform

A high-contrast, aggressively minimalist decision intelligence platform inspired by Linear and Vercel. 

### Product Context
Companies make massive $500k+ bets (market entries, vendor migrations, architectural shifts), but when project leads leave, context is lost. DecideOS preserves:
1. The original hypothesis and expected unit economics.
2. The alternatives considered (including the critical "Do Nothing" counterfactual).
3. Automated, forced 6-month retrospectives comparing expectations against reality.

### Anti-Pattern Rule
**This is NOT a project management tool.** No Kanban boards, Gantt charts, tickets, tasks, or sprints exist here. We exclusively track:
- **Decisions**: High-stakes, irreversible executive commitments.
- **Alternatives**: Counterfactual options considered and rejected.
- **Snapshots**: Hypothesis and financial modeling at time of commit.
- **Retrospectives**: Automated 6-month variance audits against reality.

---

### Stack & Architecture
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom semantic design tokens (`src/index.css` & `tailwind.config.js`)
- **Micro-Interactions**: Framer Motion
- **Icons**: Lucide React
- **Theme**: Dark/Light mode toggle with persistence and system preference sync
- **Data Layer**: Strongly-typed `Decision` schema in `src/types/decision.ts` and seeded in `src/data/mockData.ts`

---

### Design Token Architecture (Rules for AI & Developers)
To tweak contrast, change dark mode depth, or adjust borders in the future, you no longer need to edit dozens of individual component files. Simply modify the CSS variables in `src/index.css` or the token definitions in `tailwind.config.js`. All cards, tables, text elements, and badges across the application will update automatically.

- **Surfaces**: `bg-surface-page`, `bg-surface` (`bg-surface-card`), `bg-surface-subtle`, `bg-surface-muted`, `bg-surface-elevated`, `bg-surface-hover`
- **Borders**: `border-subtle`, `border-muted`, `border-strong`
- **Typography**: `text-content-primary`, `text-content-secondary`, `text-content-muted`, `text-content-faint`
- **Status Badges**: Use `<Badge status={decision.status} />` from `src/components/ui/Badge.tsx`.
- **Department Avatars**: Use `getDepartmentAvatarStyle(role, category)` in `src/lib/utils.ts`.
- See `AGENTS.md` and `GEMINI.md` for full instructions.

---

### Step 1 Deliverables Implemented
1. **Data Layer (`src/data/mockData.ts`)**: Seeded with real high-stakes decisions:
   - *EU Market Entry & Sovereign Cloud* (Status: `Review Due`, past target date -> triggers **Retrospective Overdue** alert)
   - *$200k Salesforce Migration to Consolidated Hubspot Suite* (Status: `Approved`)
   - *Datadog to In-House ClickHouse Telemetry Pipeline* (Status: `Review Due`, past target date)
   - *Core Billing Engine v3* (Status: `In Progress`)
   - *Enterprise SSO & FedRAMP Fast-Track* (Status: `Reviewed`, with retrospective analysis)
   - *Asset Acquisition of VectorDB Startup 'IndexAI'* (Status: `Draft`)
2. **Global Navigation Shell (`src/components/layout/Header.tsx`)**:
   - High-contrast DecideOS branding
   - Real-time capital at risk summary & overdue alerts ticker
   - Smooth Theme Toggle (Dark / Light)
   - Quick action to record new strategic decisions
3. **Primary Global Feed (`src/components/dashboard/DecisionTable.tsx`)**:
   - Rich, data-dense table with capital at risk, owners, review dates, and status badges.
   - **Critical Overdue Logic**: Pulsating high-contrast red warning badge (`Retrospective Overdue`) on rows where status is `Review Due` and `targetReviewDate` is in the past.
   - Interactive micro-drawers: Click any row to expand the hypothesis, alternatives considered, and retrospective outcome.
4. **Recent Insights Card (`src/components/dashboard/RecentInsightsCard.tsx`)**:
   - Compounding decision memory widget surfacing synthesized lessons learned from past retrospectives.
