import { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Quote, Loader2 } from 'lucide-react';
import { useTalk } from '../../hooks/useConference';
import { conferenceLabel } from '../../utils/conferences';

/**
 * Talk display with paragraph selection and quote insertion.
 * Mirrors ScriptureReader patterns.
 */
export default function TalkReader({ year, month, talkKey, onBack, onInsertQuote }) {
  const { talk, loading, error } = useTalk(year, month, talkKey);
  const [selectedParas, setSelectedParas] = useState(new Set());
  const scrollRef = useRef(null);

  // Parse HTML into paragraph elements
  const paragraphs = useMemo(() => {
    if (!talk?.textHtml) return [];
    const div = document.createElement('div');
    div.innerHTML = talk.textHtml;
    const els = [];
    for (const child of div.children) {
      els.push({
        tag: child.tagName.toLowerCase(),
        html: child.innerHTML,
        text: child.textContent,
      });
    }
    return els;
  }, [talk?.textHtml]);

  // Reset selection when talk changes
  useEffect(() => {
    setSelectedParas(new Set());
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [talkKey]);

  const togglePara = (idx) => {
    setSelectedParas(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleInsertQuote = () => {
    if (!talk || selectedParas.size === 0 || !onInsertQuote) return;
    const sorted = [...selectedParas].sort((a, b) => a - b);
    const texts = sorted.map(i => paragraphs[i]?.text).filter(Boolean);
    const quoteText = texts.map(t => `<p>${t}</p>`).join('');
    const attribution = `${talk.speaker}, "${talk.title}", ${conferenceLabel(year, month)} General Conference`;
    const html = `<blockquote>${quoteText}<p><em>— ${attribution}</em></p></blockquote><p></p>`;
    onInsertQuote(html);
    setSelectedParas(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="text-gold-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <BackButton onBack={onBack} />
        <div className="flex-1 flex items-center justify-center px-4 text-center">
          <p className="text-sm font-sans text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!talk) {
    return (
      <div className="flex items-center justify-center h-full text-parchment-400 dark:text-parchment-500 text-sm font-sans">
        Select a talk to begin reading
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Back + header */}
      <BackButton onBack={onBack} />
      <div className="px-5 pt-2 pb-3 flex-shrink-0">
        <h2 className="font-serif text-lg font-bold text-ink-600 dark:text-parchment-200 leading-snug">
          {talk.title}
        </h2>
        <p className="text-sm font-sans text-gold-600 dark:text-gold-400 mt-1">
          {talk.speaker}
        </p>
        <p className="text-xs font-sans text-parchment-400 dark:text-parchment-500">
          {conferenceLabel(year, month)} General Conference
        </p>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto warm-scrollbar px-5 pb-4">
        {paragraphs.map((p, idx) => {
          const Tag = p.tag === 'h2' || p.tag === 'h3' ? p.tag : 'p';
          const isHeading = Tag === 'h2' || Tag === 'h3';
          const isBlockquote = p.tag === 'blockquote';
          const selected = selectedParas.has(idx);

          if (isBlockquote) {
            return (
              <blockquote
                key={idx}
                onClick={() => togglePara(idx)}
                className={`talk-paragraph cursor-pointer border-l-4 border-gold-300 dark:border-gold-600 pl-4 italic my-3 transition-colors ${
                  selected ? 'bg-gold-100 dark:bg-gold-600/20 rounded-r' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: p.html }}
              />
            );
          }

          if (isHeading) {
            return (
              <Tag
                key={idx}
                className={`talk-heading font-serif font-bold text-ink-600 dark:text-parchment-200 ${
                  Tag === 'h2' ? 'text-base mt-5 mb-2' : 'text-sm mt-4 mb-1'
                }`}
                dangerouslySetInnerHTML={{ __html: p.html }}
              />
            );
          }

          return (
            <p
              key={idx}
              onClick={() => togglePara(idx)}
              className={`talk-paragraph cursor-pointer font-serif text-[15px] leading-relaxed text-ink-500 dark:text-parchment-300 my-2 transition-colors rounded px-1 -mx-1 ${
                selected ? 'bg-gold-100 dark:bg-gold-600/20' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: p.html }}
            />
          );
        })}
      </div>

      {/* Quote button */}
      {selectedParas.size > 0 && onInsertQuote && (
        <div className="flex items-center justify-end px-4 py-2 border-t border-parchment-200 dark:border-dark-border flex-shrink-0 bg-parchment-50/80 dark:bg-dark-surface/80">
          <button
            onClick={handleInsertQuote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400 text-white text-xs font-sans font-medium hover:bg-gold-500 transition-colors"
          >
            <Quote size={12} />
            Insert {selectedParas.size} paragraph{selectedParas.size > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}

function BackButton({ onBack }) {
  return (
    <div className="px-3 pt-2 flex-shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-sans text-ink-300 dark:text-parchment-400 hover:text-gold-500 dark:hover:text-gold-400 transition-colors"
      >
        <ArrowLeft size={12} />
        Conference Talks
      </button>
    </div>
  );
}
