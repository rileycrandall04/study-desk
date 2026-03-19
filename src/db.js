import Dexie from 'dexie';
import { DB_NAME } from './utils/constants';

const db = new Dexie(DB_NAME);

db.version(1).stores({
  journalEntries: '++id, title, createdAt, updatedAt, *tags',
  sessionState: 'key',
});

db.version(2).stores({
  journalEntries: '++id, title, createdAt, updatedAt, *tags',
  sessionState: 'key',
  conferenceTalks: 'key, year, month, speaker, [year+month]',
});

// v3: journalEntries moved to Firestore — table kept for schema compat but unused
db.version(3).stores({
  sessionState: 'key',
  conferenceTalks: 'key, year, month, speaker, [year+month]',
});

export default db;

/* ── Session State ─────────────────────────────────────────── */

export async function getSessionValue(key) {
  const row = await db.sessionState.get(key);
  return row?.value ?? null;
}

export async function setSessionValue(key, value) {
  await db.sessionState.put({ key, value });
}

/* ── Conference Talks ─────────────────────────────────────── */

export async function getConferenceTalks(year, month) {
  return db.conferenceTalks.where({ year, month }).toArray();
}

export async function getTalk(key) {
  return db.conferenceTalks.get(key);
}

export async function putTalk(talk) {
  await db.conferenceTalks.put(talk);
}

export async function putTalksBulk(talks) {
  await db.conferenceTalks.bulkPut(talks);
}

export async function deleteTalk(key) {
  await db.conferenceTalks.delete(key);
}

export async function searchTalks(query, max = 30) {
  if (!query || query.trim().length < 2) return [];
  const lower = query.toLowerCase();
  return db.conferenceTalks
    .filter(t =>
      (t.title || '').toLowerCase().includes(lower) ||
      (t.speaker || '').toLowerCase().includes(lower) ||
      (t.textMd || '').toLowerCase().includes(lower)
    )
    .limit(max)
    .toArray();
}

export async function getAllConferenceKeys() {
  return db.conferenceTalks.toCollection().primaryKeys();
}
