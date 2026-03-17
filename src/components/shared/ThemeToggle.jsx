import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getSessionValue, setSessionValue } from '../../db';

/**
 * Dark mode toggle button. Persists preference in Dexie sessionState.
 */
export default function ThemeToggle({ showLabel = false }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    getSessionValue('darkMode').then(val => {
      const isDark = val === true;
      setDark(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    });
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    setSessionValue('darkMode', next);
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 p-1.5 rounded-lg text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted hover:text-ink-400 dark:hover:text-parchment-300 transition-colors"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      {showLabel && (
        <span className="text-xs font-sans">{dark ? 'Light Mode' : 'Dark Mode'}</span>
      )}
    </button>
  );
}
