export type DecisionStatus = 
  | 'Draft' 
  | 'Approved' 
  | 'In Progress' 
  | 'Review Due' 
  | 'Reviewed';

export interface DecisionOwner {
  name: string;
  role: string;
  initials: string;
  avatarColor?: string;
}

export type StakeholderStance = 'support' | 'conditions' | 'dissent';

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  initials: string;
  stance: StakeholderStance;
  rationale: string;
  avatarColor?: string;
}

export interface Amendment {
  id: string;
  version: string;
  date: string;
  author: string;
  summary: string;
  changes: string;
}

export interface ActualsData {
  actualCapital: number;
  actualPaybackMonths: number;
  actualMetricValue: string;
  capitalVariancePercent: number; // e.g. +24.6% or -4.2%
  timeVarianceMonths: number; // e.g. +3
}

export interface OriginalEstimates {
  capitalAtRisk: number; // in USD
  expectedPaybackMonths: number;
  expectedAnnualImpact: string;
  primaryMetric: string;
  targetMetricValue: string;
}

export interface AlternativeConsidered {
  title: string;
  rationale: string;
  estimatedCost: number;
}

export interface RetrospectiveSnapshot {
  reviewedDate?: string;
  actualOutcomeSummary?: string;
  capitalVariancePercent?: number; // e.g. +14% or -5%
  timelineVarianceDays?: number; // e.g. +45 days
  keyLearnings?: string[];
}

export interface Decision {
  id: string;
  title: string;
  owner: DecisionOwner;
  status: DecisionStatus;
  targetReviewDate: string; // ISO format: 'YYYY-MM-DD'
  originalEstimates: OriginalEstimates;
  
  // Advanced Ledger Mechanics
  version?: string; // e.g. 'v1.0 Frozen', 'v2.1 Amended'
  versionStatus?: 'Frozen' | 'Amended' | 'Draft';
  stakeholders?: Stakeholder[];
  amendments?: Amendment[];
  actuals?: ActualsData;

  // Strategic intelligence extensions
  hypothesis: string;
  category: 'Infrastructure' | 'Market Entry' | 'Vendor Migration' | 'Product Core' | 'Capital Allocation';
  createdAt: string;
  alternativesConsidered?: AlternativeConsidered[];
  retrospectiveSnapshot?: RetrospectiveSnapshot;
}

export interface RetrospectiveInsight {
  id: string;
  decisionId: string;
  decisionTitle: string;
  headline: string;
  insight: string;
  dateLogged: string;
  impactTag: 'Variance Warning' | 'Capital Discipline' | 'Timeline Estimation' | 'Architecture';
}
