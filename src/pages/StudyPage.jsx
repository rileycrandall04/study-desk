import { useState, useEffect, useCallback, useRef } from 'react';
import AppShell from '../components/layout/AppShell';
import JournalPane from '../components/journal/JournalPane';
import ResourcePane from '../components/resource/ResourcePane';
import { useSessionState } from '../hooks/useDb';
import { setSessionValue } from '../db';

/**
 * StudyPage — main split-pane study view.
 * Restores last active entry from session state.
 * Wires quote insertion from scripture pane → journal editor.
 */
export default function StudyPage() {
  const [lastEntryId] = useSessionState('lastEntryId', null);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const editorRef = useRef(null);

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

  // Create new entry (start with null id, editor lazy-creates on first content)
  const handleNewEntry = useCallback(() => {
    setActiveEntryId(null);
    setSessionValue('lastEntryId', null);
  }, []);

  // Quote insertion from scripture pane → journal editor
  const handleInsertQuote = useCallback((html) => {
    if (editorRef.current) {
      editorRef.current.insertContent(html);
    }
  }, []);

  return (
    <AppShell
      journalPane={
        <JournalPane
          ref={editorRef}
          activeEntryId={activeEntryId}
          onSelectEntry={handleSelectEntry}
          onNewEntry={handleNewEntry}
        />
      }
      resourcePane={<ResourcePane onInsertQuote={handleInsertQuote} />}
    />
  );
}
