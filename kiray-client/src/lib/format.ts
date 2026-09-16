/**
 * Formats price with currency code and standard separators.
 * Example: 25000 -> "ETB 25,000 / mo"
 */
export function formatPrice(amount: number, currency: string = 'ETB'): string {
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  return `${currency} ${formatted} / mo`;
}

/**
 * Formats amount with ETB currency label.
 * Example: 25000 -> "25,000 ETB"
 */
export function formatETB(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 ETB';
  return `${new Intl.NumberFormat('en-US').format(amount)} ETB`;
}

/**
 * Formats property area with metric or imperial units.
 * Example: (120, 'sqm') -> "120 m²"
 */
export function formatArea(area?: number, unit: 'sqm' | 'sqft' = 'sqm'): string {
  if (typeof area !== 'number' || area <= 0) return '—';
  const unitLabel = unit === 'sqm' ? 'm²' : 'sqft';
  return `${new Intl.NumberFormat('en-US').format(area)} ${unitLabel}`;
}

/**
 * Formats an ISO date string to a localized date.
 * Example: "2026-09-14T22:00:00Z" -> "Sep 14, 2026"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return '—';
  }
}

/**
 * Returns relative time ago (e.g. "2 hours ago", "yesterday", "3 days ago").
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

    return formatDate(dateString);
  } catch {
    return '—';
  }
}
