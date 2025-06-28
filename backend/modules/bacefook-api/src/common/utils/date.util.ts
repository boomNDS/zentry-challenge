import * as dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with UTC plugin
dayjs.default.extend(utc);

/**
 * Formats a date using dayjs with UTC timezone.
 * @param date - The date to format (Date or string)
 * @param format - The format string (default: 'YYYY-MM-DDTHH:mm:ssZ')
 * @returns The formatted date string in UTC
 */
export function formatDate(
  date: Date | string,
  format = 'YYYY-MM-DDTHH:mm:ssZ',
): string {
  return dayjs.default.utc(date).format(format);
}
