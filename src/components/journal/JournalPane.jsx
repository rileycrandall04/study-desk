import { useCallback, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeft, Settings } from 'lucide-react';
import EntrySidebar from './EntrySidebar';
import JournalEditor from './JournalEditor';
import ThemeToggle from '../shared/ThemeToggle';
import { useSessionState } from '../../hooks/useDb';

/**
 * JournalPane — composes sidebar + editor for the left pane.
 * Forwards ref to JournalEditor for quote insertion.
 */
const JournalPane = forwardRef(function JournalPane({ activeEntryId, onSelectEntry, onNewEntry }, ref) {
  const [sidebarCollapsed, setSidebarCollapsed] = useSessionState('sidebarCollapsed', false);
  const navigate = useNavigate();

  const handleEntryCreated = useCallback((newId) => {
    onSelectEntry(newId);
  }, [onSelectEntry]);

  return (
    <div className="h-full flex">
      {/* Sidebar (collapsible) */}
      {!sidebarCollapsed && (
        <div className="w-60 h-full border-r border-parchment-200 dark:border-dark-border flex-shrink-0">
          <EntrySidebar
            activeEntryId={activeEntryId}
            onSelectEntry={onSelectEntry}
            onNewEntry={onNewEntry}
            onViewLibrary={() => navigate('/library')}
          />
        </div>
      )}

      {/* Editor area */}
      <div className="flex-1 h-full flex flex-col min-w-0">
        {/* Toolbar row */}
        <div className="flex items-center justify-between px-2 py-1 flex-shrink-0">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted hover:text-ink-400 dark:hover:text-parchment-300 transition-colors"
            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => navigate('/settings')}
              className="p-1.5 rounded-lg text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted hover:text-ink-400 dark:hover:text-parchment-300 transition-colors"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <JournalEditor
            ref={ref}
            entryId={activeEntryId}
            onEntryCreated={handleEntryCreated}
          />
        </div>
      </div>
    </div>
  );
});

export default JournalPane;
