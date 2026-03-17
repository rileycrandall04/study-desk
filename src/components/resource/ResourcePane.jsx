import { BookOpen } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

/**
 * Right pane placeholder — scripture/talk reader coming in Phase 2.
 */
export default function ResourcePane() {
  return (
    <EmptyState
      icon={BookOpen}
      title="Scripture Resources"
      description="Open scriptures, conference talks, and study materials here. Coming in Phase 2."
    />
  );
}
