import { useState, useEffect, useCallback } from 'react';
import { PanelLeftClose, PanelLeft, BookOpen, Mic, LayoutPanelTop } from 'lucide-react';
import ScriptureHeader from './ScriptureHeader';
import ScriptureNav from './ScriptureNav';
import ScriptureReader from './ScriptureReader';
import ConferenceTalkContent from './ConferenceTalkContent';
import { useVolume } from '../../hooks/useScripture';
import { getSessionValue, setSessionValue } from '../../db';

const SESSION_KEY = 'scripturePosition';
const MODE_KEY = 'resourceMode';

/**
 * Right pane — scripture reader or conference talks, with mode toggle.
 */
export default function ResourcePane({ onInsertQuote }) {
  const [resourceMode, setResourceMode] = useState('scriptures'); // 'scriptures' | 'talks' | 'split'
  const [modeRestored, setModeRestored] = useState(false);
  const [volumeId, setVolumeId] = useState(null);
  const [bookIdx, setBookIdx] = useState(null);
  const [chapterIdx, setChapterIdx] = useState(null);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [restored, setRestored] = useState(false);

  const { data: volumeData, loading } = useVolume(resourceMode !== 'talks' ? volumeId : null);

  // Restore mode
  useEffect(() => {
    getSessionValue(MODE_KEY).then(m => {
      if (m === 'talks' || m === 'scriptures' || m === 'split') setResourceMode(m);
      setModeRestored(true);
    });
  }, []);

  // Persist mode
  useEffect(() => {
    if (!modeRestored) return;
    setSessionValue(MODE_KEY, resourceMode);
  }, [resourceMode, modeRestored]);

  // Restore scripture position on mount
  useEffect(() => {
    getSessionValue(SESSION_KEY).then(pos => {
      if (pos) {
        setVolumeId(pos.volumeId || null);
        setBookIdx(pos.bookIdx ?? null);
        setChapterIdx(pos.chapterIdx ?? null);
      }
      setRestored(true);
    });
  }, []);

  // Persist scripture position
  useEffect(() => {
    if (!restored) return;
    setSessionValue(SESSION_KEY, { volumeId, bookIdx, chapterIdx });
  }, [volumeId, bookIdx, chapterIdx, restored]);

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

  const scriptureContent = (
    <>
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
    </>
  );

  // Conference talks mode
  if (resourceMode === 'talks') {
    return (
      <div className="h-full flex flex-col">
        <ModeToggle mode={resourceMode} onChange={setResourceMode} />
        <div className="flex-1 min-h-0">
          <ConferenceTalkContent onInsertQuote={onInsertQuote} />
        </div>
      </div>
    );
  }

  // Split mode — scriptures top, talks bottom
  if (resourceMode === 'split') {
    return (
      <div className="h-full flex flex-col">
        <ModeToggle mode={resourceMode} onChange={setResourceMode} />
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0 border-b border-parchment-300 dark:border-dark-border">
            {scriptureContent}
          </div>
          <div className="flex-1 min-h-0">
            <ConferenceTalkContent onInsertQuote={onInsertQuote} />
          </div>
        </div>
      </div>
    );
  }

  // Scripture mode
  return (
    <div className="h-full flex flex-col">
      <ModeToggle mode={resourceMode} onChange={setResourceMode} />
      {scriptureContent}
    </div>
  );
}

/** Segmented toggle: Scriptures | Talks | Split */
function ModeToggle({ mode, onChange }) {
  const btn = (value, label, Icon) => (
    <button
      onClick={() => onChange(value)}
      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-sans font-medium rounded-md transition-colors ${
        mode === value
          ? 'bg-gold-400 text-white shadow-sm'
          : 'text-ink-300 dark:text-parchment-400 hover:text-ink-500 dark:hover:text-parchment-200'
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  );

  return (
    <div className="flex gap-1 px-3 py-2 border-b border-parchment-200 dark:border-dark-border flex-shrink-0 bg-parchment-50 dark:bg-dark-surface">
      {btn('scriptures', 'Scriptures', BookOpen)}
      {btn('talks', 'Talks', Mic)}
      {btn('split', 'Both', LayoutPanelTop)}
    </div>
  );
}
