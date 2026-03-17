import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LibraryView from '../components/library/LibraryView';
import { setSessionValue } from '../db';

/**
 * LibraryPage — full-page view of all journal entries.
 */
export default function LibraryPage() {
  const navigate = useNavigate();

  function handleSelectEntry(id) {
    setSessionValue('lastEntryId', id);
    navigate('/study');
  }

  return (
    <div className="h-screen flex flex-col bg-parchment-50">
      {/* Back navigation */}
      <div className="px-4 py-2 flex-shrink-0">
        <button
          onClick={() => navigate('/study')}
          className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-gold-500 font-sans transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Study
        </button>
      </div>

      {/* Library content */}
      <div className="flex-1 min-h-0">
        <LibraryView onSelectEntry={handleSelectEntry} />
      </div>
    </div>
  );
}
