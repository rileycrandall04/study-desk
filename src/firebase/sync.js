import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, hasConfig } from './config';
import { getCurrentUser } from './auth';

const COLLECTIONS = {
  journalEntries: 'journalEntries',
};

/**
 * Sync a journal entry to Firestore.
 * Stores under users/{uid}/journalEntries/{entryId}.
 */
export async function syncEntryToCloud(entry) {
  if (!hasConfig || !db) return;
  const user = getCurrentUser();
  if (!user) return;

  const ref = doc(db, 'users', user.uid, COLLECTIONS.journalEntries, String(entry.id));
  await setDoc(ref, {
    ...entry,
    syncedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Fetch all journal entries from Firestore for the current user.
 */
export async function fetchEntriesFromCloud() {
  if (!hasConfig || !db) return [];
  const user = getCurrentUser();
  if (!user) return [];

  const ref = collection(db, 'users', user.uid, COLLECTIONS.journalEntries);
  const q = query(ref, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
}
