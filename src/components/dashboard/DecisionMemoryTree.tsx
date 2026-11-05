import React, { useState, useMemo } from 'react';
import { Decision } from '../../types/decision';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { 
  formatCurrency, 
  formatDate, 
  isPastDate, 
  getDaysOverdue, 
  cn, 
  getDepartmentAvatarStyle, 
  getInitials 
} from '../../lib/utils';
import { 
  GitFork, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  ChevronRight, 
  Layers, 
  CornerDownRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface DecisionMemoryTreeProps {
  decisions: Decision[];
  onSelectDecision?: (decision: Decision) => void;
  onOpenDeepDive?: (decision: Decision) => void;
  selectedDecisionId?: string | null;
}

export function DecisionMemoryTree({
  decisions,
  onSelectDecision,
  onOpenDeepDive,
  selectedDecisionId,
}: DecisionMemoryTreeProps) {
  const [selectedPillar, setSelectedPillar] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique strategic pillars
  const pillars = useMemo(() => {
    const set = new Set<string>();
    decisions.forEach(d => {
      if (d.strategicPillar) set.add(d.strategicPillar);
    });
    return Array.from(set);
  }, [decisions]);

  // Group decisions into trees by strategic pillar
  const treesByPillar = useMemo(() => {
    const filtered = decisions.filter(d => {
      const matchesPillar = selectedPillar === 'ALL' || d.strategicPillar === selectedPillar;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        d.id.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.hypothesis.toLowerCase().includes(q) ||
        d.owner.name.toLowerCase().includes(q);
      return matchesPillar && matchesSearch;
    });

    const pillarsMap: Record<string, { root: Decision[]; all: Decision[] }> = {};

    filtered.forEach(d => {
      const pillar = d.strategicPillar || 'Other Strategic Commitments';
      if (!pillarsMap[pillar]) {
        pillarsMap[pillar] = { root: [], all: [] };
      }
      pillarsMap[pillar].all.push(d);
      // Root decision if no parent in dataset or parent is not in same pillar
      if (!d.parentDecisionId) {
        pillarsMap[pillar].root.push(d);
      }
    });

    return pillarsMap;
  }, [decisions, selectedPillar, searchQuery]);

  // Helper to find children of a decision
  const getChildren = (parentId: string, pool: Decision[]) => {
    return pool.filter(d => d.parentDecisionId === parentId);
  };

  // Pillar Icons mapping
  const getPillarIcon = (pillar: string) => {
    if (pillar.includes('Security') || pillar.includes('Cloud')) return <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    if (pillar.includes('Revenue') || pillar.includes('Commercial')) return <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    if (pillar.includes('AI') || pillar.includes('Frontier')) return <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    return <Layers className="h-4 w-4 text-slate-500" />;
  };

  // Node Card renderer
  const renderDecisionNode = (decision: Decision, level: number = 0, pool: Decision[]) => {
    const isOverdue = decision.status === 'Review Due' && isPastDate(decision.targetReviewDate);
    const daysOverdue = isOverdue ? getDaysOverdue(decision.targetReviewDate) : 0;
    const isSelected = selectedDecisionId === decision.id;
    const children = getChildren(decision.id, pool);

    return (
      <div key={decision.id} className="relative flex flex-col space-y-3">
        {/* Branch Catalyst Callout (Why it branched) */}
        {decision.branchedReason && (
          <div className="flex items-center gap-2 pl-3 sm:pl-6 my-1">
            <CornerDownRight className="h-4 w-4 text-blue-500 shrink-0" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs font-sans">
              <span className="font-semibold font-mono text-[10px] uppercase tracking-wider text-blue-800 dark:text-blue-200">
                Strategic Branch Catalyst:
              </span>
              <span>"{decision.branchedReason}"</span>
            </div>
          </div>
        )}

        {/* Decision Node Card */}
        <div
          onClick={() => onSelectDecision?.(decision)}
          className={cn(
            "group relative p-4 sm:p-5 rounded-lg border transition-all cursor-pointer bg-surface shadow-2xs hover:shadow-md hover:border-border-strong",
            isSelected
              ? "border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20 dark:bg-blue-950/20"
              : "border-subtle",
            level === 0 ? "border-l-4 border-l-slate-900 dark:border-l-white" : "border-l-4 border-l-blue-500"
          )}
        >
          {/* Top Row: Meta Kicker */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-content-primary bg-surface-muted px-2 py-0.5 rounded border border-subtle">
                {decision.id}
              </span>

              {level === 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  Origin Root
                </span>
              )}

              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border",
                decision.version?.toLowerCase().includes('amended')
                  ? "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60"
                  : "bg-surface-muted text-content-muted border-border-muted"
              )}>
                {decision.version || 'v1.0 Frozen'}
              </span>

              <span className="text-xs text-content-faint hidden sm:inline">•</span>
              <span className="text-xs font-medium text-content-muted font-sans">
                {decision.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge status={decision.status}>{decision.status}</Badge>
              {isOverdue && (
                <span className="text-xs font-semibold text-status-overdue-text dark:text-rose-400 tabular-nums font-sans">
                  +{daysOverdue}d Delay
                </span>
              )}
            </div>
          </div>

          {/* Decision Title */}
          <h4 className="text-[15px] sm:text-base font-bold text-content-primary tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-sans mb-1.5">
            {decision.title}
          </h4>

          {/* Hypothesis Context */}
          <p className="text-xs text-content-secondary leading-relaxed font-sans line-clamp-2 mb-3.5">
            "{decision.hypothesis}"
          </p>

          {/* Bottom Row: Metrics & Sponsor */}
          <div className="pt-3 border-t border-border-muted flex items-center justify-between gap-3 flex-wrap text-xs text-content-muted">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Capital */}
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-content-faint" />
                <span className="font-semibold text-content-primary font-mono tabular-nums">
                  {formatCurrency(decision.originalEstimates.capitalAtRisk)}
                </span>
                <span className="text-[11px] text-content-faint">({decision.originalEstimates.expectedPaybackMonths}mo horizon)</span>
              </div>

              {/* Target Metric */}
              <div className="flex items-center gap-1.5 hidden md:flex">
                <Sparkles className="h-3.5 w-3.5 text-content-faint" />
                <span className="text-content-secondary truncate max-w-[200px]">
                  {decision.originalEstimates.primaryMetric}
                </span>
              </div>
            </div>

            {/* Sponsor Profile & Audit CTA */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0 font-sans shadow-2xs",
                  getDepartmentAvatarStyle(decision.owner.role, decision.category)
                )}>
                  {decision.owner.initials || getInitials(decision.owner.name)}
                </div>
                <span className="font-medium text-content-secondary font-sans hidden sm:inline">
                  {decision.owner.name}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDeepDive?.(decision);
                }}
                className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
                title="Open Audit Dossier"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recursive Children (Downstream Lineage Branches) */}
        {children.length > 0 && (
          <div className="relative pl-6 sm:pl-10 space-y-4 before:absolute before:left-3 sm:before:left-5 before:top-0 before:bottom-3 before:w-[2px] before:bg-blue-300 dark:before:bg-blue-900/60">
            {children.map(child => renderDecisionNode(child, level + 1, pool))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. FILTER & SEARCH TOOLBAR */}
      <div className="p-3.5 sm:p-4 rounded-lg border border-subtle bg-surface flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        {/* Pillar Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-content-muted mr-1 uppercase tracking-wider font-mono text-[10px]">
            Branch Pillar:
          </span>
          <button
            type="button"
            onClick={() => setSelectedPillar('ALL')}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
              selectedPillar === 'ALL'
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs"
                : "bg-surface-subtle text-content-secondary hover:bg-surface-hover border border-subtle"
            )}
          >
            All Pillars ({decisions.length})
          </button>
          {pillars.map(pillar => (
            <button
              key={pillar}
              type="button"
              onClick={() => setSelectedPillar(pillar)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5",
                selectedPillar === pillar
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs"
                  : "bg-surface-subtle text-content-secondary hover:bg-surface-hover border border-subtle"
              )}
            >
              {getPillarIcon(pillar)}
              <span>{pillar}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex items-center w-full md:w-64 shrink-0">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-content-faint pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lineage tree..."
            className="w-full h-8 pl-8 pr-2.5 rounded-md border border-subtle bg-surface-subtle text-xs text-content-primary placeholder:text-content-faint focus:outline-none focus:border-border-strong transition-colors font-sans"
          />
        </div>
      </div>

      {/* 2. STRATEGIC TREES BY PILLAR */}
      <div className="space-y-8">
        {Object.entries(treesByPillar).map(([pillarName, treeData]) => {
          const totalCapital = treeData.all.reduce((sum, d) => sum + d.originalEstimates.capitalAtRisk, 0);

          return (
            <div 
              key={pillarName} 
              className="p-5 sm:p-6 rounded-xl border border-subtle bg-surface-subtle/50 space-y-6 shadow-2xs"
            >
              {/* Pillar Branch Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-muted">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-surface border border-subtle shadow-2xs">
                    {getPillarIcon(pillarName)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-content-primary font-cal">
                      {pillarName}
                    </h3>
                    <p className="text-xs text-content-muted font-sans">
                      {treeData.all.length} commitments mapped across institutional evolution
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-content-muted">
                    Total Branch Capital: <strong className="text-content-primary font-semibold">{formatCurrency(totalCapital)}</strong>
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-semibold">
                    Branch Active
                  </span>
                </div>
              </div>

              {/* Branch Decision Nodes */}
              <div className="space-y-6 pl-1 sm:pl-2">
                {treeData.root.map(rootNode => renderDecisionNode(rootNode, 0, treeData.all))}
              </div>
            </div>
          );
        })}

        {Object.keys(treesByPillar).length === 0 && (
          <div className="py-16 text-center text-content-muted border border-subtle rounded-xl bg-surface">
            <GitFork className="h-8 w-8 mx-auto text-content-faint mb-2" />
            <p className="text-sm font-medium font-sans">No decisions match the selected pillar or search query.</p>
            <button
              onClick={() => {
                setSelectedPillar('ALL');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Reset tree filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
