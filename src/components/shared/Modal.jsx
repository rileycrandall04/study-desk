import { X } from 'lucide-react';

/**
 * Reusable modal dialog.
 */
export default function Modal({ open, onClose, title, children, size = 'sm' }) {
  if (!open) return null;

  const widthClass = size === 'lg' ? 'max-w-lg' : size === 'md' ? 'max-w-md' : 'max-w-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50" onClick={onClose}>
      <div
        className={`w-full ${widthClass} bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-5 mx-4 border border-transparent dark:border-dark-border`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-ink-600 dark:text-parchment-200">{title}</h3>
          <button onClick={onClose} className="p-1 text-ink-300 dark:text-parchment-400 hover:text-ink-500 dark:hover:text-parchment-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        {children}
      </div>
    </div>
  );
}
