import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeJournalEntries,
  addJournalEntryCloud,
  updateJournalEntryCloud,
  deleteJournalEntryCloud,
} from '../firebase/sync';
import { getSessionValue, setSessionValue } from '../db';

/* ── Journal Entries (Firestore) ──────────────────────────── */

/**
 * Reactive hook for journal entries list via Firestore.
 */
export function useJournalEntries(limit = 50) {
  const { user } = useAuth();
  const [entries, setEntries] = useState(undefined);

  useEffect(() => {
    if (!user) { setEntries([]); return; }
    return subscribeJournalEntries(user.uid, (all) => {
      setEntries(limit ? all.slice(0, limit) : all);
    });
  }, [user, limit]);

  const add = useCallback((entry) => {
    if (!user) return;
    return addJournalEntryCloud(user.uid, entry);
  }, [user]);

  const update = useCallback((id, changes) => {
    if (!user) return;
    return updateJournalEntryCloud(user.uid, id, changes);
  }, [user]);

  const remove = useCallback((id) => {
    if (!user) return;
    return deleteJournalEntryCloud(user.uid, id);
  }, [user]);

  return {
    entries: entries ?? [],
    loading: entries === undefined,
    add,
    update,
    remove,
  };
}

/**
 * Reactive hook for a single journal entry via Firestore.
 */
export function useJournalEntry(id) {
  const { user } = useAuth();
  const [allEntries, setAllEntries] = useState(undefined);

  useEffect(() => {
    if (!user) { setAllEntries([]); return; }
    return subscribeJournalEntries(user.uid, setAllEntries);
  }, [user]);

  const entry = useMemo(() => {
    if (!allEntries || !id) return null;
    return allEntries.find(e => e.id === id) ?? null;
  }, [allEntries, id]);

  const update = useCallback((entryId, changes) => {
    if (!user) return;
    return updateJournalEntryCloud(user.uid, entryId, changes);
  }, [user]);

  const remove = useCallback((entryId) => {
    if (!user) return;
    return deleteJournalEntryCloud(user.uid, entryId);
  }, [user]);

  return {
    entry,
    loading: allEntries === undefined,
    update,
    remove,
  };
}

/**
 * Reactive hook for searching journal entries (client-side filter on Firestore data).
 */
export function useJournalSearch(searchQuery, limit = 50) {
  const { user } = useAuth();
  const [allEntries, setAllEntries] = useState(undefined);

  useEffect(() => {
    if (!user) { setAllEntries([]); return; }
    return subscribeJournalEntries(user.uid, setAllEntries);
  }, [user]);

  const entries = useMemo(() => {
    if (!allEntries) return [];
    if (!searchQuery || !searchQuery.trim()) return allEntries.slice(0, limit);
    const lower = searchQuery.toLowerCase();
    return allEntries
      .filter(e =>
        (e.title || '').toLowerCase().includes(lower) ||
        (e.plainText || '').toLowerCase().includes(lower) ||
        (e.tags || []).some(t => t.toLowerCase().includes(lower))
      )
      .slice(0, limit);
  }, [allEntries, searchQuery, limit]);

  return {
    entries,
    loading: allEntries === undefined,
  };
}

/**
 * Reactive hook for all unique tags across entries (from Firestore).
 */
export function useAllTags() {
  const { user } = useAuth();
  const [allEntries, setAllEntries] = useState([]);

  useEffect(() => {
    if (!user) { setAllEntries([]); return; }
    return subscribeJournalEntries(user.uid, setAllEntries);
  }, [user]);

  return useMemo(() => {
    const tagSet = new Set();
    for (const e of allEntries) {
      if (e.tags) e.tags.forEach(t => tagSet.add(t));
    }
    return [...tagSet].sort();
  }, [allEntries]);
}

/* ── Session State (still Dexie — device-local) ───────────── */

/**
 * Reactive hook for session state (key-value persistence).
 * Returns [value, setValue] like useState.
 */
export function useSessionState(key, defaultValue = null) {
  const row = useLiveQuery(() => getSessionValue(key), [key]);
  const value = row !== undefined ? (row ?? defaultValue) : defaultValue;
  return [value, (val) => setSessionValue(key, val)];
}
