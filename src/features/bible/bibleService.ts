import { BibleVerse, BibleTranslationCode, BibleHighlight, BibleBookmark, BibleNote } from '../../types';
import { BIBLE_BOOKS, BIBLE_TRANSLATIONS } from './bibleBooks';
import { CURATED_VERSES, CHAPTER_SECTIONS, VERSE_FOOTNOTES, RED_LETTER_CONFIG } from './bibleContent';
import { ChurchDataStore } from '../../services/churchDataStore';

// Local storage keys
const STORAGE_HIGHLIGHTS = 'bjc_bible_highlights_v1';
const STORAGE_BOOKMARKS = 'bjc_bible_bookmarks_v1';
const STORAGE_NOTES = 'bjc_bible_notes_v1';
const STORAGE_HISTORY = 'bjc_bible_history_v1';

export class BibleService {
  // In-memory cache for parsed chapter verses
  private static memoryCache: Map<string, BibleVerse[]> = new Map();

  // In-memory cache for full book JSONs: key is `${translation}:${bookId}` -> { [chapter]: { [verse]: text } }
  private static bookCache: Map<string, Record<string, Record<string, string>>> = new Map();

  // In-flight fetch promises to prevent duplicate simultaneous network requests
  private static loadingPromises: Map<string, Promise<Record<string, Record<string, string>> | null>> = new Map();

  // -------------------------------------------------------------
  // 1. ASYNC BOOK DATA LOADER
  // -------------------------------------------------------------
  static async loadBookData(
    bookId: string,
    translation: BibleTranslationCode = 'NKJV'
  ): Promise<Record<string, Record<string, string>> | null> {
    const key = `${translation.toUpperCase()}:${bookId.toUpperCase()}`;

    // 1. Check in-memory book cache
    if (this.bookCache.has(key)) {
      return this.bookCache.get(key)!;
    }

    // 2. Check in-flight promise
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    // 3. Initiate fetch for local static book file
    const promise = (async () => {
      // Normalize translation code for URL
      const transFolder = translation.toLowerCase();
      const primaryUrl = `/bible/${transFolder}/${bookId.toUpperCase()}.json`;

      try {
        let res = await fetch(primaryUrl);
        if (!res.ok) {
          // If translation not stored locally (e.g. FSV/ASV), fallback to NKJV then KJV
          const fallbackTrans = transFolder !== 'nkjv' ? 'nkjv' : 'kjv';
          res = await fetch(`/bible/${fallbackTrans}/${bookId.toUpperCase()}.json`);
        }

        if (res.ok) {
          const chapters = await res.json();
          if (chapters && typeof chapters === 'object') {
            this.bookCache.set(key, chapters);
            return chapters;
          }
        }
      } catch (err) {
        console.warn(`Could not load local scripture file for ${key}:`, err);
      } finally {
        this.loadingPromises.delete(key);
      }

      return null;
    })();

    this.loadingPromises.set(key, promise);
    return promise;
  }

  // -------------------------------------------------------------
  // 2. FETCH CHAPTER VERSES (Complete Scripture)
  // -------------------------------------------------------------
  static async fetchChapterVerses(
    bookId: string,
    chapter: number,
    translation: BibleTranslationCode = 'NKJV'
  ): Promise<BibleVerse[]> {
    const book = BIBLE_BOOKS.find(b => b.id.toUpperCase() === bookId.toUpperCase());
    const bookName = book ? book.name : bookId;
    const cacheKey = `${bookId.toUpperCase()}:${chapter}:${translation.toUpperCase()}`;

    // 1. Return from in-memory verse cache if available
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // 2. Load the entire book data from static JSON
    const bookData = await this.loadBookData(bookId, translation);

    if (bookData) {
      const chapterData = bookData[chapter] || bookData[String(chapter)];
      if (chapterData && typeof chapterData === 'object') {
        const chapterKey = `${bookId.toUpperCase()}:${chapter}`;
        const sectionList = CHAPTER_SECTIONS[chapterKey];
        const isGospel = ['MAT', 'MRK', 'LUK', 'JHN'].includes(bookId.toUpperCase());

        const verses: BibleVerse[] = Object.entries(chapterData).map(([vStr, text]) => {
          const vNum = parseInt(vStr, 10);
          const fullKey = `${bookId.toUpperCase()}:${chapter}:${vNum}`;
          const section = sectionList?.find(s => s.verse === vNum);
          const footnote = VERSE_FOOTNOTES[fullKey];
          const redCfg = RED_LETTER_CONFIG[fullKey];

          return {
            book: bookName,
            chapter,
            verse: vNum,
            text: (text || '').replace(/\s+/g, ' ').trim(),
            translation,
            sectionTitle: section?.title,
            isJesusWords: redCfg?.all ?? (isGospel && redCfg ? true : false),
            redSegments: redCfg?.segments,
            hasNote: !!footnote,
            footnote
          };
        });

        // Ensure numerical order of verses
        verses.sort((a, b) => a.verse - b.verse);

        // Cache in memory for subsequent instant accesses
        this.memoryCache.set(cacheKey, verses);
        return verses;
      }
    }

    // 3. Fallback to curated verses if available
    const curated = this.getChapterVerses(bookId, chapter, translation);
    if (curated.length > 0) {
      this.memoryCache.set(cacheKey, curated);
      return curated;
    }

    return [];
  }

  // -------------------------------------------------------------
  // 3. SYNCHRONOUS CHAPTER VERSES (Memory or Curated Cache)
  // -------------------------------------------------------------
  static getChapterVerses(
    bookId: string,
    chapter: number,
    translation: BibleTranslationCode = 'NKJV'
  ): BibleVerse[] {
    const cacheKey = `${bookId.toUpperCase()}:${chapter}:${translation.toUpperCase()}`;
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    const book = BIBLE_BOOKS.find(b => b.id.toUpperCase() === bookId.toUpperCase());
    const bookName = book ? book.name : bookId;
    const bookKey = `${translation.toUpperCase()}:${bookId.toUpperCase()}`;

    // 1. Check if the book was already parsed in bookCache
    if (this.bookCache.has(bookKey)) {
      const bookData = this.bookCache.get(bookKey)!;
      const chapterData = bookData[chapter] || bookData[String(chapter)];
      if (chapterData && typeof chapterData === 'object') {
        const chapterKey = `${bookId.toUpperCase()}:${chapter}`;
        const sectionList = CHAPTER_SECTIONS[chapterKey];
        const isGospel = ['MAT', 'MRK', 'LUK', 'JHN'].includes(bookId.toUpperCase());

        const verses: BibleVerse[] = Object.entries(chapterData).map(([vStr, text]) => {
          const vNum = parseInt(vStr, 10);
          const fullKey = `${bookId.toUpperCase()}:${chapter}:${vNum}`;
          const section = sectionList?.find(s => s.verse === vNum);
          const footnote = VERSE_FOOTNOTES[fullKey];
          const redCfg = RED_LETTER_CONFIG[fullKey];

          return {
            book: bookName,
            chapter,
            verse: vNum,
            text: (text || '').replace(/\s+/g, ' ').trim(),
            translation,
            sectionTitle: section?.title,
            isJesusWords: redCfg?.all ?? (isGospel && redCfg ? true : false),
            redSegments: redCfg?.segments,
            hasNote: !!footnote,
            footnote
          };
        });

        verses.sort((a, b) => a.verse - b.verse);
        this.memoryCache.set(cacheKey, verses);
        return verses;
      }
    }

    // 2. Check curated verses (John 3, Romans 8, Psalm 23, Colossians 1, Matthew 5, Philippians 4)
    const prefix = `${bookId.toUpperCase()}:${chapter}:`;
    const curatedKeys = Object.keys(CURATED_VERSES).filter(k => k.startsWith(prefix));

    if (curatedKeys.length > 0) {
      const chapterKey = `${bookId.toUpperCase()}:${chapter}`;
      const sectionList = CHAPTER_SECTIONS[chapterKey];
      const verses: BibleVerse[] = [];

      curatedKeys.forEach(k => {
        const parts = k.split(':');
        const vNum = parseInt(parts[2], 10);
        const transMap = CURATED_VERSES[k];
        const text = transMap[translation] || transMap['NKJV'] || transMap['NIV'] || transMap['KJV'] || transMap['WEB'] || '';
        const section = sectionList?.find(s => s.verse === vNum);
        const footnote = VERSE_FOOTNOTES[k];
        const redCfg = RED_LETTER_CONFIG[k];

        verses.push({
          book: bookName,
          chapter,
          verse: vNum,
          text,
          translation,
          sectionTitle: section?.title,
          isJesusWords: redCfg?.all ?? false,
          redSegments: redCfg?.segments,
          hasNote: !!footnote,
          footnote
        });
      });

      verses.sort((a, b) => a.verse - b.verse);
      this.memoryCache.set(cacheKey, verses);
      return verses;
    }

    // 3. Return empty array while async loadBookData is fetching real scripture
    return [];
  }

  // -------------------------------------------------------------
  // 4. VERSE COMPARISON (All Translations)
  // -------------------------------------------------------------
  static getVerseComparison(
    bookId: string,
    chapter: number,
    verse: number
  ): {
    translation: BibleTranslationCode;
    name: string;
    text: string;
    copyright: string;
  }[] {
    const key = `${bookId.toUpperCase()}:${chapter}:${verse}`;
    const curated = CURATED_VERSES[key];

    return BIBLE_TRANSLATIONS.map(tr => {
      let text = '';

      // Check loaded book cache first
      const bookData = this.bookCache.get(`${tr.code.toUpperCase()}:${bookId.toUpperCase()}`);
      if (bookData && bookData[chapter] && bookData[chapter][verse]) {
        text = bookData[chapter][verse];
      } else if (curated && curated[tr.code]) {
        text = curated[tr.code];
      } else if (curated && (curated['NKJV'] || curated['KJV'])) {
        text = (curated['NKJV'] || curated['KJV']) + ` [${tr.code} rendering]`;
      } else {
        // Fallback to NKJV book cache if available
        const nkjvData = this.bookCache.get(`NKJV:${bookId.toUpperCase()}`);
        if (nkjvData && nkjvData[chapter] && nkjvData[chapter][verse]) {
          text = nkjvData[chapter][verse];
        } else {
          text = `Reading verse ${verse} in ${tr.name}...`;
        }
      }

      return {
        translation: tr.code,
        name: tr.name,
        text,
        copyright: tr.copyright
      };
    });
  }

  // -------------------------------------------------------------
  // 5. ENHANCED SEARCH (Reference Jump & Keyword Search)
  // -------------------------------------------------------------
  static searchVerses(
    query: string,
    translation: BibleTranslationCode = 'NKJV'
  ): BibleVerse[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const results: BibleVerse[] = [];

    // 1. Try Reference Parsing (e.g. "John 3:16", "Gen 1:1", "Psalm 23:1", "Heb 12:2", "Rev 22:21")
    const refMatch = q.match(/^([1-3]?\s*[a-zA-Z]+)\s*(\d+)[:.]?(\d+)?$/);
    if (refMatch) {
      const rawBook = refMatch[1].trim().replace(/\s+/g, ' ');
      const chap = parseInt(refMatch[2], 10);
      const vNum = refMatch[3] ? parseInt(refMatch[3], 10) : undefined;

      // Match book by full name, ID, or prefix
      const matchedBook = BIBLE_BOOKS.find(b => 
        b.name.toLowerCase() === rawBook ||
        b.id.toLowerCase() === rawBook ||
        (rawBook === 'psalm' && b.id === 'PSA') ||
        (rawBook === 'jn' && b.id === 'JHN') ||
        b.name.toLowerCase().startsWith(rawBook)
      );

      if (matchedBook && chap >= 1 && chap <= matchedBook.chaptersCount) {
        // Check if book is already in bookCache
        const bookData = this.bookCache.get(`${translation.toUpperCase()}:${matchedBook.id}`) ||
                         this.bookCache.get(`NKJV:${matchedBook.id}`) ||
                         this.bookCache.get(`KJV:${matchedBook.id}`);

        if (bookData && bookData[chap]) {
          if (vNum && bookData[chap][vNum]) {
            results.push({
              book: matchedBook.name,
              chapter: chap,
              verse: vNum,
              text: bookData[chap][vNum],
              translation
            });
            return results;
          } else if (!vNum) {
            // Return first few verses of the chapter
            const versesObj = bookData[chap];
            Object.entries(versesObj).slice(0, 5).forEach(([vStr, text]) => {
              results.push({
                book: matchedBook.name,
                chapter: chap,
                verse: parseInt(vStr, 10),
                text,
                translation
              });
            });
            return results;
          }
        }
      }
    }

    // 2. Search Curated Verses
    for (const [key, transMap] of Object.entries(CURATED_VERSES)) {
      const parts = key.split(':');
      const bId = parts[0];
      const chap = parseInt(parts[1], 10);
      const vNum = parseInt(parts[2], 10);
      const book = BIBLE_BOOKS.find(b => b.id.toUpperCase() === bId.toUpperCase());
      const bName = book ? book.name : bId;
      const refStr = `${bName} ${chap}:${vNum}`.toLowerCase();
      const verseText = (transMap[translation] || transMap['NKJV'] || transMap['KJV'] || '').toLowerCase();

      if (refStr.includes(q) || verseText.includes(q) || bName.toLowerCase().includes(q)) {
        results.push({
          book: bName,
          chapter: chap,
          verse: vNum,
          text: transMap[translation] || transMap['NKJV'] || transMap['KJV'] || '',
          translation
        });
      }
    }

    // 3. Search already loaded books in bookCache for keyword matches
    for (const [cacheKey, chapters] of this.bookCache.entries()) {
      if (results.length >= 25) break; // limit results for speed
      const [trans, bId] = cacheKey.split(':');
      if (trans !== translation.toUpperCase()) continue;

      const book = BIBLE_BOOKS.find(b => b.id.toUpperCase() === bId.toUpperCase());
      const bName = book ? book.name : bId;

      for (const [chStr, versesObj] of Object.entries(chapters)) {
        if (results.length >= 25) break;
        const chap = parseInt(chStr, 10);

        for (const [vStr, text] of Object.entries(versesObj)) {
          if (results.length >= 25) break;
          const vNum = parseInt(vStr, 10);

          if (text.toLowerCase().includes(q)) {
            // Avoid duplicate if already found in curated
            if (!results.some(r => r.book === bName && r.chapter === chap && r.verse === vNum)) {
              results.push({
                book: bName,
                chapter: chap,
                verse: vNum,
                text,
                translation
              });
            }
          }
        }
      }
    }

    return results;
  }

  // -------------------------------------------------------------
  // 6. ANNOTATIONS & STUDY TOOLS
  // -------------------------------------------------------------
  private static getCurrentUserId(userId?: string): string {
    if (userId) return userId;
    const user = ChurchDataStore.getCurrentUser();
    return user ? user.id : ChurchDataStore.getRequiredCurrentUser().id;
  }

  // --- HIGHLIGHTS ---
  static getHighlights(userId?: string): BibleHighlight[] {
    try {
      const raw = localStorage.getItem(STORAGE_HIGHLIGHTS);
      const list: BibleHighlight[] = raw ? JSON.parse(raw) : [];
      const uid = this.getCurrentUserId(userId);
      return list.filter(h => h.userId === uid || h.userId === 'current-user');
    } catch {
      return [];
    }
  }

  static toggleHighlight(book: string, chapter: number, verse: number, color: BibleHighlight['color']): BibleHighlight[] {
    const raw = localStorage.getItem(STORAGE_HIGHLIGHTS);
    const allList: BibleHighlight[] = raw ? JSON.parse(raw) : [];
    const uid = this.getCurrentUserId();
    
    const existingIndex = allList.findIndex(h => (h.userId === uid || h.userId === 'current-user') && h.book === book && h.chapter === chapter && h.verse === verse);
    
    let updated: BibleHighlight[];
    if (existingIndex >= 0) {
      if (allList[existingIndex].color === color) {
        // Remove highlight
        updated = allList.filter((_, idx) => idx !== existingIndex);
      } else {
        // Change color
        updated = [...allList];
        updated[existingIndex].color = color;
      }
    } else {
      updated = [
        ...allList,
        {
          id: `hl-${Date.now()}`,
          userId: uid,
          book,
          chapter,
          verse,
          color,
          createdAt: new Date().toISOString()
        }
      ];
    }
    localStorage.setItem(STORAGE_HIGHLIGHTS, JSON.stringify(updated));
    return updated.filter(h => h.userId === uid || h.userId === 'current-user');
  }

  // --- BOOKMARKS ---
  static getBookmarks(userId?: string): BibleBookmark[] {
    try {
      const raw = localStorage.getItem(STORAGE_BOOKMARKS);
      const list: BibleBookmark[] = raw ? JSON.parse(raw) : [];
      const uid = this.getCurrentUserId(userId);
      return list.filter(b => b.userId === uid || b.userId === 'current-user');
    } catch {
      return [];
    }
  }

  static toggleBookmark(book: string, chapter: number, verse: number, label?: string): BibleBookmark[] {
    const raw = localStorage.getItem(STORAGE_BOOKMARKS);
    const allList: BibleBookmark[] = raw ? JSON.parse(raw) : [];
    const uid = this.getCurrentUserId();

    const existing = allList.find(b => (b.userId === uid || b.userId === 'current-user') && b.book === book && b.chapter === chapter && b.verse === verse);
    let updated: BibleBookmark[];
    if (existing) {
      updated = allList.filter(b => b.id !== existing.id);
    } else {
      updated = [
        ...allList,
        {
          id: `bm-${Date.now()}`,
          userId: uid,
          book,
          chapter,
          verse,
          label: label || `${book} ${chapter}:${verse}`,
          createdAt: new Date().toISOString()
        }
      ];
    }
    localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(updated));
    return updated.filter(b => b.userId === uid || b.userId === 'current-user');
  }

  // --- PRIVATE NOTES ---
  static getNotes(userId?: string): BibleNote[] {
    const defaultNotes: BibleNote[] = [
      {
        id: 'note-1',
        userId: 'user-john-miko',
        book: 'Colossians',
        chapter: 1,
        verse: 17,
        verseText: 'And He is before all things, and in Him all things hold together.',
        title: 'Supremacy of Christ over All Things',
        content: 'Christ is not just the creator at the beginning, but the continuous preserver of every atom and life right now. Surrender all anxiety to Him.',
        topic: 'Christology / Faith',
        isPrivate: true,
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z'
      }
    ];

    try {
      const raw = localStorage.getItem(STORAGE_NOTES);
      const list: BibleNote[] = raw ? JSON.parse(raw) : defaultNotes;
      const uid = this.getCurrentUserId(userId);
      return list.filter(n => n.userId === uid || n.userId === 'current-user' || (!n.isPrivate));
    } catch {
      return [];
    }
  }

  static saveNote(note: Omit<BibleNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): BibleNote[] {
    const raw = localStorage.getItem(STORAGE_NOTES);
    const list: BibleNote[] = raw ? JSON.parse(raw) : [];
    const uid = this.getCurrentUserId();
    const now = new Date().toISOString();

    let updated: BibleNote[];
    if (note.id) {
      updated = list.map(n => n.id === note.id ? { ...n, ...note, userId: uid, updatedAt: now } : n);
    } else {
      const newNote: BibleNote = {
        ...note,
        id: `note-${Date.now()}`,
        userId: uid,
        createdAt: now,
        updatedAt: now
      };
      updated = [newNote, ...list];
    }
    localStorage.setItem(STORAGE_NOTES, JSON.stringify(updated));
    return updated.filter(n => n.userId === uid || n.userId === 'current-user' || !n.isPrivate);
  }

  static deleteNote(noteId: string): BibleNote[] {
    const raw = localStorage.getItem(STORAGE_NOTES);
    const list: BibleNote[] = raw ? JSON.parse(raw) : [];
    const uid = this.getCurrentUserId();
    const updated = list.filter(n => n.id !== noteId);
    localStorage.setItem(STORAGE_NOTES, JSON.stringify(updated));
    return updated.filter(n => n.userId === uid || n.userId === 'current-user' || !n.isPrivate);
  }

  // --- READING HISTORY ---
  static recordReading(book: string, chapter: number) {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY);
      const list: { book: string; chapter: number; timestamp: string }[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter(item => !(item.book === book && item.chapter === chapter));
      const updated = [{ book, chapter, timestamp: new Date().toISOString() }, ...filtered].slice(0, 20);
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }

  static getReadingHistory(): { book: string; chapter: number; timestamp: string }[] {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY);
      return raw ? JSON.parse(raw) : [
        { book: 'Colossians', chapter: 1, timestamp: new Date().toISOString() },
        { book: 'John', chapter: 3, timestamp: new Date(Date.now() - 86400000).toISOString() },
        { book: 'Psalms', chapter: 23, timestamp: new Date(Date.now() - 172800000).toISOString() }
      ];
    } catch {
      return [];
    }
  }
}
