import { useState } from 'react';
import { Search, X, BookOpen, Loader2 } from 'lucide-react';
import { useScriptureSearch } from '../../hooks/useScripture';
import { VOLUMES } from '../../utils/scriptures';

/**
 * Scripture search bar + results. Toggles between search mode and reading mode.
 */
export default function ScriptureHeader({ onNavigateTo }) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { results, searching } = useScriptureSearch(searchOpen ? query : '');

  const handleResultClick = (result) => {
    onNavigateTo(result.volumeId, result.bookIdx, result.chapterIdx);
    setSearchOpen(false);
    setQuery('');
  };

  const volumeName = (id) => VOLUMES.find(v => v.id === id)?.abbr || id;

  if (!searchOpen) {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-gold-400" />
          <span className="font-serif text-sm font-semibold text-ink-500 dark:text-parchment-200">Scriptures</span>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="p-1.5 rounded-lg text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors"
          title="Search scriptures"
        >
          <Search size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
      <div className="flex items-center gap-2 px-3 py-2">
        <Search size={14} className="text-parchment-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search scriptures..."
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-sm font-sans text-ink-500 dark:text-parchment-300 placeholder:text-parchment-400 p-0"
        />
        {searching && <Loader2 size={14} className="text-gold-400 animate-spin flex-shrink-0" />}
        <button
          onClick={() => { setSearchOpen(false); setQuery(''); }}
          className="p-1 text-ink-300 dark:text-parchment-400 hover:text-ink-500 dark:hover:text-parchment-200 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="max-h-80 overflow-y-auto warm-scrollbar border-t border-parchment-100 dark:border-dark-border">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleResultClick(r)}
              className="w-full text-left px-3 py-2 hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors border-b border-parchment-100/50 dark:border-dark-border/50 last:border-b-0"
            >
              <p className="text-xs font-sans font-medium text-gold-600 dark:text-gold-400">
                {r.reference}
                <span className="ml-1.5 text-parchment-400 dark:text-parchment-500 font-normal">
                  {volumeName(r.volumeId)}
                </span>
              </p>
              <p className="text-[11px] font-sans text-ink-300 dark:text-parchment-400 mt-0.5 line-clamp-2">
                {r.text}
              </p>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !searching && results.length === 0 && (
        <div className="px-3 py-4 text-center text-xs text-parchment-400 font-sans">
          No results found
        </div>
      )}
    </div>
  );
}
