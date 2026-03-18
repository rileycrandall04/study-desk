import { useState, useEffect } from 'react';
import { ChevronRight, Loader2, Plus, Download } from 'lucide-react';
import { CONFERENCES, conferenceLabel } from '../../utils/conferences';
import { useConferenceTalks } from '../../hooks/useConference';
import { getAllConferenceKeys } from '../../db';

/**
 * Expandable reverse-chronological conference list.
 * Click a conference to load its talks, click a talk to read it.
 */
export default function ConferenceList({ onSelectTalk, onImport }) {
  const [expandedConf, setExpandedConf] = useState(null); // { year, month }
  const [cachedConfs, setCachedConfs] = useState(new Set());

  // Check which conferences are cached
  useEffect(() => {
    getAllConferenceKeys().then(keys => {
      const set = new Set();
      for (const k of keys) {
        // keys are like "2015-10-002-talk-slug"
        const m = k.match(/^(\d{4})-(\d{2})-/);
        if (m) set.add(`${m[1]}-${m[2]}`);
      }
      setCachedConfs(set);
    });
  }, []);

  const toggleConf = (conf) => {
    if (expandedConf?.year === conf.year && expandedConf?.month === conf.month) {
      setExpandedConf(null);
    } else {
      setExpandedConf(conf);
    }
  };

  const isExpanded = (conf) =>
    expandedConf?.year === conf.year && expandedConf?.month === conf.month;

  const isCached = (conf) =>
    cachedConfs.has(`${conf.year}-${conf.month === 4 ? '04' : '10'}`);

  return (
    <div className="h-full flex flex-col">
      {/* Import button */}
      <div className="px-3 py-2 border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 text-xs font-sans text-gold-500 dark:text-gold-400 hover:text-gold-600 dark:hover:text-gold-300 transition-colors"
        >
          <Plus size={12} />
          Import Talk
        </button>
      </div>

      {/* Conference list */}
      <div className="flex-1 overflow-y-auto warm-scrollbar">
        {CONFERENCES.map(conf => (
          <div key={`${conf.year}-${conf.month}`}>
            <button
              onClick={() => toggleConf(conf)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors border-b border-parchment-100/50 dark:border-dark-border/50"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={12}
                  className={`text-parchment-400 transition-transform ${isExpanded(conf) ? 'rotate-90' : ''}`}
                />
                <span className="text-sm font-sans font-medium text-ink-500 dark:text-parchment-300">
                  {conferenceLabel(conf.year, conf.month)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isCached(conf) && (
                  <Download size={10} className="text-green-500 dark:text-green-400" title="Cached offline" />
                )}
                <span className="text-[10px] font-sans text-parchment-400 dark:text-parchment-500 uppercase">
                  {conf.source === 'github' ? 'GH' : 'Web'}
                </span>
              </div>
            </button>

            {isExpanded(conf) && (
              <ExpandedConference
                year={conf.year}
                month={conf.month}
                onSelectTalk={onSelectTalk}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandedConference({ year, month, onSelectTalk }) {
  const { talks, loading, error } = useConferenceTalks(year, month);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="text-gold-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-3 text-xs font-sans text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  }

  // Group by session_title
  const sessions = new Map();
  for (const t of talks) {
    const session = t.session_title || 'General Session';
    if (!sessions.has(session)) sessions.set(session, []);
    sessions.get(session).push(t);
  }

  return (
    <div className="bg-parchment-50/50 dark:bg-dark-bg/50 border-b border-parchment-200 dark:border-dark-border">
      {[...sessions.entries()].map(([session, sessionTalks]) => (
        <div key={session}>
          <div className="px-5 py-1.5">
            <span className="text-[10px] font-sans font-semibold text-parchment-400 dark:text-parchment-500 uppercase tracking-wider">
              {session}
            </span>
          </div>
          {sessionTalks.map(talk => (
            <button
              key={talk.key}
              onClick={() => onSelectTalk({ year, month, key: talk.key })}
              className="w-full text-left px-5 py-2 hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors"
            >
              <p className="text-sm font-serif text-ink-500 dark:text-parchment-300 leading-snug">
                {talk.title}
              </p>
              <p className="text-[11px] font-sans text-parchment-400 dark:text-parchment-500 mt-0.5">
                {talk.speaker}
              </p>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
