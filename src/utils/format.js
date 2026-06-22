import { formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount) {
  const value = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyCompact(amount) {
  const value = parseFloat(amount) || 0;
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)}L`;
  return formatCurrency(value);
}

export function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(date));
}

export function formatRelative(date) {
  if (!date) return '—';
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  return formatDate(date);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export function formatPercent(value) {
  return `${parseFloat(value || 0).toFixed(1)}%`;
}
