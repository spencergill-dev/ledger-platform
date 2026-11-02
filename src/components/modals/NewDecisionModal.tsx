import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Decision } from '../../types/decision';

interface NewDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDecision: (decision: Decision) => void;
}

export function NewDecisionModal({ isOpen, onClose, onAddDecision }: NewDecisionModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Decision['category']>('Vendor Migration');
  const [ownerName, setOwnerName] = useState('Sarah Lin');
  const [ownerRole, setOwnerRole] = useState('VP of Product');
  const [capital, setCapital] = useState('350000');
  const [hypothesis, setHypothesis] = useState('');
  const [targetDate, setTargetDate] = useState('2027-05-01');
  const [doNothingRationale, setDoNothingRationale] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !hypothesis.trim()) return;

    const newDecision: Decision = {
      id: `DEC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title,
      category,
      owner: {
        name: ownerName,
        role: ownerRole,
        initials: ownerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        avatarColor: 'bg-black/[0.04] text-gray-800',
      },
      status: 'Approved',
      targetReviewDate: targetDate,
      hypothesis,
      createdAt: new Date().toISOString().split('T')[0],
      originalEstimates: {
        capitalAtRisk: Number(capital) || 250000,
        expectedPaybackMonths: 12,
        expectedAnnualImpact: `ROI modeled on milestone completion`,
        primaryMetric: 'Target Unit Economics',
        targetMetricValue: 'Achieve net operating margin gain',
      },
      alternativesConsidered: [
        {
          title: 'Do Nothing (Status Quo Baseline)',
          rationale: doNothingRationale || 'Preserves capital short-term but incurs long-term technical and competitive debt.',
          estimatedCost: 0,
        },
      ],
    };

    onAddDecision(newDecision);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dim Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40"
        />

        {/* Modal Window: Solid bg-white, border-black/[0.06], multi-layered shadow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 6 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="relative w-full max-w-xl overflow-hidden rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#171717] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04)] z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white font-sans">
                Record Strategic Decision
              </h2>
              <p className="mt-1 text-xs text-gray-500 font-sans">
                Record an irreversible corporate bet. Creates an immutable snapshot for retrospective audit.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-sans">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Strategic Bet Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. $400k Migration from DynamoDB to TiDB for Global Sharding"
                className="w-full rounded-md border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#202020] focus:border-black/20 dark:focus:border-white/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Decision['category'])}
                  className="w-full rounded-md border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] px-2.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#202020] focus:border-black/20 dark:focus:border-white/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  <option value="Vendor Migration">Vendor Migration</option>
                  <option value="Market Entry">Market Entry</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Product Core">Product Core</option>
                  <option value="Capital Allocation">Capital Allocation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Capital at Risk (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-sans">$</span>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                    className="w-full rounded-md border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] pl-6 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#202020] focus:border-black/20 dark:focus:border-white/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] font-sans font-medium tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Core Strategic Hypothesis
              </label>
              <textarea
                required
                rows={2}
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="What must be true for this bet to be a success? Document quantifiable expectations."
                className="w-full rounded-md border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#202020] focus:border-black/20 dark:focus:border-white/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Counterfactual: The "Do Nothing" Alternative
              </label>
              <input
                type="text"
                value={doNothingRationale}
                onChange={(e) => setDoNothingRationale(e.target.value)}
                placeholder="What is the phantom cost of inaction?"
                className="w-full rounded-md border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#202020] focus:border-black/20 dark:focus:border-white/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Retrospective Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-md border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] px-2.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#202020] focus:border-black/20 dark:focus:border-white/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Executive Sponsor
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-md border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#202020] focus:border-black/20 dark:focus:border-white/30 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            {/* Anti-Pattern Guard Notice */}
            <div className="rounded-md bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-3 flex items-start gap-2.5 text-xs text-gray-500">
              <ShieldAlert className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
              <span>
                <strong>System Notice:</strong> Decisions track irreversible commitments and forcing retrospectives. Do not enter tactical tasks or sprints.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06]">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-md border-black/[0.08] dark:border-white/[0.1]">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5 font-medium bg-[#1D4ED8] hover:bg-blue-700 text-white shadow-xs rounded-md">
                <Check className="h-3.5 w-3.5" />
                Commit Decision
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
