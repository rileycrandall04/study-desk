import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Cloud, CheckCircle2, X, Tag } from 'lucide-react';
import JournalToolbar from './JournalToolbar';
import { useJournalEntry, useAllTags } from '../../hooks/useDb';
import { useAuth } from '../../contexts/AuthContext';
import { addJournalEntryCloud, updateJournalEntryCloud } from '../../firebase/sync';
import { formatFull } from '../../utils/dates';
import { AUTO_SAVE_MS } from '../../utils/constants';

/**
 * Convert TipTap HTML to plain text (for search/preview).
 */
function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p>\s*<p>/g, '\n')
    .replace(/<\/li>\s*<li>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * JournalEditor — TipTap rich text editor with title, date, and auto-save.
 * Follows the same auto-save pattern as Organize Yourselves RichTextEditor.
 */
const JournalEditor = forwardRef(function JournalEditor({ entryId, onEntryCreated }, ref) {
  const { user } = useAuth();
  const { entry, loading: _loading } = useJournalEntry(entryId);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const allTags = useAllTags();
  const tagInputRef = useRef(null);

  // Refs for auto-save (same pattern as Organize Yourselves)
  const isDirtyRef = useRef(false);
  const lastSavedRef = useRef('');
  const saveTimerRef = useRef(null);
  const entryIdRef = useRef(entryId);
  const creatingRef = useRef(null);

  // Track entryId changes
  useEffect(() => {
    entryIdRef.current = entryId;
  }, [entryId]);

  // Load entry data when switching entries
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setTags(entry.tags || []);
      if (editor && editor.getHTML() !== entry.html) {
        editor.commands.setContent(entry.html || '<p></p>');
      }
      lastSavedRef.current = entry.html || '<p></p>';
      isDirtyRef.current = false;
    } else if (!entryId) {
      setTitle('');
      setTags([]);
      if (editor) editor.commands.setContent('<p></p>');
      lastSavedRef.current = '<p></p>';
      isDirtyRef.current = false;
    }
  }, [entry, entryId]);

  // Save function
  const performSave = useCallback(async (html) => {
    if (!user) return;
    const currentId = entryIdRef.current;
    if (!currentId) {
      // Lazy creation: create entry on first real content
      if (creatingRef.current) return;
      const text = htmlToPlainText(html);
      if (!text.trim() && !title.trim()) return;

      creatingRef.current = true;
      try {
        setSaveStatus('saving');
        const newId = await addJournalEntryCloud(user.uid, { title, html, plainText: text });
        entryIdRef.current = newId;
        lastSavedRef.current = html;
        isDirtyRef.current = false;
        setSaveStatus('saved');
        if (onEntryCreated) onEntryCreated(newId);
      } finally {
        creatingRef.current = false;
      }
      return;
    }

    setSaveStatus('saving');
    const text = htmlToPlainText(html);
    await updateJournalEntryCloud(user.uid, currentId, { html, plainText: text, title });
    lastSavedRef.current = html;
    isDirtyRef.current = false;
    setSaveStatus('saved');
  }, [user, title, onEntryCreated]);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Begin writing...',
      }),
    ],
    content: entry?.html || '<p></p>',
    editable: true,
    onUpdate({ editor }) {
      isDirtyRef.current = true;
      setSaveStatus(null);

      // Debounced auto-save
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        if (!isDirtyRef.current) return;
        const html = editor.getHTML();
        if (html === lastSavedRef.current) return;
        performSave(html);
      }, AUTO_SAVE_MS);
    },
  });

  // Expose insertContent for quote insertion from scripture pane
  useImperativeHandle(ref, () => ({
    insertContent(html) {
      if (editor) {
        editor.chain().focus().insertContent(html).run();
        isDirtyRef.current = true;
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          if (!isDirtyRef.current) return;
          const h = editor.getHTML();
          if (h !== lastSavedRef.current) performSave(h);
        }, AUTO_SAVE_MS);
      }
    },
  }), [editor, performSave]);

  // Save on visibility change (user switches tabs/apps)
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'hidden' && isDirtyRef.current && editor) {
        const html = editor.getHTML();
        if (html !== lastSavedRef.current) {
          performSave(html);
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [editor, performSave]);

  // Save on beforeunload (user closes browser)
  useEffect(() => {
    function handleBeforeUnload() {
      if (isDirtyRef.current && editor) {
        const html = editor.getHTML();
        if (html !== lastSavedRef.current) {
          performSave(html);
        }
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editor, performSave]);

  // Save on unmount (React navigation)
  useEffect(() => {
    return () => {
      clearTimeout(saveTimerRef.current);
      if (isDirtyRef.current && editor) {
        const html = editor.getHTML();
        if (html !== lastSavedRef.current) {
          performSave(html);
        }
      }
    };
  }, [editor, performSave]);

  // Title change handler — save title with debounce
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (entryIdRef.current && user) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        updateJournalEntryCloud(user.uid, entryIdRef.current, { title: newTitle });
        setSaveStatus('saved');
      }, AUTO_SAVE_MS);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl+S for manual save
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (editor && isDirtyRef.current) {
          performSave(editor.getHTML());
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, performSave]);

  // Tag helpers
  const addTag = useCallback((tag) => {
    const t = tag.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    setTagInput('');
    setShowTagSuggestions(false);
    if (entryIdRef.current && user) {
      updateJournalEntryCloud(user.uid, entryIdRef.current, { tags: next });
    }
  }, [tags, user]);

  const removeTag = useCallback((tag) => {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    if (entryIdRef.current && user) {
      updateJournalEntryCloud(user.uid, entryIdRef.current, { tags: next });
    }
  }, [tags, user]);

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = tagInput.trim()
    ? allTags.filter(t => t.includes(tagInput.trim().toLowerCase()) && !tags.includes(t)).slice(0, 5)
    : [];

  const dateStr = entry?.createdAt || new Date().toISOString();

  return (
    <div className="h-full flex flex-col">
      {/* Header: title + date */}
      <div className="px-5 pt-5 pb-2 flex-shrink-0">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Entry"
          className="w-full font-serif text-2xl font-bold text-ink-600 dark:text-parchment-200 bg-transparent border-none outline-none placeholder:text-parchment-400 p-0"
        />
        <p className="text-xs text-parchment-400 dark:text-parchment-500 font-sans uppercase tracking-wide mt-1">
          {formatFull(dateStr)}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 relative">
          <Tag size={12} className="text-parchment-400 flex-shrink-0" />
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-0.5 text-[11px] font-sans px-2 py-0.5 rounded-full bg-gold-50 dark:bg-gold-600/20 text-gold-600 dark:text-gold-300 border border-gold-200 dark:border-gold-600/40">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-500 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
          <div className="relative">
            <input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={e => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
              placeholder={tags.length === 0 ? 'Add tags...' : ''}
              className="bg-transparent border-none outline-none text-[11px] font-sans text-ink-400 dark:text-parchment-300 placeholder:text-parchment-400 w-24 p-0"
            />
            {showTagSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-ink-600 border border-parchment-200 dark:border-ink-400 rounded-lg shadow-lg z-10 min-w-[120px]">
                {filteredSuggestions.map(tag => (
                  <button
                    key={tag}
                    onMouseDown={() => addTag(tag)}
                    className="block w-full text-left px-3 py-1.5 text-[11px] font-sans text-ink-400 dark:text-parchment-300 hover:bg-gold-50 dark:hover:bg-gold-600/20 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <JournalToolbar editor={editor} />

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-5 py-4 journal-editor warm-scrollbar">
        <EditorContent editor={editor} />
      </div>

      {/* Save status */}
      {saveStatus && (
        <div className="flex items-center gap-1.5 px-5 py-1.5 border-t border-parchment-200 dark:border-dark-border bg-parchment-50/80 dark:bg-dark-surface/80 flex-shrink-0">
          {saveStatus === 'saving' ? (
            <>
              <Cloud size={12} className="text-gold-400 animate-pulse" />
              <span className="text-[10px] text-parchment-400 font-sans">Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-gold-500" />
              <span className="text-[10px] text-parchment-400 font-sans">Saved</span>
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default JournalEditor;
