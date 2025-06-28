import { formatDate } from './date.util';

describe('formatDate', () => {
  it('should format a Date object to the default format in UTC', () => {
    const date = new Date('2024-01-01T12:34:56Z');
    const formatted = formatDate(date);

    // Should be in UTC format
    expect(formatted).toBe('2024-01-01T12:34:56+00:00');
  });

  it('should format a date string to the default format in UTC', () => {
    const dateStr = '2024-01-01T12:34:56Z';
    const formatted = formatDate(dateStr);

    // Should be in UTC format
    expect(formatted).toBe('2024-01-01T12:34:56+00:00');
  });

  it('should format a Date object to a custom format', () => {
    const date = new Date('2024-01-01T12:34:56Z');
    const formatted = formatDate(date, 'YYYY/MM/DD HH:mm');

    // Custom format should show UTC time
    expect(formatted).toBe('2024/01/01 12:34');
  });

  it('should format a date string to a custom format', () => {
    const dateStr = '2024-01-01T12:34:56Z';
    const formatted = formatDate(dateStr, 'YYYY/MM/DD HH:mm');

    // Custom format should show UTC time
    expect(formatted).toBe('2024/01/01 12:34');
  });

  it('should handle different date formats consistently', () => {
    const date1 = new Date('2024-01-01T12:34:56Z');
    const date2 = '2024-01-01T12:34:56Z';

    const formatted1 = formatDate(date1);
    const formatted2 = formatDate(date2);

    // Both should produce the same result in UTC
    expect(formatted1).toBe(formatted2);
    expect(formatted1).toBe('2024-01-01T12:34:56+00:00');
  });

  it('should format with UTC timezone when specified', () => {
    const date = new Date('2024-01-01T12:34:56Z');
    const formatted = formatDate(date, 'YYYY-MM-DDTHH:mm:ssZ');

    // Should be in UTC format
    expect(formatted).toBe('2024-01-01T12:34:56+00:00');
  });

  it('should handle different timezone inputs and convert to UTC', () => {
    // Test with a date that would be different in local timezone
    const date = new Date('2024-01-01T00:00:00Z');
    const formatted = formatDate(date, 'YYYY-MM-DDTHH:mm:ssZ');

    // Should always be in UTC regardless of local timezone
    expect(formatted).toBe('2024-01-01T00:00:00+00:00');
  });
});
