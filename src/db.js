import Dexie from 'dexie';
import { DB_NAME } from './utils/constants';

const db = new Dexie(DB_NAME);

db.version(1).stores({
  journalEntries: '++id, title, createdAt, updatedAt, *tags',
  sessionState: 'key',
});

export default db;

/* ── Journal Entries ───────────────────────────────────────── */

export async function getJournalEntries(limit = 50) {
  return db.journalEntries
    .orderBy('updatedAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getJournalEntry(id) {
  return db.journalEntries.get(id);
}

export async function addJournalEntry(entry) {
  const now = new Date().toISOString();
  const data = {
    title: '',
    html: '<p></p>',
    plainText: '',
    tags: [],
    ...entry,
    createdAt: now,
    updatedAt: now,
  };
  return db.journalEntries.add(data);
}

export async function updateJournalEntry(id, changes) {
  await db.journalEntries.update(id, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteJournalEntry(id) {
  await db.journalEntries.delete(id);
}

export async function searchJournalEntries(query, limit = 50) {
  if (!query || !query.trim()) return getJournalEntries(limit);
  const lower = query.toLowerCase();
  return db.journalEntries
    .orderBy('updatedAt')
    .reverse()
    .filter(e =>
      (e.title || '').toLowerCase().includes(lower) ||
      (e.plainText || '').toLowerCase().includes(lower) ||
      (e.tags || []).some(t => t.toLowerCase().includes(lower))
    )
    .limit(limit)
    .toArray();
}

/* ── Tags ─────────────────────────────────────────────────── */

export async function getAllTags() {
  const entries = await db.journalEntries.toArray();
  const tagSet = new Set();
  for (const e of entries) {
    if (e.tags) e.tags.forEach(t => tagSet.add(t));
  }
  return [...tagSet].sort();
}

/* ── Backup / Restore ─────────────────────────────────────── */

export async function exportAllEntries() {
  return db.journalEntries.toArray();
}

export async function importEntries(entries) {
  await db.journalEntries.bulkPut(entries);
}

/* ── Session State ─────────────────────────────────────────── */

export async function getSessionValue(key) {
  const row = await db.sessionState.get(key);
  return row?.value ?? null;
}

export async function setSessionValue(key, value) {
  await db.sessionState.put({ key, value });
}
