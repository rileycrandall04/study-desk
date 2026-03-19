import { ArrowLeft, BookOpen } from 'lucide-react';
import { VOLUMES } from '../../utils/scriptures';

/**
 * Scripture sidebar navigation — 3-level drill-down:
 * Volumes → Books (or Sections for D&C) → Chapters
 */
export default function ScriptureNav({
  volumeId,
  bookIdx,
  chapterIdx,
  volumeData,
  onSelectVolume,
  onSelectBook,
  onSelectChapter,
  onBack,
}) {
  // Level 1: Volume list
  if (!volumeId) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-3 py-3 border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
          <h3 className="font-serif text-sm font-semibold text-ink-500 dark:text-parchment-200">Scriptures</h3>
        </div>
        <div className="flex-1 overflow-y-auto warm-scrollbar px-2 py-2">
          {VOLUMES.map(vol => (
            <button
              key={vol.id}
              onClick={() => onSelectVolume(vol.id)}
              className="w-full text-left px-3 py-2.5 rounded-lg mb-0.5 text-sm font-sans text-ink-500 dark:text-parchment-300 hover:bg-parchment-200/50 dark:hover:bg-dark-muted transition-colors flex items-center gap-2"
            >
              <BookOpen size={14} className="text-gold-400 flex-shrink-0" />
              {vol.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Level 2: Book list (skip for single-book volumes like D&C)
  if (volumeData && bookIdx === null && !volumeData.singleBook) {
    const vol = VOLUMES.find(v => v.id === volumeId);
    return (
      <div className="h-full flex flex-col">
        <div className="px-3 py-3 border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
          <button
            onClick={() => onBack('volumes')}
            className="flex items-center gap-1.5 text-xs font-sans text-ink-300 dark:text-parchment-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors mb-1"
          >
            <ArrowLeft size={12} />
            Scriptures
          </button>
          <h3 className="font-serif text-sm font-semibold text-ink-500 dark:text-parchment-200">{vol?.title}</h3>
        </div>
        <div className="flex-1 overflow-y-auto warm-scrollbar px-2 py-2">
          {volumeData.books.map((book, idx) => (
            <button
              key={idx}
              onClick={() => onSelectBook(idx)}
              className="w-full text-left px-3 py-2 rounded-lg mb-0.5 text-sm font-sans text-ink-500 dark:text-parchment-300 hover:bg-parchment-200/50 dark:hover:bg-dark-muted transition-colors"
            >
              {book.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Level 3: Chapter grid (or section grid for D&C)
  const effectiveBookIdx = volumeData?.singleBook ? 0 : bookIdx;
  const book = volumeData?.books[effectiveBookIdx];
  const vol = VOLUMES.find(v => v.id === volumeId);
  const _chapterLabel = volumeId === 'dc' ? 'Section' : 'Chapter';

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-3 border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
        <button
          onClick={() => onBack(volumeData?.singleBook ? 'volumes' : 'books')}
          className="flex items-center gap-1.5 text-xs font-sans text-ink-300 dark:text-parchment-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors mb-1"
        >
          <ArrowLeft size={12} />
          {volumeData?.singleBook ? 'Scriptures' : vol?.title}
        </button>
        <h3 className="font-serif text-sm font-semibold text-ink-500 dark:text-parchment-200">
          {volumeData?.singleBook ? vol?.title : book?.name}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto warm-scrollbar px-3 py-3">
        <div className="grid grid-cols-5 gap-1.5">
          {book?.chapters.map((ch, idx) => (
            <button
              key={idx}
              onClick={() => onSelectChapter(idx)}
              className={`py-1.5 rounded text-xs font-sans font-medium transition-colors ${
                idx === chapterIdx
                  ? 'bg-gold-400 text-white'
                  : 'bg-parchment-100 dark:bg-dark-muted text-ink-400 dark:text-parchment-400 hover:bg-gold-100 dark:hover:bg-gold-600/20 hover:text-gold-600 dark:hover:text-gold-300'
              }`}
            >
              {ch.number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
