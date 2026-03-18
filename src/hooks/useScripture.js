import { useState, useEffect, useRef } from 'react';
import { loadVolume, searchScriptures } from '../utils/scriptures';

/**
 * Hook to load a scripture volume by ID. Returns { data, loading }.
 */
export function useVolume(volumeId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!volumeId) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    loadVolume(volumeId).then(d => {
      if (!cancelled) { setData(d); setLoading(false); }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [volumeId]);

  return { data, loading };
}

/**
 * Hook for debounced scripture search. Returns { results, searching }.
 */
export function useScriptureSearch(query, delay = 400) {
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
      searchScriptures(query, 50).then(r => {
        setResults(r);
        setSearching(false);
      });
    }, delay);
    return () => clearTimeout(timerRef.current);
  }, [query, delay]);

  return { results, searching };
}
