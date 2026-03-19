import { useState, useEffect, useCallback, useRef } from 'react';
import PaneGrid, { LAYOUTS } from '../components/layout/PaneGrid';
import PaneWrapper from '../components/layout/PaneWrapper';
import JournalPane from '../components/journal/JournalPane';
import ScripturePane from '../components/resource/ScripturePane';
import ConferenceTalkContent from '../components/resource/ConferenceTalkContent';
import { useSessionState } from '../hooks/useDb';
import { setSessionValue, getSessionValue } from '../db';

const MAX_PANES = 4;

/** Generate a short unique pane ID */
let paneCounter = 0;
function nextPaneId() {
  return `p${Date.now()}-${paneCounter++}`;
}

/** Default layout: journal left, scriptures right (matches legacy behavior) */
const DEFAULT_PANES = [
  { id: 'pane-journal', type: 'journal' },
  { id: 'pane-scripture-1', type: 'scriptures' },
];
const DEFAULT_LAYOUT = '2x1';

/**
 * StudyPage — multi-pane study view.
 * Manages dynamic pane configuration (up to 4 panes).
 * Wires quote insertion from any resource pane → single journal editor.
 */
export default function StudyPage() {
  const [lastEntryId] = useSessionState('lastEntryId', null);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const editorRef = useRef(null);

  // Pane layout state
  const [panes, setPanes] = useState(DEFAULT_PANES);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [layoutRestored, setLayoutRestored] = useState(false);

  // Restore layout from session
  useEffect(() => {
    getSessionValue('paneLayout').then(saved => {
      if (saved?.panes?.length > 0 && saved?.layout) {
        const layoutConfig = LAYOUTS.find(l => l.id === saved.layout);
        let restoredPanes = saved.panes;

        // Ensure pane count matches layout slots
        if (layoutConfig && restoredPanes.length < layoutConfig.slots) {
          const hasJournal = restoredPanes.some(p => p.type === 'journal');
          while (restoredPanes.length < layoutConfig.slots) {
            const needJournal = !hasJournal && !restoredPanes.some(p => p.type === 'journal');
            restoredPanes = [...restoredPanes, { id: nextPaneId(), type: needJournal ? 'journal' : 'scriptures' }];
          }
        }

        setPanes(restoredPanes);
        setLayout(saved.layout);
      }
      setLayoutRestored(true);
    });
  }, []);

  // Persist layout to session
  useEffect(() => {
    if (!layoutRestored) return;
    setSessionValue('paneLayout', { panes, layout });
  }, [panes, layout, layoutRestored]);

  // Restore last entry on mount
  useEffect(() => {
    if (!initialized && lastEntryId !== null) {
      setActiveEntryId(lastEntryId);
      setInitialized(true);
    } else if (!initialized) {
      setInitialized(true);
    }
  }, [lastEntryId, initialized]);

  // Persist active entry to session state
  const handleSelectEntry = useCallback((id) => {
    setActiveEntryId(id);
    setSessionValue('lastEntryId', id);
  }, []);

  // Create new entry
  const handleNewEntry = useCallback(() => {
    setActiveEntryId(null);
    setSessionValue('lastEntryId', null);
  }, []);

  // Quote insertion from any resource pane → journal editor
  const handleInsertQuote = useCallback((html) => {
    if (editorRef.current) {
      editorRef.current.insertContent(html);
    }
  }, []);

  // Pane management
  const handleChangeType = useCallback((paneId, newType) => {
    setPanes(prev => prev.map(p => p.id === paneId ? { ...p, type: newType } : p));
  }, []);

  const handleClosePane = useCallback((paneId) => {
    setPanes(prev => {
      const next = prev.filter(p => p.id !== paneId);
      return next.length > 0 ? next : prev; // don't remove last pane
    });
  }, []);

  const handleAddPane = useCallback(() => {
    setPanes(prev => {
      if (prev.length >= MAX_PANES) return prev;
      const hasJournal = prev.some(p => p.type === 'journal');
      return [...prev, { id: nextPaneId(), type: hasJournal ? 'scriptures' : 'journal' }];
    });
  }, []);

  const handleLayoutChange = useCallback((newLayout) => {
    const layoutConfig = LAYOUTS.find(l => l.id === newLayout);
    if (!layoutConfig) return;

    setLayout(newLayout);

    // Auto-adjust pane count to fit layout
    setPanes(prev => {
      if (prev.length > layoutConfig.slots) {
        // Trim panes to fit (keep first N)
        return prev.slice(0, layoutConfig.slots);
      }
      if (prev.length < layoutConfig.slots) {
        // Add panes to fill layout
        const toAdd = layoutConfig.slots - prev.length;
        const hasJournal = prev.some(p => p.type === 'journal');
        const newPanes = [...prev];
        for (let i = 0; i < toAdd; i++) {
          const needJournal = !hasJournal && i === 0 && !newPanes.some(p => p.type === 'journal');
          newPanes.push({ id: nextPaneId(), type: needJournal ? 'journal' : 'scriptures' });
        }
        return newPanes;
      }
      return prev;
    });
  }, []);

  // Determine which types are disabled (journal limited to 1)
  const hasJournal = panes.some(p => p.type === 'journal');
  const disabledTypesFor = (paneId) => {
    const pane = panes.find(p => p.id === paneId);
    if (hasJournal && pane?.type !== 'journal') {
      return ['journal']; // journal already open in another pane
    }
    return [];
  };

  // Render pane content based on type
  const renderPaneContent = (pane) => {
    switch (pane.type) {
      case 'journal':
        return (
          <JournalPane
            ref={editorRef}
            activeEntryId={activeEntryId}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleNewEntry}
          />
        );
      case 'scriptures':
        return (
          <ScripturePane
            paneId={pane.id}
            onInsertQuote={handleInsertQuote}
          />
        );
      case 'talks':
        return (
          <ConferenceTalkContent
            paneId={pane.id}
            onInsertQuote={handleInsertQuote}
          />
        );
      default:
        return null;
    }
  };

  // Cap visible panes to layout slot count
  const layoutConfig = LAYOUTS.find(l => l.id === layout) || LAYOUTS[1];
  const visiblePanes = panes.slice(0, layoutConfig.slots);

  return (
    <PaneGrid
      layout={layout}
      onLayoutChange={handleLayoutChange}
      paneCount={visiblePanes.length}
      onAddPane={handleAddPane}
      maxPanes={MAX_PANES}
    >
      {visiblePanes.map(pane => (
        <PaneWrapper
          key={pane.id}
          paneType={pane.type}
          onChangeType={(type) => handleChangeType(pane.id, type)}
          onClose={() => handleClosePane(pane.id)}
          canClose={visiblePanes.length > 1}
          disabledTypes={disabledTypesFor(pane.id)}
        >
          {renderPaneContent(pane)}
        </PaneWrapper>
      ))}
    </PaneGrid>
  );
}
