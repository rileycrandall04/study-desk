import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

/* ── Helpers ──────────────────────────────────────────────── */

function userCollection(uid, name) {
  return collection(db, 'users', uid, name);
}

function userDoc(uid, collName, docId) {
  return doc(db, 'users', uid, collName, docId);
}

/* ── Journal Entries ──────────────────────────────────────── */

export async function addJournalEntryCloud(uid, entry) {
  const now = new Date().toISOString();
  const data = {
    title: '',
    html: '<p></p>',
    plainText: '',
    tags: [],
    ...entry,
    createdAt: now,
    updatedAt: now,
    syncedAt: serverTimestamp(),
  };
  const ref = await addDoc(userCollection(uid, 'journalEntries'), data);
  return ref.id;
}

export async function updateJournalEntryCloud(uid, id, changes) {
  const ref = userDoc(uid, 'journalEntries', id);
  await updateDoc(ref, {
    ...changes,
    updatedAt: new Date().toISOString(),
    syncedAt: serverTimestamp(),
  });
}

export async function deleteJournalEntryCloud(uid, id) {
  await deleteDoc(userDoc(uid, 'journalEntries', id));
}

export function subscribeJournalEntries(uid, callback) {
  const q = query(
    userCollection(uid, 'journalEntries'),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(entries);
  });
}

export async function fetchAllJournalEntries(uid) {
  const q = query(
    userCollection(uid, 'journalEntries'),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function importJournalEntriesCloud(uid, entries) {
  const batch = [];
  for (const entry of entries) {
    const { id: _id, ...data } = entry;
    batch.push(addDoc(userCollection(uid, 'journalEntries'), {
      ...data,
      syncedAt: serverTimestamp(),
    }));
  }
  await Promise.all(batch);
}

/* ── Scripture Highlights ─────────────────────────────────── */

export function subscribeScriptureHighlights(uid, callback) {
  const q = query(userCollection(uid, 'scriptureHighlights'));
  return onSnapshot(q, (snapshot) => {
    const highlights = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(highlights);
  });
}

export async function setScriptureHighlight(uid, highlight) {
  // Use a deterministic key: volume-book-chapter-verse
  const key = `${highlight.volume}-${highlight.book}-${highlight.chapter}-${highlight.verse}`;
  const ref = userDoc(uid, 'scriptureHighlights', key);
  await setDoc(ref, {
    ...highlight,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function removeScriptureHighlight(uid, key) {
  await deleteDoc(userDoc(uid, 'scriptureHighlights', key));
}

/* ── Talk Highlights ──────────────────────────────────────── */

export function subscribeTalkHighlights(uid, callback) {
  const q = query(userCollection(uid, 'talkHighlights'));
  return onSnapshot(q, (snapshot) => {
    const highlights = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(highlights);
  });
}

export async function setTalkHighlight(uid, highlight) {
  // Use talkKey-paragraphIndex as doc id
  const key = `${highlight.talkKey}-${highlight.paragraphIndex}`;
  const ref = userDoc(uid, 'talkHighlights', key);
  await setDoc(ref, {
    ...highlight,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function removeTalkHighlight(uid, key) {
  await deleteDoc(userDoc(uid, 'talkHighlights', key));
}
