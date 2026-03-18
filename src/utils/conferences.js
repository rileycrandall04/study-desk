/**
 * Conference talk data layer — hardcoded conference list, YAML/Markdown parsers,
 * fetch from GitHub (1971-2015) and Church website (2016+), Dexie cache.
 */
import {
  getConferenceTalks,
  getTalk,
  putTalk,
  putTalksBulk,
  getAllConferenceKeys,
} from '../db';

/* ── Conference List ──────────────────────────────────────── */

function ghConfs(startYear, endYear) {
  const list = [];
  for (let y = endYear; y >= startYear; y--) {
    list.push({ year: y, month: 10, source: 'github' });
    list.push({ year: y, month: 4, source: 'github' });
  }
  return list;
}

function churchConfs(startYear, endYear) {
  const list = [];
  for (let y = endYear; y >= startYear; y--) {
    list.push({ year: y, month: 10, source: 'church' });
    list.push({ year: y, month: 4, source: 'church' });
  }
  return list;
}

/** Reverse chronological list of all conferences. */
export const CONFERENCES = [
  ...churchConfs(2016, 2025),
  ...ghConfs(1971, 2015),
];

/** "April 2015" / "October 2015" */
export function conferenceLabel(year, month) {
  return `${month === 4 ? 'April' : 'October'} ${year}`;
}

/** Two-digit month for URL paths: "04" or "10" */
function mm(month) {
  return month === 4 ? '04' : '10';
}

/* ── Lightweight YAML parser for index.yml ────────────────── */

/**
 * Parse the iffy/generalconference index.yml format.
 * Each item has fields like `key:`, `speaker:`, `title:`, `session_id:`, `session_title:`.
 * Returns array of objects.
 */
export function parseIndexYaml(text) {
  const items = [];
  let current = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trimEnd();
    if (/^items:\s*$/.test(line) || /^\s*$/.test(line)) continue;

    // New item starts with "- key:"
    const itemMatch = line.match(/^- (\w[\w_]*):\s*(.*)$/);
    if (itemMatch) {
      if (current) items.push(current);
      current = {};
      current[itemMatch[1]] = itemMatch[2].trim();
      continue;
    }

    // Continuation field "  field: value"
    const fieldMatch = line.match(/^\s+(\w[\w_]*):\s*(.*)$/);
    if (fieldMatch && current) {
      current[fieldMatch[1]] = fieldMatch[2].trim();
    }
  }
  if (current) items.push(current);
  return items;
}

/* ── Lightweight Markdown → HTML ──────────────────────────── */

/**
 * Convert simple Markdown to HTML. Handles headings, paragraphs,
 * blockquotes, bold, italic, links, footnote refs.
 */
export function markdownToHtml(md) {
  if (!md) return '';
  const lines = md.split('\n');
  const out = [];
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Headings
    if (line.startsWith('## ')) {
      if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false; }
      out.push(`<h3>${inlineFormat(line.slice(3))}</h3>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false; }
      out.push(`<h2>${inlineFormat(line.slice(2))}</h2>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      if (!inBlockquote) { out.push('<blockquote>'); inBlockquote = true; }
      out.push(`<p>${inlineFormat(line.slice(2))}</p>`);
      continue;
    }

    if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false; }

    // Blank line
    if (line.trim() === '') continue;

    // Regular paragraph
    out.push(`<p>${inlineFormat(line)}</p>`);
  }
  if (inBlockquote) out.push('</blockquote>');
  return out.join('\n');
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\[(\d+)\]/g, '<sup class="talk-footnote">$1</sup>');
}

/* ── Church website HTML parser ───────────────────────────── */

/**
 * Extract __INITIAL_STATE__ JSON from a Church website page.
 * Returns parsed object or null on failure.
 */
function extractInitialState(html) {
  const match = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});?\s*<\/script>/s);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

/**
 * Parse a conference index page to extract talk list.
 * Returns array of { key, speaker, title, url, session_title } or null.
 */
export function parseChurchIndexPage(html) {
  const state = extractInitialState(html);
  if (!state) return null;

  try {
    // Navigate the __INITIAL_STATE__ structure
    const entries = state?.defined?.content?.entries;
    if (!entries) return null;

    const talks = [];
    for (const entry of Object.values(entries)) {
      if (!entry?.headline || !entry?.id) continue;
      // Filter to actual talk entries (have author/speaker)
      const author = entry.author || entry.byline || '';
      if (!author) continue;
      talks.push({
        key: entry.id || entry.uri?.split('/').pop() || `church-${Date.now()}`,
        speaker: author,
        title: entry.headline,
        url: entry.uri || entry.canonicalUrl || '',
        session_title: entry.publication?.title || '',
      });
    }
    return talks.length > 0 ? talks : null;
  } catch {
    return null;
  }
}

/**
 * Parse a single talk page to extract body HTML.
 * Returns HTML string or null.
 */
export function parseChurchTalkPage(html) {
  const state = extractInitialState(html);
  if (!state) return null;

  try {
    const content = state?.defined?.content;
    if (!content) return null;
    // Look for body content
    const body = content.body || content.content;
    if (typeof body === 'string') return body;
    // Some pages have body as array of sections
    if (Array.isArray(body)) return body.map(b => b.content || b).join('');
    return null;
  } catch {
    return null;
  }
}

/* ── Fetch functions ──────────────────────────────────────── */

const GITHUB_BASE = 'https://raw.githubusercontent.com/iffy/generalconference/gh-pages/data/eng';

/** Fetch talk index from GitHub repo (1971-2015). */
export async function fetchGithubIndex(year, month) {
  const url = `${GITHUB_BASE}/${year}-${mm(month)}/index.yml`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub index fetch failed: ${res.status}`);
  const text = await res.text();
  return parseIndexYaml(text);
}

/** Fetch talk text from GitHub repo. */
export async function fetchGithubTalkText(year, month, key) {
  const url = `${GITHUB_BASE}/${year}-${mm(month)}/${key}/text.md`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub talk fetch failed: ${res.status}`);
  return res.text();
}

/** Fetch conference index from Church website (2016+). */
export async function fetchChurchIndex(year, month) {
  const url = `https://www.churchofjesuschrist.org/study/general-conference/${year}/${mm(month)}?lang=eng`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Church index fetch failed: ${res.status}`);
  const html = await res.text();
  return parseChurchIndexPage(html);
}

/** Fetch individual talk from Church website. */
export async function fetchChurchTalkText(talkUrl) {
  const fullUrl = talkUrl.startsWith('http')
    ? talkUrl
    : `https://www.churchofjesuschrist.org${talkUrl}?lang=eng`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`Church talk fetch failed: ${res.status}`);
  const html = await res.text();
  return parseChurchTalkPage(html);
}

/* ── Cache-first loading ──────────────────────────────────── */

/**
 * Load talks for a conference. Checks Dexie cache first, fetches on miss.
 * Returns array of talk metadata objects (without full text).
 */
export async function loadConferenceTalks(year, month) {
  // Check cache
  const cached = await getConferenceTalks(year, month);
  if (cached.length > 0) return cached;

  // Determine source
  const conf = CONFERENCES.find(c => c.year === year && c.month === month);
  const source = conf?.source || (year <= 2015 ? 'github' : 'church');

  let items;
  if (source === 'github') {
    items = await fetchGithubIndex(year, month);
  } else {
    items = await fetchChurchIndex(year, month);
    if (!items) throw new Error('Could not parse Church conference page. Try manual import.');
  }

  // Build talk records
  const talks = items.map(item => ({
    key: `${year}-${mm(month)}-${item.key}`,
    year,
    month,
    speaker: item.speaker || '',
    title: item.title || '',
    session_id: item.session_id || '',
    session_title: item.session_title || '',
    slug: item.key,
    url: item.url || '',
    textMd: null,
    textHtml: null,
    source,
    fetchedAt: new Date().toISOString(),
  }));

  await putTalksBulk(talks);
  return talks;
}

/**
 * Load a single talk with full text. Fetches text if not cached.
 */
export async function loadTalk(year, month, key) {
  let talk = await getTalk(key);

  // If we have text, return immediately
  if (talk?.textHtml) return talk;

  // Need to fetch text
  const conf = CONFERENCES.find(c => c.year === year && c.month === month);
  const source = conf?.source || talk?.source || (year <= 2015 ? 'github' : 'church');

  if (source === 'github') {
    const slug = talk?.slug || key.replace(`${year}-${mm(month)}-`, '');
    const md = await fetchGithubTalkText(year, month, slug);
    const html = markdownToHtml(md);
    const updated = { ...(talk || { key, year, month, source }), textMd: md, textHtml: html, fetchedAt: new Date().toISOString() };
    await putTalk(updated);
    return updated;
  } else {
    const talkUrl = talk?.url;
    if (!talkUrl) throw new Error('No URL for church talk');
    const html = await fetchChurchTalkText(talkUrl);
    if (!html) throw new Error('Could not parse talk page');
    const updated = { ...(talk || { key, year, month, source }), textHtml: html, fetchedAt: new Date().toISOString() };
    await putTalk(updated);
    return updated;
  }
}
