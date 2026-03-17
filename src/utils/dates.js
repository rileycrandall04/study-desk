import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { DATE_GROUPS } from './constants';

/**
 * Format a date string for display in the sidebar.
 * e.g. "Mar 16, 2026"
 */
export function formatShort(dateStr) {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format a date string for the editor header.
 * e.g. "Sunday, March 16, 2026"
 */
export function formatFull(dateStr) {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format a date string as relative.
 * e.g. "Today", "Yesterday", "Mar 14"
 */
export function formatRelative(dateStr) {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  } catch {
    return dateStr;
  }
}

/**
 * Get the date group label for grouping entries in the sidebar.
 */
export function getDateGroup(dateStr) {
  if (!dateStr) return DATE_GROUPS.EARLIER;
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return DATE_GROUPS.TODAY;
    if (isYesterday(date)) return DATE_GROUPS.YESTERDAY;
    if (isThisWeek(date)) return DATE_GROUPS.THIS_WEEK;
    return DATE_GROUPS.EARLIER;
  } catch {
    return DATE_GROUPS.EARLIER;
  }
}

/**
 * Group an array of entries by date group.
 * Returns an array of { label, entries } objects.
 */
export function groupEntriesByDate(entries) {
  const groups = {};
  const order = [DATE_GROUPS.TODAY, DATE_GROUPS.YESTERDAY, DATE_GROUPS.THIS_WEEK, DATE_GROUPS.EARLIER];

  for (const entry of entries) {
    const group = getDateGroup(entry.updatedAt || entry.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(entry);
  }

  return order
    .filter(label => groups[label]?.length > 0)
    .map(label => ({ label, entries: groups[label] }));
}
