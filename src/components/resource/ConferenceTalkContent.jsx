import { useState, useEffect } from 'react';
import { getSessionValue, setSessionValue } from '../../db';
import ConferenceHeader from './ConferenceHeader';
import ConferenceList from './ConferenceList';
import TalkReader from './TalkReader';
import TalkImport from './TalkImport';

const SESSION_KEY = 'conferencePosition';

/**
 * Container managing conference talk navigation state.
 * Routes between list, reader, and import views.
 */
export default function ConferenceTalkContent({ onInsertQuote }) {
  const [selectedTalk, setSelectedTalk] = useState(null); // { year, month, key }
  const [showImport, setShowImport] = useState(false);
  const [restored, setRestored] = useState(false);

  // Restore position on mount
  useEffect(() => {
    getSessionValue(SESSION_KEY).then(pos => {
      if (pos?.key) setSelectedTalk(pos);
      setRestored(true);
    });
  }, []);

  // Persist position
  useEffect(() => {
    if (!restored) return;
    setSessionValue(SESSION_KEY, selectedTalk);
  }, [selectedTalk, restored]);

  const handleSelectTalk = (talk) => {
    setSelectedTalk(talk);
    setShowImport(false);
  };

  const handleBack = () => {
    setSelectedTalk(null);
  };

  const handleImport = () => {
    setShowImport(true);
    setSelectedTalk(null);
  };

  const handleImportSaved = (talk) => {
    setShowImport(false);
    setSelectedTalk(talk);
  };

  const handleImportBack = () => {
    setShowImport(false);
  };

  return (
    <div className="h-full flex flex-col">
      <ConferenceHeader onSelectTalk={handleSelectTalk} />

      <div className="flex-1 min-h-0">
        {showImport ? (
          <TalkImport onBack={handleImportBack} onSaved={handleImportSaved} />
        ) : selectedTalk ? (
          <TalkReader
            year={selectedTalk.year}
            month={selectedTalk.month}
            talkKey={selectedTalk.key}
            onBack={handleBack}
            onInsertQuote={onInsertQuote}
          />
        ) : (
          <ConferenceList onSelectTalk={handleSelectTalk} onImport={handleImport} />
        )}
      </div>
    </div>
  );
}
