/**
 * Reusable empty state placeholder.
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      {Icon && (
        <div className="mb-4 text-parchment-400">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      {title && (
        <h3 className="font-serif text-lg font-semibold text-ink-500 dark:text-parchment-300 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-ink-300 dark:text-parchment-400 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
