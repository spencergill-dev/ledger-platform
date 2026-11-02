import { Decision, RetrospectiveInsight } from '../types/decision';

export const MOCK_DECISIONS: Decision[] = [
  {
    id: "DEC-2026-089",
    title: "EU Market Entry & Sovereign Cloud Infrastructure",
    owner: {
      name: "Helena Rostova",
      role: "VP of Global Expansion",
      initials: "HR",
      avatarColor: "bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/40",
    },
    status: "Review Due",
    targetReviewDate: "2026-08-15", // In the past -> Retrospective Overdue!
    category: "Market Entry",
    hypothesis: "Establishing dedicated Frankfurt and Dublin sovereign data enclaves will unblock $3.8M in stalled DACH enterprise deals requiring zero US CLOUD Act exposure.",
    createdAt: "2025-11-10",
    originalEstimates: {
      capitalAtRisk: 650000,
      expectedPaybackMonths: 9,
      expectedAnnualImpact: "+$3.8M ARR expansion",
      primaryMetric: "DACH Enterprise Closed-Won",
      targetMetricValue: "€3.5M ARR within 6 mos",
    },
    alternativesConsidered: [
      {
        title: "Do Nothing (Remain US-only)",
        rationale: "Rejected: Loss of market leadership; competitor secured exclusive tender with Siemens.",
        estimatedCost: 0,
      },
      {
        title: "Third-party reseller white-labeling in Munich",
        rationale: "Rejected: Squeezed gross margins by 42% and introduced unacceptable SLA liability.",
        estimatedCost: 280000,
      },
    ],
  },
  {
    id: "DEC-2026-104",
    title: "$200k Salesforce Migration to Consolidated Hubspot Suite",
    owner: {
      name: "Marcus Vance",
      role: "Chief Revenue Officer",
      initials: "MV",
      avatarColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    status: "Approved",
    targetReviewDate: "2027-04-01",
    category: "Vendor Migration",
    hypothesis: "Collapsing fragmented Salesforce, Marketo, and Zendesk seats into a unified CRM will eliminate $180k in annual software bloat and raise pipeline velocity by 22%.",
    createdAt: "2026-10-02",
    originalEstimates: {
      capitalAtRisk: 200000,
      expectedPaybackMonths: 14,
      expectedAnnualImpact: "$180k net annual OpEx reduction",
      primaryMetric: "Sales Cycle Length",
      targetMetricValue: "34 days (down from 49)",
    },
    alternativesConsidered: [
      {
        title: "Negotiate Enterprise Salesforce ELA",
        rationale: "Salesforce demanded 3-year lock-in with minimum 15% annual seat growth clause.",
        estimatedCost: 480000,
      },
      {
        title: "Do Nothing (Maintain 3 disparate SaaS tools)",
        rationale: "Produces $65k/quarter in custom sync middleware maintenance and duplicate data.",
        estimatedCost: 260000,
      },
    ],
  },
  {
    id: "DEC-2026-074",
    title: "Datadog to In-House ClickHouse Telemetry Pipeline",
    owner: {
      name: "Devon Chen",
      role: "Head of Infrastructure",
      initials: "DC",
      avatarColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
    status: "Review Due",
    targetReviewDate: "2026-09-30", // In the past -> Retrospective Overdue!
    category: "Infrastructure",
    hypothesis: "Migrating from managed Datadog APM and log indexing to self-hosted ClickHouse & OpenTelemetry will cut logging bills from $45k/mo to under $8k/mo at scale.",
    createdAt: "2026-01-18",
    originalEstimates: {
      capitalAtRisk: 320000,
      expectedPaybackMonths: 8,
      expectedAnnualImpact: "$440k annual recurring savings",
      primaryMetric: "Observability Cost / Event",
      targetMetricValue: "< $0.00004 per indexed span",
    },
    alternativesConsidered: [
      {
        title: "Aggressive Datadog Sampling (Discard 70% of traces)",
        rationale: "Crippled incident root-cause investigations during Tier-1 outages.",
        estimatedCost: 95000,
      },
      {
        title: "Switch to Grafana Cloud Enterprise",
        rationale: "Saved only 18% with identical volume spikes during DDOS stress tests.",
        estimatedCost: 210000,
      },
    ],
  },
  {
    id: "DEC-2026-112",
    title: "Core Billing Engine v3 (Usage-Based Metering Architecture)",
    owner: {
      name: "Siddharth Nair",
      role: "Principal Architect",
      initials: "SN",
      avatarColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    status: "In Progress",
    targetReviewDate: "2027-02-28",
    category: "Product Core",
    hypothesis: "Replacing fixed subscription tiers with high-precision idempotency token metering will unlock enterprise expansion revenue and curb resource hogging by 40%.",
    createdAt: "2026-08-20",
    originalEstimates: {
      capitalAtRisk: 450000,
      expectedPaybackMonths: 11,
      expectedAnnualImpact: "+28% Net Revenue Retention (NRR)",
      primaryMetric: "Net Revenue Retention",
      targetMetricValue: "> 132% NRR across top quartile",
    },
    alternativesConsidered: [
      {
        title: "Stripe Billing Metering Add-on",
        rationale: "0.8% take rate on gross processing volume exceeds our target unit margins.",
        estimatedCost: 310000,
      },
    ],
  },
  {
    id: "DEC-2026-042",
    title: "Enterprise SSO & FedRAMP In-Process Fast-Track",
    owner: {
      name: "Aria Thorne",
      role: "Chief Information Security Officer",
      initials: "AT",
      avatarColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    status: "Reviewed",
    targetReviewDate: "2026-06-15",
    category: "Capital Allocation",
    hypothesis: "Achieving FedRAMP moderate sponsorship will qualify us for multi-million federal agency procurement deals previously blocked by security audit requirements.",
    createdAt: "2025-09-01",
    originalEstimates: {
      capitalAtRisk: 520000,
      expectedPaybackMonths: 12,
      expectedAnnualImpact: "$2.4M new public sector pipeline",
      primaryMetric: "Federal Deals in Stage 3+",
      targetMetricValue: "3 active agency pilots",
    },
    retrospectiveSnapshot: {
      reviewedDate: "2026-06-20",
      actualOutcomeSummary: "Secured Department of Energy and Veterans Affairs authorizations; booked $3.1M in year-one contracts (129% of target estimate).",
      capitalVariancePercent: -8.5, // Came under budget!
      timelineVarianceDays: 24, // 24 days delayed due to 3PAO auditor backlog
      keyLearnings: [
        "Federal security reviews require specialized legal counsel early to avoid vendor boilerplate amendments.",
        "Underestimated third-party assessor backlog by ~6 weeks, but customer willingness to pay was higher than forecasted."
      ],
    },
  },
  {
    id: "DEC-2026-120",
    title: "Seed-Stage Asset Acquisition of VectorDB Startup 'IndexAI'",
    owner: {
      name: "Catherine Brody",
      role: "VP of Corporate Strategy",
      initials: "CB",
      avatarColor: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
    },
    status: "Draft",
    targetReviewDate: "2027-06-30",
    category: "Capital Allocation",
    hypothesis: "Acquiring the 4-person IndexAI engineering core and their distributed HNSW algorithm accelerates our hybrid search delivery by 14 months.",
    createdAt: "2026-10-24",
    originalEstimates: {
      capitalAtRisk: 1200000,
      expectedPaybackMonths: 20,
      expectedAnnualImpact: "14-month time-to-market acceleration",
      primaryMetric: "Query Latency at 50M Vectors",
      targetMetricValue: "< 8.5ms P99",
    },
    alternativesConsidered: [
      {
        title: "Internal R&D build using pgvector",
        rationale: "Internal team would need 12-16 months with high risk of missing enterprise GenAI buying wave.",
        estimatedCost: 850000,
      },
    ],
  },
];

export const MOCK_RECENT_INSIGHTS: RetrospectiveInsight[] = [
  {
    id: "INS-001",
    decisionId: "DEC-2026-042",
    decisionTitle: "Enterprise SSO & FedRAMP Fast-Track",
    headline: "Timeline Variance Reality",
    insight: "We consistently underestimate external compliance and 3PAO auditor scheduling backlogs by ~30%. Plan a mandatory 45-day buffer into all regulatory go-to-market bets.",
    dateLogged: "June 2026 Retrospective",
    impactTag: "Timeline Estimation",
  },
  {
    id: "INS-002",
    decisionId: "DEC-2025-018",
    decisionTitle: "Data Lakehouse Snowflake to Iceberg",
    headline: "Hidden 'Do Nothing' Cost Multiplier",
    insight: "Explicitly modeling the 'Do Nothing' alternative revealed $140k in phantom compute sprawl. Rigorous counterfactual baselines prevent false ROI claims.",
    dateLogged: "May 2026 Retrospective",
    impactTag: "Capital Discipline",
  },
];
