import { useState } from 'react';
import { Plus, Library, Filter, X } from 'lucide-react';
import { useJournalEntries, useAllTags } from '../../hooks/useDb';
import { formatRelative, groupEntriesByDate } from '../../utils/dates';
import { MAX_SIDEBAR_ENTRIES } from '../../utils/constants';

/**
 * Sidebar showing recent journal entries grouped by date.
 */
export default function EntrySidebar({ activeEntryId, onSelectEntry, onNewEntry, onViewLibrary }) {
  const { entries } = useJournalEntries(MAX_SIDEBAR_ENTRIES);
  const allTags = useAllTags();
  const [filterTag, setFilterTag] = useState(null);

  const filtered = filterTag
    ? entries.filter(e => e.tags && e.tags.includes(filterTag))
    : entries;
  const groups = groupEntriesByDate(filtered);

  return (
    <div className="h-full flex flex-col bg-parchment-100/50 dark:bg-dark-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
        <h2 className="font-serif text-sm font-semibold text-ink-500 dark:text-parchment-200">Journal</h2>
        <button
          onClick={onNewEntry}
          className="p-1.5 rounded-lg bg-gold-400 text-white hover:bg-gold-500 transition-colors"
          title="New Entry (Ctrl+N)"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="px-3 py-2 border-b border-parchment-200 dark:border-ink-400 flex-shrink-0">
          <div className="flex items-center gap-1 flex-wrap">
            <Filter size={11} className="text-parchment-400 flex-shrink-0" />
            {filterTag ? (
              <button
                onClick={() => setFilterTag(null)}
                className="inline-flex items-center gap-0.5 text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-gold-100 dark:bg-gold-600/20 text-gold-600 dark:text-gold-300 border border-gold-200 dark:border-gold-600/40"
              >
                {filterTag}
                <X size={9} />
              </button>
            ) : (
              <select
                value=""
                onChange={e => e.target.value && setFilterTag(e.target.value)}
                className="text-[10px] font-sans bg-transparent border-none outline-none text-parchment-400 cursor-pointer p-0"
              >
                <option value="">Filter by tag...</option>
                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto warm-scrollbar px-2 py-2">
        {groups.length === 0 && (
          <p className="text-xs text-parchment-400 text-center py-8">No entries yet</p>
        )}
        {groups.map(group => (
          <div key={group.label} className="mb-3">
            <p className="text-[10px] font-sans font-medium text-parchment-400 uppercase tracking-wider px-2 mb-1">
              {group.label}
            </p>
            {group.entries.map(entry => (
              <button
                key={entry.id}
                onClick={() => onSelectEntry(entry.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg mb-0.5 transition-colors ${
                  entry.id === activeEntryId
                    ? 'bg-gold-100 dark:bg-gold-600/20 border border-gold-200 dark:border-gold-600/40'
                    : 'hover:bg-parchment-200/50 dark:hover:bg-dark-muted border border-transparent'
                }`}
              >
                <p className={`text-sm font-sans truncate ${
                  entry.id === activeEntryId ? 'text-gold-600 dark:text-gold-300 font-medium' : 'text-ink-500 dark:text-parchment-300'
                }`}>
                  {entry.title || 'Untitled'}
                </p>
                <p className="text-[11px] text-parchment-400 font-sans truncate mt-0.5">
                  {entry.plainText?.slice(0, 60) || 'Empty entry'}
                </p>
                <p className="text-[10px] text-parchment-400/70 font-sans mt-0.5">
                  {formatRelative(entry.updatedAt || entry.createdAt)}
                </p>
                {entry.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {entry.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] font-sans px-1 py-0 rounded-full bg-gold-50 dark:bg-gold-600/20 text-gold-500 dark:text-gold-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-parchment-200 dark:border-dark-border flex-shrink-0">
        <button
          onClick={onViewLibrary}
          className="flex items-center gap-1.5 text-xs text-ink-300 dark:text-parchment-400 hover:text-gold-500 dark:hover:text-gold-400 font-sans transition-colors w-full"
        >
          <Library size={13} />
          View All Entries
        </button>
      </div>
    </div>
  );
}
