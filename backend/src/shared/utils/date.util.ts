/**
 * Utility functions for date and timezone handling
 */

/**
 * Default timezone for Yemen (Asia/Aden)
 */
export const YEMEN_TIMEZONE = 'Asia/Aden';

/**
 * Convert a date to Yemen timezone (Asia/Aden)
 * Note: JavaScript Date objects are always stored in UTC internally.
 * This function is mainly for documentation purposes. 
 * For actual timezone conversion, use formatYemenDate or handle it on the client side.
 * 
 * @param date - The date to convert (can be Date, string, or number)
 * @returns The same Date object (dates are always stored in UTC)
 * @deprecated Use formatYemenDate for display purposes instead
 */
export function toYemenTime(date: Date | string | number): Date {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return new Date();
  }

  // JavaScript Date objects are always stored in UTC internally
  // The timezone conversion should be done at display time, not storage time
  return dateObj;
}

/**
 * Format a date to Yemen timezone string
 * 
 * @param date - The date to format
 * @param format - Optional format string (default: ISO string)
 * @returns Formatted date string in Yemen timezone
 */
export function formatYemenDate(
  date: Date | string | number,
  format?: 'iso' | 'date' | 'datetime',
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '';
  }

  // Use Intl.DateTimeFormat to format with Yemen timezone
  const formatter = new Intl.DateTimeFormat('ar-YE', {
    timeZone: YEMEN_TIMEZONE,
    year: 'numeric',
    month: format === 'date' ? '2-digit' : 'long',
    day: '2-digit',
    hour: format === 'datetime' || format === undefined ? '2-digit' : undefined,
    minute: format === 'datetime' || format === undefined ? '2-digit' : undefined,
    second: format === 'datetime' || format === undefined ? '2-digit' : undefined,
    hour12: false,
  });

  return formatter.format(dateObj);
}

/**
 * Get current date/time in Yemen timezone
 * 
 * @returns Current date adjusted to Yemen timezone
 */
export function getYemenNow(): Date {
  return toYemenTime(new Date());
}

