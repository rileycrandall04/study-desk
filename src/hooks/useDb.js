import { useLiveQuery } from 'dexie-react-hooks';
import {
  getJournalEntries,
  getJournalEntry,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries,
  getAllTags,
  getSessionValue,
  setSessionValue,
} from '../db';

/**
 * Reactive hook for journal entries list.
 */
export function useJournalEntries(limit = 50) {
  const entries = useLiveQuery(() => getJournalEntries(limit), [limit]);
  return {
    entries: entries ?? [],
    loading: entries === undefined,
    add: addJournalEntry,
    update: updateJournalEntry,
    remove: deleteJournalEntry,
  };
}

/**
 * Reactive hook for a single journal entry.
 */
export function useJournalEntry(id) {
  const entry = useLiveQuery(
    () => (id ? getJournalEntry(id) : Promise.resolve(null)),
    [id]
  );
  return {
    entry: entry ?? null,
    loading: entry === undefined,
    update: updateJournalEntry,
    remove: deleteJournalEntry,
  };
}

/**
 * Reactive hook for searching journal entries.
 */
export function useJournalSearch(query, limit = 50) {
  const entries = useLiveQuery(
    () => searchJournalEntries(query, limit),
    [query, limit]
  );
  return {
    entries: entries ?? [],
    loading: entries === undefined,
  };
}

/**
 * Reactive hook for all unique tags across entries.
 */
export function useAllTags() {
  const tags = useLiveQuery(() => getAllTags(), []);
  return tags ?? [];
}

/**
 * Reactive hook for session state (key-value persistence).
 * Returns [value, setValue] like useState.
 */
export function useSessionState(key, defaultValue = null) {
  const row = useLiveQuery(() => getSessionValue(key), [key]);
  const value = row !== undefined ? (row ?? defaultValue) : defaultValue;
  return [value, (val) => setSessionValue(key, val)];
}
