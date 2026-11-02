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

  // Engineering / Infrastructure / Telemetry
  if (
    r.includes('infrastructure') || 
    r.includes('engineer') || 
    r.includes('devops') || 
    c.includes('infrastructure')
  ) {
    return 'bg-emerald-600 dark:bg-emerald-700 text-white shadow-2xs';
  }

  // Product / Architecture / Core Systems
  if (
    r.includes('product') || 
    r.includes('architect') || 
    c.includes('product')
  ) {
    return 'bg-blue-600 dark:bg-blue-700 text-white shadow-2xs';
  }

  // Executive / Leadership / Strategy / Revenue / Expansion (Default)
  return 'bg-slate-700 dark:bg-slate-600 text-white shadow-2xs';
}
