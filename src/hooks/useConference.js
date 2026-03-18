import { useState, useEffect, useRef } from 'react';
import { loadConferenceTalks, loadTalk } from '../utils/conferences';
import { searchTalks } from '../db';

/**
 * Hook to load talk metadata for a conference. Returns { talks, loading, error }.
 */
export function useConferenceTalks(year, month) {
  const [talks, setTalks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year || !month) { setTalks([]); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadConferenceTalks(year, month).then(t => {
      if (!cancelled) { setTalks(t); setLoading(false); }
    }).catch(err => {
      if (!cancelled) { setError(err.message); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [year, month]);

  return { talks, loading, error };
}

/**
 * Hook to load a single talk with full text. Returns { talk, loading, error }.
 */
export function useTalk(year, month, key) {
  const [talk, setTalk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!key) { setTalk(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadTalk(year, month, key).then(t => {
      if (!cancelled) { setTalk(t); setLoading(false); }
    }).catch(err => {
      if (!cancelled) { setError(err.message); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [year, month, key]);

  return { talk, loading, error };
}

/**
 * Hook for debounced conference talk search. Returns { results, searching }.
 */
export function useConferenceSearch(query, delay = 400) {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(() => {
      searchTalks(query, 30).then(r => {
        setResults(r);
        setSearching(false);
      });
    }, delay);
    return () => clearTimeout(timerRef.current);
  }, [query, delay]);

  return { results, searching };
}
