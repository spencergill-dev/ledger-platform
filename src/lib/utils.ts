import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function isPastDate(dateString: string): boolean {
  const target = new Date(dateString);
  const now = new Date();
  // Strip time for clean day-level comparison
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return target.getTime() < now.getTime();
}

export function getDaysOverdue(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - target.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export function getDaysElapsed(dateString: string): number {
  const start = new Date(dateString);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export function getInitials(name: string = ''): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (name.slice(0, 2) || 'EX').toUpperCase();
}

export function getDepartmentAvatarStyle(role: string = '', category: string = ''): string {
  const r = role.toLowerCase();
  const c = category.toLowerCase();

  // Product / Architecture / Core Systems (Muted Slate-Blue)
  if (
    r.includes('product') || 
    r.includes('architect') || 
    c.includes('product')
  ) {
    return 'bg-blue-100/90 text-blue-800 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/50 shadow-2xs';
  }

  // Engineering / Infrastructure / Technology / Telemetry (Muted Sage-Emerald)
  if (
    r.includes('infrastructure') || 
    r.includes('engineer') || 
    r.includes('devops') || 
    r.includes('technology') ||
    c.includes('infrastructure')
  ) {
    return 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/50 shadow-2xs';
  }

  // Security / Compliance / Information / CISO (Muted Lavender-Purple)
  if (
    r.includes('security') ||
    r.includes('information') ||
    r.includes('ciso') ||
    c.includes('security')
  ) {
    return 'bg-purple-100/90 text-purple-800 border border-purple-200/70 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900/50 shadow-2xs';
  }

  // AI & Machine Learning / Research (Muted Soft Violet)
  if (
    r.includes('ai') ||
    r.includes('research') ||
    c.includes('ai')
  ) {
    return 'bg-violet-100/90 text-violet-800 border border-violet-200/70 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-900/50 shadow-2xs';
  }

  // Finance / CFO (Muted Rose-Mauve)
  if (
    r.includes('finance') ||
    r.includes('cfo')
  ) {
    return 'bg-rose-100/90 text-rose-800 border border-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/50 shadow-2xs';
  }

  // Revenue / Growth / Sales / Commercial (Muted Sea-Teal)
  if (
    r.includes('revenue') ||
    r.includes('sales') ||
    r.includes('cro') ||
    r.includes('growth')
  ) {
    return 'bg-teal-100/90 text-teal-800 border border-teal-200/70 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900/50 shadow-2xs';
  }

  // Global Expansion / Market Entry (Muted Amber-Warm)
  if (
    r.includes('global') ||
    r.includes('expansion') ||
    c.includes('market')
  ) {
    return 'bg-amber-100/90 text-amber-800 border border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50 shadow-2xs';
  }

  // Corporate Strategy / Business Development (Muted Stone-Warm Gray)
  if (
    r.includes('strategy') ||
    r.includes('corporate')
  ) {
    return 'bg-stone-200/80 text-stone-800 border border-stone-300/70 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-800/60 shadow-2xs';
  }

  // Executive / Leadership / Default (Muted Slate)
  return 'bg-slate-200/80 text-slate-800 border border-slate-300/70 dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700 shadow-2xs';
}

export function getStakeholderAvatarStyle(stk: { role?: string; avatarColor?: string }): string {
  return getDepartmentAvatarStyle(stk.role || '');
}
