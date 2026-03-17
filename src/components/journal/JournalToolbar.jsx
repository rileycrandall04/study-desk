import {
  Bold, Italic, Underline as UnderlineIcon, List,
  Heading2, Undo2, Redo2,
} from 'lucide-react';

/**
 * Formatting toolbar for the TipTap journal editor.
 */
export default function JournalToolbar({ editor }) {
  if (!editor) return null;

  // Prevent focus loss when clicking toolbar buttons
  const prevent = (e) => e.preventDefault();

  const btn = (active) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-gold-100 dark:bg-gold-600/20 text-gold-600 dark:text-gold-300'
        : 'text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted hover:text-ink-400 dark:hover:text-parchment-300'
    }`;

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-parchment-200 dark:border-dark-border bg-parchment-50/80 dark:bg-dark-surface/80">
      <button
        onMouseDown={prevent}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      <button
        onMouseDown={prevent}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>
      <button
        onMouseDown={prevent}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btn(editor.isActive('underline'))}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon size={16} />
      </button>

      <div className="w-px h-4 bg-parchment-300 dark:bg-dark-border mx-1" />

      <button
        onMouseDown={prevent}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive('heading', { level: 2 }))}
        title="Heading"
      >
        <Heading2 size={16} />
      </button>
      <button
        onMouseDown={prevent}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List size={16} />
      </button>

      <div className="w-px h-4 bg-parchment-300 dark:bg-dark-border mx-1" />

      <button
        onMouseDown={prevent}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`p-1.5 rounded transition-colors ${
          editor.can().undo()
            ? 'text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted hover:text-ink-400'
            : 'text-parchment-300 dark:text-dark-muted cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        onMouseDown={prevent}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`p-1.5 rounded transition-colors ${
          editor.can().redo()
            ? 'text-ink-300 dark:text-parchment-400 hover:bg-parchment-100 dark:hover:bg-dark-muted hover:text-ink-400'
            : 'text-parchment-300 dark:text-dark-muted cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
}
