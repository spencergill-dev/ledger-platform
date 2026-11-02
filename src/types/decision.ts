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
