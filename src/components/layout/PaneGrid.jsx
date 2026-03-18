import { Columns, Rows, Grid2x2, Square, Plus } from 'lucide-react';

const LAYOUTS = [
  { id: '1x1', label: '1 pane', Icon: Square, cols: 1, rows: 1, slots: 1 },
  { id: '2x1', label: '2 side by side', Icon: Columns, cols: 2, rows: 1, slots: 2 },
  { id: '1x2', label: '2 stacked', Icon: Rows, cols: 1, rows: 2, slots: 2 },
  { id: '2x2', label: '2×2 grid', Icon: Grid2x2, cols: 2, rows: 2, slots: 4 },
];

/**
 * Dynamic CSS grid that renders pane slots based on layout selection.
 * Includes a compact layout toolbar.
 */
export default function PaneGrid({ layout, onLayoutChange, paneCount, onAddPane, maxPanes, children }) {
  const layoutConfig = LAYOUTS.find(l => l.id === layout) || LAYOUTS[1];

  const gridClass = {
    '1x1': 'grid-cols-1 grid-rows-1',
    '2x1': 'grid-cols-2 grid-rows-1',
    '1x2': 'grid-cols-1 grid-rows-2',
    '2x2': 'grid-cols-2 grid-rows-2',
  }[layout] || 'grid-cols-2 grid-rows-1';

  return (
    <div className="h-screen flex flex-col bg-parchment-100 dark:bg-dark-bg">
      {/* Layout toolbar */}
      <div className="flex items-center justify-center gap-1 px-3 py-1.5 bg-parchment-50 dark:bg-dark-surface border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
        <div className="flex items-center gap-0.5 bg-parchment-100 dark:bg-dark-bg rounded-md p-0.5">
          {LAYOUTS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onLayoutChange(id)}
              className={`p-1.5 rounded transition-colors ${
                layout === id
                  ? 'bg-gold-400 text-white shadow-sm'
                  : 'text-ink-300 dark:text-parchment-400 hover:text-ink-500 dark:hover:text-parchment-200'
              }`}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        {paneCount < maxPanes && paneCount < layoutConfig.slots && (
          <button
            onClick={onAddPane}
            className="ml-2 flex items-center gap-1 px-2 py-1 text-xs font-sans text-ink-300 dark:text-parchment-400 hover:text-gold-500 hover:bg-parchment-100 dark:hover:bg-dark-muted rounded-md transition-colors"
            title="Add pane"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {/* Grid */}
      <div className={`flex-1 grid ${gridClass} gap-1 p-1 min-h-0`}>
        {children}
      </div>
    </div>
  );
}

export { LAYOUTS };
