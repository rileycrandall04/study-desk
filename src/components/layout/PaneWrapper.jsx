import { BookOpen, Mic, PenLine, X, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const PANE_TYPES = [
  { id: 'journal', label: 'Journal', Icon: PenLine },
  { id: 'scriptures', label: 'Scriptures', Icon: BookOpen },
  { id: 'talks', label: 'Talks', Icon: Mic },
];

/**
 * Wraps a pane with a compact header for type selection and close button.
 */
export default function PaneWrapper({ paneType, onChangeType, onClose, canClose, disabledTypes, children }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const current = PANE_TYPES.find(t => t.id === paneType) || PANE_TYPES[0];
  const CurrentIcon = current.Icon;

  return (
    <div className="h-full flex flex-col border border-parchment-200 dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-surface">
      {/* Pane header */}
      <div className="flex items-center justify-between px-2 py-1 bg-parchment-50 dark:bg-dark-bg border-b border-parchment-200 dark:border-dark-border flex-shrink-0">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-sans font-medium text-ink-500 dark:text-parchment-300 hover:bg-parchment-100 dark:hover:bg-dark-muted transition-colors"
          >
            <CurrentIcon size={12} className="text-gold-400" />
            {current.label}
            <ChevronDown size={10} className="text-ink-300 dark:text-parchment-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-ink-600 border border-parchment-200 dark:border-ink-400 rounded-lg shadow-lg z-20 min-w-[140px]">
              {PANE_TYPES.map(({ id, label, Icon }) => {
                const disabled = disabledTypes?.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => {
                      if (!disabled) {
                        onChangeType(id);
                        setDropdownOpen(false);
                      }
                    }}
                    disabled={disabled}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-sans first:rounded-t-lg last:rounded-b-lg transition-colors ${
                      id === paneType
                        ? 'bg-gold-50 dark:bg-gold-600/20 text-gold-600 dark:text-gold-300'
                        : disabled
                        ? 'text-parchment-300 dark:text-parchment-600 cursor-not-allowed'
                        : 'text-ink-400 dark:text-parchment-300 hover:bg-parchment-100 dark:hover:bg-dark-muted'
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                    {disabled && <span className="ml-auto text-[10px] text-parchment-400">(open)</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {canClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted hover:text-red-400 transition-colors"
            title="Close pane"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Pane content */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}
