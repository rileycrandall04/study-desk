/**
 * Scripture data layer — volume registry, lazy loading, normalization, search.
 * Uses @bencrowder/scriptures-json (CC0 public domain).
 */

export const VOLUMES = [
  { id: 'bom', title: 'Book of Mormon', abbr: 'BOM' },
  { id: 'dc',  title: 'Doctrine & Covenants', abbr: 'D&C' },
  { id: 'pgp', title: 'Pearl of Great Price', abbr: 'PGP' },
  { id: 'ot',  title: 'Old Testament', abbr: 'OT' },
  { id: 'nt',  title: 'New Testament', abbr: 'NT' },
];

const volumeCache = new Map();

const importers = {
  bom: () => import('@bencrowder/scriptures-json/book-of-mormon.json'),
  dc:  () => import('@bencrowder/scriptures-json/doctrine-and-covenants.json'),
  pgp: () => import('@bencrowder/scriptures-json/pearl-of-great-price.json'),
  ot:  () => import('@bencrowder/scriptures-json/old-testament.json'),
  nt:  () => import('@bencrowder/scriptures-json/new-testament.json'),
};

/**
 * Normalize a volume's raw JSON into a uniform structure:
 * { title, books: [{ name, chapters: [{ number, reference, verses: [{ verse, text, reference }] }] }] }
 *
 * D&C uses sections instead of books — we wrap them in a single pseudo-book.
 */
function normalize(id, raw) {
  if (id === 'dc') {
    return {
      title: raw.title,
      books: [{
        name: 'Sections',
        chapters: raw.sections.map(s => ({
          number: s.section,
          reference: s.reference,
          verses: s.verses,
        })),
      }],
      singleBook: true, // flag: skip book level in nav
    };
  }

  return {
    title: raw.title,
    books: raw.books.map(b => ({
      name: b.book,
      chapters: b.chapters.map(ch => ({
        number: ch.chapter,
        reference: ch.reference,
        verses: ch.verses,
      })),
    })),
    singleBook: false,
  };
}

/**
 * Load and normalize a volume by ID. Caches result for subsequent calls.
 */
export async function loadVolume(id) {
  if (volumeCache.has(id)) return volumeCache.get(id);
  const importer = importers[id];
  if (!importer) throw new Error(`Unknown volume: ${id}`);
  const raw = await importer();
  const data = normalize(id, raw.default || raw);
  volumeCache.set(id, data);
  return data;
}

/**
 * Search all scriptures for a query string.
 * Loads all volumes into cache, then scans verse text.
 */
export async function searchScriptures(query, maxResults = 50) {
  if (!query || query.trim().length < 2) return [];
  const lower = query.toLowerCase();
  const results = [];

  for (const vol of VOLUMES) {
    const data = await loadVolume(vol.id);
    for (let bi = 0; bi < data.books.length; bi++) {
      const book = data.books[bi];
      for (let ci = 0; ci < book.chapters.length; ci++) {
        const ch = book.chapters[ci];
        for (const v of ch.verses) {
          if (v.text.toLowerCase().includes(lower)) {
            results.push({
              reference: v.reference,
              text: v.text,
              volumeId: vol.id,
              bookIdx: bi,
              chapterIdx: ci,
            });
            if (results.length >= maxResults) return results;
          }
        }
      }
    }
  }

  return results;
}
