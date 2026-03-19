import { useState, useEffect, useCallback } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import ScriptureHeader from './ScriptureHeader';
import ScriptureNav from './ScriptureNav';
import ScriptureReader from './ScriptureReader';
import { useVolume } from '../../hooks/useScripture';
import { getSessionValue, setSessionValue } from '../../db';

/**
 * Standalone scripture pane with its own navigation state.
 * Accepts paneId to scope session persistence (multiple instances can coexist).
 */
export default function ScripturePane({ paneId, onInsertQuote }) {
  const sessionKey = `scripturePosition-${paneId}`;

  const [volumeId, setVolumeId] = useState(null);
  const [bookIdx, setBookIdx] = useState(null);
  const [chapterIdx, setChapterIdx] = useState(null);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [restored, setRestored] = useState(false);

  const { data: volumeData, loading } = useVolume(volumeId);

  // Restore scripture position on mount
  useEffect(() => {
    getSessionValue(sessionKey).then(pos => {
      if (pos) {
        setVolumeId(pos.volumeId || null);
        setBookIdx(pos.bookIdx ?? null);
        setChapterIdx(pos.chapterIdx ?? null);
      }
      setRestored(true);
    });
  }, [sessionKey]);

  // Persist scripture position
  useEffect(() => {
    if (!restored) return;
    setSessionValue(sessionKey, { volumeId, bookIdx, chapterIdx });
  }, [volumeId, bookIdx, chapterIdx, restored, sessionKey]);

  // Auto-select book 0 for single-book volumes (D&C)
  useEffect(() => {
    if (volumeData?.singleBook && bookIdx === null) {
      setBookIdx(0);
    }
  }, [volumeData, bookIdx]);

  const handleSelectVolume = useCallback((id) => {
    setVolumeId(id);
    setBookIdx(null);
    setChapterIdx(null);
  }, []);

  const handleSelectBook = useCallback((idx) => {
    setBookIdx(idx);
    setChapterIdx(null);
  }, []);

  const handleSelectChapter = useCallback((idx) => {
    setChapterIdx(idx);
  }, []);

  const handleBack = useCallback((level) => {
    if (level === 'volumes') {
      setVolumeId(null);
      setBookIdx(null);
      setChapterIdx(null);
    } else if (level === 'books') {
      setBookIdx(null);
      setChapterIdx(null);
    }
  }, []);

  const handleNavigateTo = useCallback((volId, bIdx, cIdx) => {
    setVolumeId(volId);
    setBookIdx(bIdx);
    setChapterIdx(cIdx);
  }, []);

  // Prev/Next chapter navigation
  const effectiveBookIdx = volumeData?.singleBook ? 0 : bookIdx;
  const currentBook = volumeData?.books[effectiveBookIdx];
  const currentChapter = currentBook?.chapters[chapterIdx];
  const chapterLabel = volumeId === 'dc' ? 'Section' : 'Chapter';
  const hasPrev = chapterIdx !== null && chapterIdx > 0;
  const hasNext = chapterIdx !== null && currentBook && chapterIdx < currentBook.chapters.length - 1;

  const handlePrevChapter = () => {
    if (hasPrev) setChapterIdx(chapterIdx - 1);
  };
  const handleNextChapter = () => {
    if (hasNext) setChapterIdx(chapterIdx + 1);
  };

  return (
    <div className="h-full flex flex-col">
      <ScriptureHeader onNavigateTo={handleNavigateTo} />
      <div className="flex-1 flex min-h-0">
        {!navCollapsed && (
          <div className="w-44 h-full border-r border-parchment-200 dark:border-dark-border flex-shrink-0">
            <ScriptureNav
              volumeId={volumeId}
              bookIdx={bookIdx}
              chapterIdx={chapterIdx}
              volumeData={volumeData}
              onSelectVolume={handleSelectVolume}
              onSelectBook={handleSelectBook}
              onSelectChapter={handleSelectChapter}
              onBack={handleBack}
            />
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center px-2 py-1 flex-shrink-0">
            <button
              onClick={() => setNavCollapsed(!navCollapsed)}
              className="p-1.5 rounded-lg text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors"
              title={navCollapsed ? 'Show navigation' : 'Hide navigation'}
            >
              {navCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ScriptureReader
              chapter={currentChapter}
              chapterLabel={chapterLabel}
              loading={loading}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onInsertQuote={onInsertQuote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
