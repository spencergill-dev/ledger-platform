import { useState } from 'react';
import { MOCK_RECENT_INSIGHTS } from '../../data/mockData';
import { ChevronRight, Sparkles, Zap } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export function RecentInsightsCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeInsight = MOCK_RECENT_INSIGHTS[activeIndex];

  return (
    <div className="rounded-md border border-slate-200 dark:border-neutral-800 border-l-4 border-l-blue-600 dark:border-l-blue-500 bg-white dark:bg-[#171717] p-4 transition-colors shadow-2xs">
      <div className="flex items-start gap-3.5">
        {/* Sparkles icon container */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mt-0.5">
          <Sparkles className="h-5 w-5" />
        </div>

        {/* Content body */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Top line: Title + Headline + Source + Date */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Tooltip content="Synthesized organizational intelligence extracted from completed retrospective reviews">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Compounding Decision Memory
              </span>
            </Tooltip>
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              {activeInsight.headline}
            </span>
            <span className="text-slate-400 dark:text-neutral-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              Source: <span className="font-medium text-slate-700 dark:text-slate-300">{activeInsight.decisionTitle}</span>
            </span>
            <span className="text-slate-400 dark:text-neutral-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {activeInsight.dateLogged}
            </span>
          </div>

          {/* Insight Directive */}
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-normal leading-normal">
            {activeInsight.insight}
          </p>

          {/* Micro-footer */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0 fill-amber-500/20" />
              <span>Learnings automatically feed forward into upcoming decision evaluations</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span>Insight {activeIndex + 1} of {MOCK_RECENT_INSIGHTS.length}</span>
              <span className="text-gray-300 dark:text-neutral-700">•</span>
              <Tooltip content="Browse next organizational retrospective learning">
                <button
                  onClick={() => setActiveIndex((prev) => (prev + 1) % MOCK_RECENT_INSIGHTS.length)}
                  className="flex items-center gap-0.5 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <span>Next Insight</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
