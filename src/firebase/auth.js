import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, hasConfig } from './config';

export function signInWithGoogle() {
  if (!auth || !googleProvider) {
    console.warn('Firebase not configured — running in offline-only mode');
    return Promise.resolve(null);
  }
  return signInWithPopup(auth, googleProvider);
}

export function signOut() {
  if (!auth) return Promise.resolve();
  return firebaseSignOut(auth);
}

export function onAuthStateChanged(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth?.currentUser ?? null;
}

export { hasConfig };
