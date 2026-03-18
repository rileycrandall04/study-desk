import { useState } from 'react';
import { Search, X, Mic, Loader2 } from 'lucide-react';
import { useConferenceSearch } from '../../hooks/useConference';
import { conferenceLabel } from '../../utils/conferences';

/**
 * Conference talk header with search toggle.
 * Same pattern as ScriptureHeader.
 */
export default function ConferenceHeader({ onSelectTalk }) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { results, searching } = useConferenceSearch(searchOpen ? query : '');

  const handleResultClick = (talk) => {
    onSelectTalk({ year: talk.year, month: talk.month, key: talk.key });
    setSearchOpen(false);
    setQuery('');
  };

  if (!searchOpen) {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Mic size={14} className="text-gold-400" />
          <span className="font-serif text-sm font-semibold text-ink-500 dark:text-parchment-200">Conference Talks</span>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="p-1.5 rounded-lg text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors"
          title="Search cached talks"
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
          placeholder="Search cached talks..."
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
          {results.map((t, i) => (
            <button
              key={i}
              onClick={() => handleResultClick(t)}
              className="w-full text-left px-3 py-2 hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors border-b border-parchment-100/50 dark:border-dark-border/50 last:border-b-0"
            >
              <p className="text-xs font-sans font-medium text-gold-600 dark:text-gold-400">
                {t.title}
                <span className="ml-1.5 text-parchment-400 dark:text-parchment-500 font-normal">
                  {conferenceLabel(t.year, t.month)}
                </span>
              </p>
              <p className="text-[11px] font-sans text-ink-300 dark:text-parchment-400 mt-0.5">
                {t.speaker}
              </p>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !searching && results.length === 0 && (
        <div className="px-3 py-4 text-center text-xs text-parchment-400 font-sans">
          No results (only cached talks are searchable)
        </div>
      )}
    </div>
  );
}
