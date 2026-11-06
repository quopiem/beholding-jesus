import { BibleBook, BibleTranslation } from '../../types';

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  {
    code: 'KJV',
    name: 'King James Version',
    description: 'Traditional poetic English standard, public domain, majestic phrasing.',
    isAvailableOffline: true,
    copyright: 'Public Domain'
  },
  {
    code: 'WEB',
    name: 'World English Bible',
    description: 'Modern accurate English translation in the public domain.',
    isAvailableOffline: true,
    copyright: 'Public Domain'
  },
  {
    code: 'ASV',
    name: 'American Standard Version',
    description: 'Literal historical translation known for textual fidelity.',
    isAvailableOffline: true,
    copyright: 'Public Domain'
  },
  {
    code: 'NIV',
    name: 'New International Version',
    description: 'Contemporary thought-for-thought balance of accuracy and readability.',
    isAvailableOffline: false,
    copyright: 'Biblica, Inc. (Used under educational preview license)'
  },
  {
    code: 'ESV',
    name: 'English Standard Version',
    description: 'Essentially literal, beloved for precision and theological depth.',
    isAvailableOffline: false,
    copyright: 'Crossway / Good News Publishers'
  },
  {
    code: 'NLT',
    name: 'New Living Translation',
    description: 'Clear, modern language with dynamic equivalence.',
    isAvailableOffline: false,
    copyright: 'Tyndale House Publishers'
  },
  {
    code: 'FSV',
    name: 'Filipino Standard Version (FSV)',
    description: 'Salin sa wikang Filipino para sa mas malinaw na pagkaunawa sa Salita ng Diyos.',
    isAvailableOffline: true,
    copyright: 'Philippine Bible Society'
  }
];

export const BIBLE_BOOKS: BibleBook[] = [
  // OLD TESTAMENT
  { id: 'GEN', name: 'Genesis', testament: 'OT', chaptersCount: 50, category: 'Law' },
  { id: 'EXO', name: 'Exodus', testament: 'OT', chaptersCount: 40, category: 'Law' },
  { id: 'LEV', name: 'Leviticus', testament: 'OT', chaptersCount: 27, category: 'Law' },
  { id: 'NUM', name: 'Numbers', testament: 'OT', chaptersCount: 36, category: 'Law' },
  { id: 'DEU', name: 'Deuteronomy', testament: 'OT', chaptersCount: 34, category: 'Law' },
  { id: 'JOS', name: 'Joshua', testament: 'OT', chaptersCount: 24, category: 'History' },
  { id: 'JDG', name: 'Judges', testament: 'OT', chaptersCount: 21, category: 'History' },
  { id: 'RUT', name: 'Ruth', testament: 'OT', chaptersCount: 4, category: 'History' },
  { id: '1SA', name: '1 Samuel', testament: 'OT', chaptersCount: 31, category: 'History' },
  { id: '2SA', name: '2 Samuel', testament: 'OT', chaptersCount: 24, category: 'History' },
  { id: '1KI', name: '1 Kings', testament: 'OT', chaptersCount: 22, category: 'History' },
  { id: '2KI', name: '2 Kings', testament: 'OT', chaptersCount: 25, category: 'History' },
  { id: '1CH', name: '1 Chronicles', testament: 'OT', chaptersCount: 29, category: 'History' },
  { id: '2CH', name: '2 Chronicles', testament: 'OT', chaptersCount: 36, category: 'History' },
  { id: 'EZR', name: 'Ezra', testament: 'OT', chaptersCount: 10, category: 'History' },
  { id: 'NEH', name: 'Nehemiah', testament: 'OT', chaptersCount: 13, category: 'History' },
  { id: 'EST', name: 'Esther', testament: 'OT', chaptersCount: 10, category: 'History' },
  { id: 'JOB', name: 'Job', testament: 'OT', chaptersCount: 42, category: 'Poetry' },
  { id: 'PSA', name: 'Psalms', testament: 'OT', chaptersCount: 150, category: 'Poetry' },
  { id: 'PRO', name: 'Proverbs', testament: 'OT', chaptersCount: 31, category: 'Poetry' },
  { id: 'ECC', name: 'Ecclesiastes', testament: 'OT', chaptersCount: 12, category: 'Poetry' },
  { id: 'SNG', name: 'Song of Solomon', testament: 'OT', chaptersCount: 8, category: 'Poetry' },
  { id: 'ISA', name: 'Isaiah', testament: 'OT', chaptersCount: 66, category: 'Prophets' },
  { id: 'JER', name: 'Jeremiah', testament: 'OT', chaptersCount: 52, category: 'Prophets' },
  { id: 'LAM', name: 'Lamentations', testament: 'OT', chaptersCount: 5, category: 'Prophets' },
  { id: 'EZK', name: 'Ezekiel', testament: 'OT', chaptersCount: 48, category: 'Prophets' },
  { id: 'DAN', name: 'Daniel', testament: 'OT', chaptersCount: 12, category: 'Prophets' },
  { id: 'HOS', name: 'Hosea', testament: 'OT', chaptersCount: 14, category: 'Prophets' },
  { id: 'JOL', name: 'Joel', testament: 'OT', chaptersCount: 3, category: 'Prophets' },
  { id: 'AMO', name: 'Amos', testament: 'OT', chaptersCount: 9, category: 'Prophets' },
  { id: 'OBA', name: 'Obadiah', testament: 'OT', chaptersCount: 1, category: 'Prophets' },
  { id: 'JON', name: 'Jonah', testament: 'OT', chaptersCount: 4, category: 'Prophets' },
  { id: 'MIC', name: 'Micah', testament: 'OT', chaptersCount: 7, category: 'Prophets' },
  { id: 'NAM', name: 'Nahum', testament: 'OT', chaptersCount: 3, category: 'Prophets' },
  { id: 'HAB', name: 'Habakkuk', testament: 'OT', chaptersCount: 3, category: 'Prophets' },
  { id: 'ZEP', name: 'Zephaniah', testament: 'OT', chaptersCount: 3, category: 'Prophets' },
  { id: 'HAG', name: 'Haggai', testament: 'OT', chaptersCount: 2, category: 'Prophets' },
  { id: 'ZEC', name: 'Zechariah', testament: 'OT', chaptersCount: 14, category: 'Prophets' },
  { id: 'MAL', name: 'Malachi', testament: 'OT', chaptersCount: 4, category: 'Prophets' },

  // NEW TESTAMENT
  { id: 'MAT', name: 'Matthew', testament: 'NT', chaptersCount: 28, category: 'Gospels' },
  { id: 'MRK', name: 'Mark', testament: 'NT', chaptersCount: 16, category: 'Gospels' },
  { id: 'LUK', name: 'Luke', testament: 'NT', chaptersCount: 24, category: 'Gospels' },
  { id: 'JHN', name: 'John', testament: 'NT', chaptersCount: 21, category: 'Gospels' },
  { id: 'ACT', name: 'Acts', testament: 'NT', chaptersCount: 28, category: 'History' },
  { id: 'ROM', name: 'Romans', testament: 'NT', chaptersCount: 16, category: 'Epistles' },
  { id: '1CO', name: '1 Corinthians', testament: 'NT', chaptersCount: 16, category: 'Epistles' },
  { id: '2CO', name: '2 Corinthians', testament: 'NT', chaptersCount: 13, category: 'Epistles' },
  { id: 'GAL', name: 'Galatians', testament: 'NT', chaptersCount: 6, category: 'Epistles' },
  { id: 'EPH', name: 'Ephesians', testament: 'NT', chaptersCount: 6, category: 'Epistles' },
  { id: 'PHP', name: 'Philippians', testament: 'NT', chaptersCount: 4, category: 'Epistles' },
  { id: 'COL', name: 'Colossians', testament: 'NT', chaptersCount: 4, category: 'Epistles' },
  { id: '1TH', name: '1 Thessalonians', testament: 'NT', chaptersCount: 5, category: 'Epistles' },
  { id: '2TH', name: '2 Thessalonians', testament: 'NT', chaptersCount: 3, category: 'Epistles' },
  { id: '1TI', name: '1 Timothy', testament: 'NT', chaptersCount: 6, category: 'Epistles' },
  { id: '2TI', name: '2 Timothy', testament: 'NT', chaptersCount: 4, category: 'Epistles' },
  { id: 'TIT', name: 'Titus', testament: 'NT', chaptersCount: 3, category: 'Epistles' },
  { id: 'PHM', name: 'Philemon', testament: 'NT', chaptersCount: 1, category: 'Epistles' },
  { id: 'HEB', name: 'Hebrews', testament: 'NT', chaptersCount: 13, category: 'Epistles' },
  { id: 'JAS', name: 'James', testament: 'NT', chaptersCount: 5, category: 'Epistles' },
  { id: '1PE', name: '1 Peter', testament: 'NT', chaptersCount: 5, category: 'Epistles' },
  { id: '2PE', name: '2 Peter', testament: 'NT', chaptersCount: 3, category: 'Epistles' },
  { id: '1JN', name: '1 John', testament: 'NT', chaptersCount: 5, category: 'Epistles' },
  { id: '2JN', name: '2 John', testament: 'NT', chaptersCount: 1, category: 'Epistles' },
  { id: '3JN', name: '3 John', testament: 'NT', chaptersCount: 1, category: 'Epistles' },
  { id: 'JUD', name: 'Jude', testament: 'NT', chaptersCount: 1, category: 'Epistles' },
  { id: 'REV', name: 'Revelation', testament: 'NT', chaptersCount: 22, category: 'Apocalypse' }
];
