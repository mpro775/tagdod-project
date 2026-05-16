/**
 * Analytics Formatters — العملة YER والأرقام العربية والنسب
 */

export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('ar-YE').format(value);
};

export const formatCurrency = (
  value: number | undefined | null,
  currency = 'YER'
): string => {
  const n = value === undefined || value === null || isNaN(value) ? 0 : value;
  return `${new Intl.NumberFormat('ar-YE').format(n)} ${currency}`;
};

export const formatPercent = (value: number | undefined | null): string => {
  const n = value === undefined || value === null || isNaN(value) ? 0 : value;
  return `${Number(n).toFixed(1)}%`;
};

export const formatDateLabel = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('ar-YE', {
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatMonthLabel = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('ar-YE', {
      year: 'numeric',
      month: 'short',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('ar-YE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  // Show 0 decimals for bytes, 1 decimal for KB+, trim trailing .0
  const formatted = i === 0 ? String(Math.round(value)) : value.toFixed(1).replace(/\.0$/, '');
  return `${formatted} ${sizes[i]}`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m ${secs}s`;
};
