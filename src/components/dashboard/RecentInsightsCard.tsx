import { useState } from 'react';
import { MOCK_RECENT_INSIGHTS } from '../../data/mockData';
import { ChevronRight, Sparkles } from 'lucide-react';

export function RecentInsightsCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeInsight = MOCK_RECENT_INSIGHTS[activeIndex];

  return (
    <div className="rounded-md border border-subtle bg-surface p-4 transition-colors shadow-2xs space-y-2">
      {/* Top line: Inline System Icon + Bold Title + Muted Upper Kicker */}
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
        <span className="font-bold text-content-primary text-sm font-sans">
          Compounding Decision Memory
        </span>
        <span className="font-mono text-[10px] font-semibold text-content-faint uppercase tracking-wider">
          {activeInsight.headline}
        </span>
      </div>

      {/* Main Synthesized System Insight */}
      <p className="text-sm font-medium text-content-primary leading-relaxed font-sans">
        {activeInsight.insight}
      </p>

      {/* Micro-footer: Relocated Source Metadata (Left) + Pagination (Right) */}
      <div className="flex items-center justify-between pt-1 text-xs text-content-muted">
        <div className="flex items-center gap-2 text-xs text-content-muted truncate">
          <span>
            Source: <span className="font-medium text-content-secondary">{activeInsight.decisionTitle}</span>
          </span>
          <span className="text-border-muted">•</span>
          <span>{activeInsight.dateLogged}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-content-muted shrink-0">
          <span>Insight {activeIndex + 1} of {MOCK_RECENT_INSIGHTS.length}</span>
          <span className="text-border-muted">•</span>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % MOCK_RECENT_INSIGHTS.length)}
            className="flex items-center gap-0.5 font-medium text-content-secondary hover:text-content-primary transition-colors"
          >
            <span>Next Insight</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
