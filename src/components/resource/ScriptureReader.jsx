import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Loader2 } from 'lucide-react';

/**
 * Scripture verse display with selection and quote insertion.
 */
export default function ScriptureReader({
  chapter,
  chapterLabel,
  loading,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext,
  onInsertQuote,
}) {
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const scrollRef = useRef(null);

  // Reset selection when chapter changes
  useEffect(() => {
    setSelectedVerses(new Set());
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [chapter?.reference]);

  const toggleVerse = (verseNum) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      if (next.has(verseNum)) next.delete(verseNum);
      else next.add(verseNum);
      return next;
    });
  };

  const handleInsertQuote = () => {
    if (!chapter || selectedVerses.size === 0 || !onInsertQuote) return;
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const verses = sorted.map(n => chapter.verses.find(v => v.verse === n)).filter(Boolean);
    const text = verses.map(v => `<sup>${v.verse}</sup> ${v.text}`).join(' ');

    // Build reference string (e.g. "1 Nephi 3:7-9, 12")
    const ref = buildReferenceRange(chapter.reference, sorted);
    const html = `<blockquote><p>${text}</p><p><em>— ${ref}</em></p></blockquote><p></p>`;
    onInsertQuote(html);
    setSelectedVerses(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="text-gold-400 animate-spin" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-full text-parchment-400 dark:text-parchment-500 text-sm font-sans">
        Select a chapter to begin reading
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chapter heading */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0">
        <h2 className="font-serif text-lg font-bold text-ink-600 dark:text-parchment-200">
          {chapter.reference}
        </h2>
      </div>

      {/* Verses */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto warm-scrollbar px-5 pb-4">
        {chapter.verses.map(v => (
          <span
            key={v.verse}
            onClick={() => toggleVerse(v.verse)}
            className={`cursor-pointer inline transition-colors ${
              selectedVerses.has(v.verse)
                ? 'bg-gold-100 dark:bg-gold-600/20 rounded'
                : ''
            }`}
          >
            <sup className="text-[10px] font-sans font-bold text-gold-500 dark:text-gold-400 mr-0.5 select-none">
              {v.verse}
            </sup>
            <span className="font-serif text-[15px] leading-relaxed text-ink-500 dark:text-parchment-300">
              {v.text}
            </span>{' '}
          </span>
        ))}
      </div>

      {/* Bottom bar: nav + quote */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-parchment-200 dark:border-dark-border flex-shrink-0 bg-parchment-50/80 dark:bg-dark-surface/80">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevChapter}
            disabled={!hasPrev}
            className={`p-1.5 rounded transition-colors ${
              hasPrev
                ? 'text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted'
                : 'text-parchment-300 dark:text-dark-muted cursor-not-allowed'
            }`}
            title={`Previous ${chapterLabel}`}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={onNextChapter}
            disabled={!hasNext}
            className={`p-1.5 rounded transition-colors ${
              hasNext
                ? 'text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted'
                : 'text-parchment-300 dark:text-dark-muted cursor-not-allowed'
            }`}
            title={`Next ${chapterLabel}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {selectedVerses.size > 0 && onInsertQuote && (
          <button
            onClick={handleInsertQuote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400 text-white text-xs font-sans font-medium hover:bg-gold-500 transition-colors"
          >
            <Quote size={12} />
            Insert {selectedVerses.size} verse{selectedVerses.size > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Build a compact verse reference range string.
 * e.g. [7, 8, 9, 12] with "1 Nephi 3" → "1 Nephi 3:7-9, 12"
 */
function buildReferenceRange(chapterRef, verseNumbers) {
  if (verseNumbers.length === 0) return chapterRef;
  const ranges = [];
  let start = verseNumbers[0];
  let end = start;

  for (let i = 1; i < verseNumbers.length; i++) {
    if (verseNumbers[i] === end + 1) {
      end = verseNumbers[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = verseNumbers[i];
      end = start;
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);

  return `${chapterRef}:${ranges.join(', ')}`;
}
