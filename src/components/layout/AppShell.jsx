/**
 * AppShell — CSS Grid split-pane layout.
 * Journal pane (left), Resource pane (right).
 * Fixed 50/50 split for Phase 1; draggable divider in Phase 6.
 */
export default function AppShell({ journalPane, resourcePane }) {
  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-[1fr_1fr] overflow-hidden">
      {/* Left: Journal */}
      <div className="h-full overflow-hidden bg-parchment-50 dark:bg-dark-bg">
        {journalPane}
      </div>
      {/* Right: Resource (hidden on small screens) */}
      <div className="hidden lg:block h-full overflow-hidden border-l border-parchment-300 dark:border-dark-border bg-white dark:bg-dark-surface">
        {resourcePane}
      </div>
    </div>
  );
}
