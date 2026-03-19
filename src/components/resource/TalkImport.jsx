import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { putTalk } from '../../db';
import { markdownToHtml } from '../../utils/conferences';

/**
 * Manual talk import form — speaker, title, year, month, session, text.
 */
export default function TalkImport({ onBack, onSaved }) {
  const [speaker, setSpeaker] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(4);
  const [session, setSession] = useState('');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = speaker.trim() && title.trim() && text.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const key = `manual-${Date.now()}`;
    const _mm = month === 4 ? '04' : '10';
    const talk = {
      key,
      year: Number(year),
      month: Number(month),
      speaker: speaker.trim(),
      title: title.trim(),
      session_id: '',
      session_title: session.trim() || 'Imported',
      slug: key,
      url: '',
      textMd: text,
      textHtml: markdownToHtml(text),
      source: 'manual',
      fetchedAt: new Date().toISOString(),
    };
    await putTalk(talk);
    setSaving(false);
    onSaved({ year: Number(year), month: Number(month), key });
  };

  const inputClass = "w-full rounded-lg border border-parchment-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-2 text-sm font-sans text-ink-500 dark:text-parchment-300 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none";

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 pt-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-sans text-ink-300 dark:text-parchment-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to list
        </button>
      </div>

      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <h2 className="font-serif text-base font-bold text-ink-600 dark:text-parchment-200">
          Import Talk
        </h2>
        <p className="text-xs font-sans text-parchment-400 dark:text-parchment-500 mt-1">
          Paste talk text (plain text or Markdown).
        </p>
      </div>

      <div className="flex-1 overflow-y-auto warm-scrollbar px-4 pb-4 space-y-3">
        <div>
          <label className="block text-xs font-sans font-medium text-ink-400 dark:text-parchment-400 mb-1">Speaker *</label>
          <input type="text" value={speaker} onChange={e => setSpeaker(e.target.value)} className={inputClass} placeholder="Elder Name" />
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-ink-400 dark:text-parchment-400 mb-1">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Talk Title" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-sans font-medium text-ink-400 dark:text-parchment-400 mb-1">Year *</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className={inputClass} min={1900} max={2100} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-sans font-medium text-ink-400 dark:text-parchment-400 mb-1">Month *</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={inputClass}>
              <option value={4}>April</option>
              <option value={10}>October</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-ink-400 dark:text-parchment-400 mb-1">Session</label>
          <input type="text" value={session} onChange={e => setSession(e.target.value)} className={inputClass} placeholder="Saturday Morning (optional)" />
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-ink-400 dark:text-parchment-400 mb-1">Text *</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className={`${inputClass} min-h-[200px] resize-y`}
            placeholder="Paste talk text or Markdown here..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Talk'}
        </button>
      </div>
    </div>
  );
}
