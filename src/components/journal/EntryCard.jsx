import { formatShort } from '../../utils/dates';

/**
 * Card for displaying a journal entry in the library grid.
 */
export default function EntryCard({ entry, onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left card hover:shadow-md transition-all ${
        isActive ? 'ring-2 ring-gold-400' : ''
      }`}
    >
      <h4 className="font-serif font-semibold text-ink-500 dark:text-parchment-200 truncate text-sm">
        {entry.title || 'Untitled'}
      </h4>
      <p className="text-[11px] text-parchment-400 dark:text-parchment-500 font-sans mt-1">
        {formatShort(entry.createdAt)}
      </p>
      <p className="text-xs text-ink-300 dark:text-parchment-400 font-sans mt-2 line-clamp-3 leading-relaxed">
        {entry.plainText?.slice(0, 150) || 'Empty entry'}
      </p>
      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-gold-50 text-gold-600 border border-gold-200">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
