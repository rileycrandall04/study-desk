import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import EntryCard from '../journal/EntryCard';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import { useJournalSearch, useAllTags } from '../../hooks/useDb';
import { deleteJournalEntry } from '../../db';
import { MAX_LIBRARY_ENTRIES } from '../../utils/constants';

/**
 * Full-page library view showing all journal entries as searchable cards.
 */
export default function LibraryView({ onSelectEntry }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const { entries: rawEntries, loading: _loading } = useJournalSearch(search, MAX_LIBRARY_ENTRIES);
  const allTags = useAllTags();

  const entries = selectedTags.length > 0
    ? rawEntries.filter(e => selectedTags.every(t => e.tags?.includes(t)))
    : rawEntries;

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  async function handleDelete() {
    if (deleteTarget) {
      await deleteJournalEntry(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="h-full flex flex-col bg-parchment-50 dark:bg-dark-bg">
      {/* Search header */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <h1 className="font-serif text-2xl font-bold text-ink-600 dark:text-parchment-200 mb-4">Journal Library</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="input-field pl-9"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-[11px] font-sans px-2.5 py-1 rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-gold-400 text-white border-gold-400'
                    : 'bg-parchment-50 dark:bg-ink-500 text-ink-300 dark:text-parchment-400 border-parchment-300 dark:border-ink-400 hover:border-gold-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 warm-scrollbar">
        {entries.length === 0 ? (
          <EmptyState
            title={search ? 'No matches' : 'No entries yet'}
            description={search ? 'Try a different search term.' : 'Create your first journal entry to get started.'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {entries.map(entry => (
              <div key={entry.id} className="relative group">
                <EntryCard
                  entry={entry}
                  onClick={() => onSelectEntry(entry.id)}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(entry); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 text-ink-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Entry"
      >
        <p className="text-sm text-ink-400 mb-4">
          Are you sure you want to delete "{deleteTarget?.title || 'Untitled'}"? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleDelete} className="btn-primary bg-red-500 hover:bg-red-600">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
