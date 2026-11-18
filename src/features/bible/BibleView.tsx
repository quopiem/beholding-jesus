import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, Search, Bookmark, Highlighter, MessageSquare, 
  ChevronLeft, ChevronRight, Copy, Share2, Check, SlidersHorizontal,
  Columns, AlignLeft, Sparkles, BookMarked, PenSquare, Trash2, X,
  ExternalLink, Layers, Info, Headphones, Volume2, VolumeX, Play, Pause,
  Square, Maximize2, Minimize2, Type, CheckCircle2, Globe, Heart, Loader2,
  Lightbulb, Send, MoreHorizontal, CircleEllipsis
} from 'lucide-react';
import { BIBLE_BOOKS, BIBLE_TRANSLATIONS } from './bibleBooks';
import { CHAPTER_PARAGRAPHS } from './bibleContent';
import { BibleService } from './bibleService';
import { BjcAiService, BjcAiMessage } from '../../services/bjcAiService';
import { 
  BibleBook, BibleVerse, BibleTranslationCode, 
  BibleHighlight, BibleBookmark, BibleNote 
} from '../../types';

interface BibleViewProps {
  onNavigate?: (tab: string) => void;
  initialBookId?: string;
  initialChapter?: number;
  isActive?: boolean;
}

export const BibleView: React.FC<BibleViewProps> = ({ 
  onNavigate,
  initialBookId,
  initialChapter,
  isActive = true
}) => {
  // -------------------------------------------------------------
  // NAVIGATION & TRANSLATION STATE
  // -------------------------------------------------------------
  // Default to Joshua 10 in NLT (matching the exact reference layout) or initial props
  const [selectedBook, setSelectedBook] = useState<BibleBook>(() => {
    if (initialBookId) {
      const found = BIBLE_BOOKS.find(b => b.id.toUpperCase() === initialBookId.toUpperCase());
      if (found) return found;
    }
    return BIBLE_BOOKS.find(b => b.id === 'JOS') || BIBLE_BOOKS.find(b => b.id === 'JHN') || BIBLE_BOOKS[0];
  });
  const [currentChapter, setCurrentChapter] = useState<number>(() => {
    return initialChapter || 10;
  });
  const [selectedTranslation, setSelectedTranslation] = useState<BibleTranslationCode>('NLT');
  const [comparisonTranslation, setComparisonTranslation] = useState<BibleTranslationCode>('KJV');
  const [viewMode, setViewMode] = useState<'single' | 'parallel' | 'compare-verse'>('single');
  const [isTranslationPickerOpen, setIsTranslationPickerOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // -------------------------------------------------------------
  // EXPAND & IMMERSION READER STATE (Matches "make the bible viewable expand")
  // -------------------------------------------------------------
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [readerWidth, setReaderWidth] = useState<'comfortable' | 'expanded'>('comfortable');

  // -------------------------------------------------------------
  // READING THEME & DISPLAY SETTINGS (Matches "AA" menu)
  // -------------------------------------------------------------
  const [readingTheme, setReadingTheme] = useState<'dark' | 'midnight' | 'sepia' | 'light'>('dark');
  const [fontSizePx, setFontSizePx] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [redLetterEnabled, setRedLetterEnabled] = useState<boolean>(true);
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState<boolean>(false);
  const [isBookPickerOpen, setIsBookPickerOpen] = useState<boolean>(false);
  const [bookPickerTab, setBookPickerTab] = useState<'OT' | 'NT'>('OT');
  const [tempBook, setTempBook] = useState<BibleBook>(() => selectedBook);
  const [pickerMode, setPickerMode] = useState<'books' | 'chapters'>('books');

  // -------------------------------------------------------------
  // CONTENT & VERSES STATE
  // -------------------------------------------------------------
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [parallelVerses, setParallelVerses] = useState<BibleVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [activeTab, setActiveTab] = useState<'read' | 'notes' | 'bookmarks' | 'history'>('read');

  // -------------------------------------------------------------
  // VERSE SELECTION & ACTION POPOVER (Matches Image 2)
  // -------------------------------------------------------------
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [verseComparisonData, setVerseComparisonData] = useState<any[]>([]);
  const [activeFootnote, setActiveFootnote] = useState<{ verse: number; note: string } | null>(null);
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);

  // Annotations
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);
  const [bookmarks, setBookmarks] = useState<BibleBookmark[]>([]);
  const [notes, setNotes] = useState<BibleNote[]>([]);

  // Note creation modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTopic, setNoteTopic] = useState('');

  // -------------------------------------------------------------
  // BJC AI SCRIPTURE COMPANION & EXEGESIS STATE
  // -------------------------------------------------------------
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<'meaning' | 'context' | 'custom'>('meaning');
  const [aiCustomQuestion, setAiCustomQuestion] = useState<string>('');
  const [aiExegesisResult, setAiExegesisResult] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiInteractionId, setAiInteractionId] = useState<string | undefined>(undefined);
  const [aiFollowUpInput, setAiFollowUpInput] = useState<string>('');
  const [aiChatTurns, setAiChatTurns] = useState<{ id: string; role: 'user' | 'assistant'; text: string; timestamp: string }[]>([]);
  const [isAiNoteSaved, setIsAiNoteSaved] = useState<boolean>(false);
  const [aiActiveVerse, setAiActiveVerse] = useState<BibleVerse | null>(null);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // AUDIO BIBLE READER (Matches "🎧" Headphones Icon)
  // -------------------------------------------------------------
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [currentSpokenVerse, setCurrentSpokenVerse] = useState<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // -------------------------------------------------------------
  // INITIAL LOAD & SYNC
  // -------------------------------------------------------------
  useEffect(() => {
    setHighlights(BibleService.getHighlights());
    setBookmarks(BibleService.getBookmarks());
    setNotes(BibleService.getNotes());
  }, []);

  // Respond to incoming initial book or chapter changes (e.g. from Stories navigation)
  useEffect(() => {
    if (initialBookId) {
      const found = BIBLE_BOOKS.find(b => b.id.toUpperCase() === initialBookId.toUpperCase());
      if (found) {
        setSelectedBook(found);
        if (initialChapter) {
          setCurrentChapter(Math.min(Math.max(1, initialChapter), found.chaptersCount));
        }
      }
    }
  }, [initialBookId, initialChapter]);

  // Book index and boundary checks for seamless navigation
  const currBookIdx = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
  const isAtFirstChapter = currBookIdx <= 0 && currentChapter <= 1;
  const isAtLastChapter = currBookIdx >= BIBLE_BOOKS.length - 1 && currentChapter >= selectedBook.chaptersCount;

  // Update chapter verses with instant cache + async real scripture fetch
  useEffect(() => {
    let isMounted = true;
    setIsLoadingVerses(true);

    // 1. Immediately display instant/cached verses so UI never goes blank
    const instant = BibleService.getChapterVerses(selectedBook.id, currentChapter, selectedTranslation);
    setVerses(instant);

    // 2. Asynchronously fetch full authentic Scripture (cached in memory and localStorage)
    BibleService.fetchChapterVerses(selectedBook.id, currentChapter, selectedTranslation)
      .then((fullVerses) => {
        if (isMounted) {
          setVerses(fullVerses);
          setIsLoadingVerses(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingVerses(false);
      });

    if (viewMode === 'parallel') {
      BibleService.fetchChapterVerses(selectedBook.id, currentChapter, comparisonTranslation)
        .then((pv) => {
          if (isMounted) setParallelVerses(pv);
        });
    }

    BibleService.recordReading(selectedBook.name, currentChapter);
    setSelectedVerse(null);
    stopAudio();

    return () => {
      isMounted = false;
    };
  }, [selectedBook, currentChapter, selectedTranslation, comparisonTranslation, viewMode]);

  // Dispatch active Bible reading context for BJC AI and system assistants
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bjc_bible_context', {
        detail: {
          bookName: selectedBook?.name || 'Genesis',
          bookId: selectedBook?.id || 'GEN',
          chapter: currentChapter,
          verse: selectedVerse?.verseNumber,
          verseText: selectedVerse?.text
        }
      }));
    }
  }, [selectedBook, currentChapter, selectedVerse]);

  // Handle Search Input or Reference Jump
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const res = BibleService.searchVerses(searchQuery, selectedTranslation);
      setSearchResults(res);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedTranslation]);

  // Keyboard shortcut listener (Esc to close modals / exit expand, arrows to navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedVerse) setSelectedVerse(null);
        else if (isDisplayMenuOpen) setIsDisplayMenuOpen(false);
        else if (isBookPickerOpen) setIsBookPickerOpen(false);
        else if (isExpanded) setIsExpanded(false);
      } else if (e.key === 'ArrowLeft' && !selectedVerse && !isDisplayMenuOpen && !isBookPickerOpen) {
        handlePrevChapter();
      } else if (e.key === 'ArrowRight' && !selectedVerse && !isDisplayMenuOpen && !isBookPickerOpen) {
        handleNextChapter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVerse, isDisplayMenuOpen, isBookPickerOpen, isExpanded, currentChapter, selectedBook]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop audio and close any active popovers/modals when navigating away from the Bible tab
  useEffect(() => {
    if (!isActive) {
      stopAudio();
      setSelectedVerse(null);
      setIsDisplayMenuOpen(false);
      setIsBookPickerOpen(false);
      setIsTranslationPickerOpen(false);
      setIsSearchOpen(false);
      setIsAiModalOpen(false);
      setIsNoteModalOpen(false);
    }
  }, [isActive]);

  // -------------------------------------------------------------
  // NAVIGATION HANDLERS (Seamless across chapters & books with auto-scroll)
  // -------------------------------------------------------------
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    } else {
      const currIdx = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
      if (currIdx > 0) {
        const prevBook = BIBLE_BOOKS[currIdx - 1];
        setSelectedBook(prevBook);
        setCurrentChapter(prevBook.chaptersCount);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextChapter = () => {
    if (currentChapter < selectedBook.chaptersCount) {
      setCurrentChapter(prev => prev + 1);
    } else {
      const currIdx = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
      if (currIdx < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currIdx + 1];
        setSelectedBook(nextBook);
        setCurrentChapter(1);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Jump to reference from search bar
  const handleReferenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if query matches book name + chapter (e.g., "John 3", "Col 1", "Psalm 23")
    const match = searchQuery.trim().match(/^([1-3]?\s*[A-Za-z]+)\s*(\d+)?(?::(\d+))?$/);
    if (match) {
      const bookQuery = match[1].toLowerCase().replace(/\s+/g, '');
      const chap = match[2] ? parseInt(match[2], 10) : 1;
      const foundBook = BIBLE_BOOKS.find(b => 
        b.name.toLowerCase().replace(/\s+/g, '').startsWith(bookQuery) ||
        b.id.toLowerCase() === bookQuery
      );

      if (foundBook) {
        setSelectedBook(foundBook);
        setCurrentChapter(Math.min(chap, foundBook.chaptersCount));
        setSearchQuery('');
        return;
      }
    }
  };

  // -------------------------------------------------------------
  // AUDIO READER CONTROLS (SpeechSynthesis)
  // -------------------------------------------------------------
  const startAudio = () => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    // Read full chapter verses sequentially
    const fullText = verses.map(v => `${v.verse}. ${v.text}`).join(' ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = audioSpeed;

    utterance.onstart = () => {
      setIsAudioPlaying(true);
      setCurrentSpokenVerse(1);
    };

    utterance.onboundary = (event) => {
      // Approximate spoken verse by word count or character index
      if (event.charIndex !== undefined) {
        let runningLength = 0;
        for (const v of verses) {
          runningLength += `${v.verse}. ${v.text} `.length;
          if (event.charIndex <= runningLength) {
            setCurrentSpokenVerse(v.verse);
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setIsAudioPlaying(false);
      setCurrentSpokenVerse(null);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseAudio = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsAudioPlaying(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsAudioPlaying(true);
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      setCurrentSpokenVerse(null);
    }
  };

  const toggleAudio = () => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsAudioPlaying(true);
      } else {
        startAudio();
      }
    }
  };

  // -------------------------------------------------------------
  // VERSE INTERACTION & ACTIONS
  // -------------------------------------------------------------
  const handleSelectVerse = (verse: BibleVerse) => {
    if (selectedVerse?.verse === verse.verse) {
      setSelectedVerse(null);
      setSelectedWord('');
    } else {
      const sel = typeof window !== 'undefined' ? window.getSelection()?.toString().trim() : '';
      if (sel && sel.length > 0 && sel.length < 80) {
        setSelectedWord(sel);
      } else {
        setSelectedWord('');
      }
      setSelectedVerse(verse);
      const comparison = BibleService.getVerseComparison(selectedBook.id, currentChapter, verse.verse);
      setVerseComparisonData(comparison);

      // Smoothly ensure the selected verse stays comfortable in view when bottom sheet opens
      setTimeout(() => {
        const el = document.getElementById(`verse-${verse.verse}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom > window.innerHeight * 0.42) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 50);
    }
  };

  // -------------------------------------------------------------
  // BJC AI SCRIPTURE EXEGESIS HANDLERS
  // -------------------------------------------------------------
  const handleOpenAiExegesis = async (mode: 'meaning' | 'context' | 'custom', customQuery?: string) => {
    if (!selectedVerse) return;
    const targetVerse = selectedVerse;
    const wordFocus = selectedWord.trim();

    setAiActiveVerse(targetVerse);
    setSelectedVerse(null); // Close the verse action popover
    setIsAiModalOpen(true);
    setAiTopic(mode);
    setIsAiLoading(true);
    setAiExegesisResult('');
    setAiChatTurns([]);
    setIsAiNoteSaved(false);

    let prompt = '';
    if (mode === 'meaning') {
      prompt = `You are BJC AI for Beholding Jesus Church. Please provide a biblical, Christ-exalting, and practical life explanation of this Scripture for a Christian disciple today:

Verse: ${targetVerse.book} ${targetVerse.chapter}:${targetVerse.verse} (${targetVerse.translation})
Scripture: "${targetVerse.text}"
${wordFocus ? `Key Word / Phrase Focus: "${wordFocus}" - Please detail its spiritual and theological significance in this verse.` : ''}

Please structure your response with clear headings:
### 1. Core Meaning & Spiritual Truth
### 2. Christ-Centered Theological Insight
### 3. Practical Daily Life Application
### 4. Heartfelt Discipleship Prayer`;
    } else if (mode === 'context') {
      prompt = `You are BJC AI for Beholding Jesus Church. Please provide the deep historical, cultural, and original language exegesis of this Scripture:

Verse: ${targetVerse.book} ${targetVerse.chapter}:${targetVerse.verse} (${targetVerse.translation})
Scripture: "${targetVerse.text}"
${wordFocus ? `Key Word / Phrase to Analyze: "${wordFocus}" - Detail its original Hebrew or Greek root, nuanced meaning, and grammatical context.` : ''}

Please structure your response with clear headings:
### 1. Historical & Authorial Context (Author, recipients, setting)
### 2. Literary & Theological Setting in ${targetVerse.book}
### 3. Original Language & Nuances (Greek/Hebrew root insight)
### 4. Connection to Jesus Christ & the Gospel`;
    } else {
      prompt = `Regarding ${targetVerse.book} ${targetVerse.chapter}:${targetVerse.verse} (${targetVerse.translation}): "${targetVerse.text}"
${wordFocus ? `Focusing on: "${wordFocus}"` : ''}

Question from worshipper: ${customQuery || 'Please explain the spiritual depth of this verse.'}

Please answer pastorally and expositorily, grounded in Scripture.`;
    }

    try {
      const response = await BjcAiService.sendMessage(prompt);
      setAiExegesisResult(response.text);
      setAiInteractionId(response.interactionId);
      setAiChatTurns([
        {
          id: `ai-turn-${Date.now()}`,
          role: 'assistant',
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('BJC AI Exegesis error:', err);
      setAiExegesisResult('Grace and peace! I experienced a temporary network connection issue reaching the AI service. Please try asking again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendAiFollowUp = async () => {
    const q = aiFollowUpInput.trim();
    if (!q || isAiLoading || !aiActiveVerse) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userTurn = {
      id: `turn-u-${Date.now()}`,
      role: 'user' as const,
      text: q,
      timestamp: timeStr
    };

    setAiChatTurns(prev => [...prev, userTurn]);
    setAiFollowUpInput('');
    setIsAiLoading(true);

    try {
      const response = await BjcAiService.sendMessage(q, aiInteractionId);
      const assistantTurn = {
        id: `turn-a-${Date.now()}`,
        role: 'assistant' as const,
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatTurns(prev => [...prev, assistantTurn]);
      if (response.interactionId) {
        setAiInteractionId(response.interactionId);
      }
    } catch (err) {
      const errTurn = {
        id: `turn-e-${Date.now()}`,
        role: 'assistant' as const,
        text: 'Grace and peace! I experienced a temporary network issue. Please ask your question again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiChatTurns(prev => [...prev, errTurn]);
    } finally {
      setIsAiLoading(false);
      setTimeout(() => aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleSaveAiExegesisAsNote = () => {
    if (!aiActiveVerse || !aiExegesisResult) return;
    const updated = BibleService.saveNote({
      userId: 'current-user',
      book: aiActiveVerse.book,
      chapter: aiActiveVerse.chapter,
      verse: aiActiveVerse.verse,
      verseText: aiActiveVerse.text,
      title: `BJC AI Exegesis: ${aiActiveVerse.book} ${aiActiveVerse.chapter}:${aiActiveVerse.verse}`,
      content: aiExegesisResult,
      isPrivate: true
    });
    setNotes(updated);
    setIsAiNoteSaved(true);
    setCopySuccessToast(`Saved BJC AI exegesis to Study Notes!`);
    setTimeout(() => {
      setIsAiNoteSaved(false);
      setCopySuccessToast(null);
    }, 3000);
  };

  const handleContinueInFullAi = () => {
    if (aiActiveVerse && aiExegesisResult) {
      const existing = BjcAiService.getHistory();
      const newMsgs: BjcAiMessage[] = [
        {
          id: `msg-${Date.now()}-q`,
          sender: 'user',
          content: `Explain ${aiActiveVerse.book} ${aiActiveVerse.chapter}:${aiActiveVerse.verse} (${aiTopic === 'context' ? 'Deeper Context' : 'Meaning'})`,
          timestamp: 'Just now'
        },
        {
          id: `msg-${Date.now()}-a`,
          sender: 'assistant',
          content: aiExegesisResult,
          timestamp: 'Just now',
          interactionId: aiInteractionId
        }
      ];
      BjcAiService.saveHistory([...existing, ...newMsgs]);
    }
    setIsAiModalOpen(false);
    if (onNavigate) {
      onNavigate('bjc-ai');
    }
  };

  const formatMarkdown = (content: string) => {
    return content.split('\n\n').map((paragraph, pIdx) => {
      if (paragraph.startsWith('> ')) {
        const quoteText = paragraph.replace(/^>\s*/gm, '');
        return (
          <blockquote 
            key={pIdx} 
            className="my-2.5 pl-3 border-l-2 border-[#C5A46D] italic text-neutral-200 bg-neutral-800/40 p-2.5 rounded-r-xl text-xs sm:text-sm"
          >
            {quoteText}
          </blockquote>
        );
      }

      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={pIdx} className="font-serif font-bold text-sm sm:text-base text-gold mt-3 mb-1">
            {paragraph.replace('### ', '')}
          </h4>
        );
      }

      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n').filter(Boolean);
        return (
          <ul key={pIdx} className="my-1.5 space-y-1 pl-4 list-disc marker:text-[#C5A46D] text-xs sm:text-sm">
            {items.map((it, iIdx) => (
              <li key={iIdx} className="leading-relaxed">
                {renderInlineMarkdown(it.replace(/^[-*]\s*/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="leading-relaxed text-xs sm:text-sm my-1.5">
          {renderInlineMarkdown(paragraph)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic text-neutral-300">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-neutral-800 text-gold font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Color Palette from Image 2
  const HIGHLIGHT_PALETTE: { color: BibleHighlight['color']; label: string; bg: string; border: string; circle: string }[] = [
    { color: 'yellow', label: 'Yellow', bg: 'bg-yellow-400/20 text-yellow-200', border: 'border-yellow-400', circle: '#eab308' },
    { color: 'green', label: 'Green', bg: 'bg-emerald-400/20 text-emerald-200', border: 'border-emerald-400', circle: '#22c55e' },
    { color: 'cyan', label: 'Cyan', bg: 'bg-cyan-400/20 text-cyan-200', border: 'border-cyan-400', circle: '#06b6d4' },
    { color: 'peach', label: 'Peach', bg: 'bg-orange-400/20 text-orange-200', border: 'border-orange-400', circle: '#fb923c' },
    { color: 'pink', label: 'Pink', bg: 'bg-fuchsia-400/20 text-fuchsia-200', border: 'border-fuchsia-400', circle: '#c084fc' }
  ];

  const handleApplyHighlight = (color: BibleHighlight['color']) => {
    if (!selectedVerse) return;
    const updated = BibleService.toggleHighlight(selectedBook.name, currentChapter, selectedVerse.verse, color);
    setHighlights(updated);
  };

  const handleCopySelectedVerse = () => {
    if (!selectedVerse) return;
    const textToCopy = `“${selectedVerse.text}” — ${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse} (${selectedVerse.translation})`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccessToast(`Copied ${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse} (${selectedVerse.translation})`);
    setTimeout(() => setCopySuccessToast(null), 2500);
  };

  const handleShareSelectedVerse = () => {
    if (!selectedVerse) return;
    const shareText = `“${selectedVerse.text}”\n— ${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse} (${selectedVerse.translation})\n\nBeholding Jesus Church Community Platform`;
    if (navigator.share) {
      navigator.share({
        title: `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`,
        text: shareText
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopySuccessToast('Verse quote formatted and copied to clipboard!');
      setTimeout(() => setCopySuccessToast(null), 2500);
    }
  };

  const handleSaveNote = () => {
    if (!selectedVerse || !noteTitle.trim()) return;
    BibleService.saveNote({
      userId: 'current-user',
      book: selectedBook.name,
      chapter: currentChapter,
      verse: selectedVerse.verse,
      verseText: selectedVerse.text,
      title: noteTitle,
      content: noteContent,
      topic: noteTopic || 'General Study',
      isPrivate: true
    });
    setNotes(BibleService.getNotes());
    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteContent('');
    setNoteTopic('');
  };

  // Get active highlight for a verse
  const getVerseHighlight = (vNum: number) => {
    return highlights.find(h => h.book === selectedBook.name && h.chapter === currentChapter && h.verse === vNum);
  };

  // Theme Styling Classes
  const themeStyles = {
    dark: 'bg-[#121212] text-[#EDEDED]',
    midnight: 'bg-[#0b1329] text-[#e2e8f0]',
    sepia: 'bg-[#fbf0d9] text-[#433422]',
    light: 'bg-[#ffffff] text-[#1e293b]'
  };

  const themeTopBar = {
    dark: 'bg-[#121212] border-transparent text-white',
    midnight: 'bg-[#111c38]/95 border-slate-800 text-white',
    sepia: 'bg-[#f4e6cb]/95 border-[#e6d3af] text-[#433422]',
    light: 'bg-white/95 border-slate-200 text-slate-800'
  };

  // Partition verses into authentic paragraphs based on CHAPTER_PARAGRAPHS or sectionTitles
  const chapterKey = `${selectedBook.id.toUpperCase()}:${currentChapter}`;
  const paragraphBreaks = CHAPTER_PARAGRAPHS[chapterKey] || [];

  const paragraphGroups = useMemo(() => {
    if (verses.length === 0) return [];
    const groups: BibleVerse[][] = [];

    if (paragraphBreaks.length > 0) {
      let currentGroup: BibleVerse[] = [];
      for (const v of verses) {
        if (paragraphBreaks.includes(v.verse) && currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [v];
        } else {
          currentGroup.push(v);
        }
      }
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
    } else {
      let currentGroup: BibleVerse[] = [];
      for (const v of verses) {
        if (v.sectionTitle && currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [v];
        } else if (currentGroup.length >= 4 && !v.sectionTitle) {
          groups.push(currentGroup);
          currentGroup = [v];
        } else {
          currentGroup.push(v);
        }
      }
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
    }

    return groups;
  }, [verses, chapterKey, paragraphBreaks]);

  return (
    <div className={`w-full min-h-screen select-text transition-colors duration-200 ${
      isExpanded 
        ? 'fixed inset-0 z-50 overflow-y-auto ' + themeStyles[readingTheme]
        : 'w-full ' + themeStyles[readingTheme]
    }`}>

      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR (Exact Match to YouVersion Reference Image)  */}
      {/* ============================================================== */}
      <header className={`sticky top-0 z-30 w-full backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between ${themeTopBar[readingTheme]}`}>
        
        {/* Left: Two Separate Capsule Pills [ Joshua 10 ] [ NLT ] */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTempBook(selectedBook);
              setBookPickerTab(selectedBook.testament);
              setPickerMode('books');
              setIsBookPickerOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#242426] hover:bg-[#2e2e32] active:bg-[#35353a] text-white text-[14px] font-semibold tracking-tight transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center border border-white/5"
            title="Choose Scripture Book & Chapter"
          >
            <span>{selectedBook.name} {currentChapter}</span>
          </button>

          <button
            onClick={() => setIsTranslationPickerOpen(true)}
            className="px-3 py-1.5 rounded-full bg-[#242426] hover:bg-[#2e2e32] active:bg-[#35353a] text-white text-[14px] font-semibold tracking-tight transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center border border-white/5"
            title="Choose Bible Translation"
          >
            <span>{selectedTranslation}</span>
          </button>
        </div>

        {/* Right: Audio Speaker, Search, Circle More (...) */}
        <div className="flex items-center gap-3.5 sm:gap-4 text-white">
          {/* Audio Speaker */}
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-full hover:bg-white/10 transition active:scale-95 cursor-pointer relative ${
              isAudioPlaying ? 'text-gold' : 'text-white hover:text-neutral-200'
            }`}
            title={isAudioPlaying ? 'Pause Audio Reading' : 'Listen to Scripture Audio'}
            aria-label="Audio Bible"
          >
            <Volume2 className="w-[21px] h-[21px] stroke-[2]" />
            {isAudioPlaying && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white hover:text-neutral-200 transition active:scale-95 cursor-pointer"
            title="Search Bible"
            aria-label="Search Bible"
          >
            <Search className="w-[21px] h-[21px] stroke-[2]" />
          </button>

          {/* More Options (...) with Display Menu Popover */}
          <div className="relative">
            <button
              onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)}
              className="p-1 rounded-full hover:bg-white/10 text-white hover:text-neutral-200 transition active:scale-95 cursor-pointer"
              title="Reading Settings & Display (Font, Size, Theme)"
              aria-label="Display Settings"
            >
              <CircleEllipsis className="w-[22px] h-[22px] stroke-[1.8]" />
            </button>

            {/* Display Menu Popover */}
            {isDisplayMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-elevated z-50 text-white space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  <span>Reading Settings</span>
                  <button onClick={() => setIsDisplayMenuOpen(false)} className="text-neutral-500 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Font Size Selector */}
                <div className="space-y-1.5">
                  <div className="text-xs text-neutral-400 flex items-center justify-between">
                    <span>Font Size</span>
                    <span className="font-mono text-neutral-300">{fontSizePx}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFontSizePx(Math.max(14, fontSizePx - 2))}
                      className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold cursor-pointer"
                    >
                      A-
                    </button>
                    <input
                      type="range"
                      min="14"
                      max="28"
                      value={fontSizePx}
                      onChange={(e) => setFontSizePx(Number(e.target.value))}
                      className="flex-1 accent-gold cursor-pointer"
                    />
                    <button
                      onClick={() => setFontSizePx(Math.min(28, fontSizePx + 2))}
                      className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold cursor-pointer"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Font Family (Serif vs Sans) */}
                <div className="space-y-1.5">
                  <div className="text-xs text-neutral-400">Typography</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFontFamily('serif')}
                      className={`p-2 rounded-xl text-xs font-serif font-bold border transition cursor-pointer ${
                        fontFamily === 'serif' 
                          ? 'border-gold bg-gold/15 text-gold-200' 
                          : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      Biblical Serif
                    </button>
                    <button
                      onClick={() => setFontFamily('sans')}
                      className={`p-2 rounded-xl text-xs font-sans font-bold border transition cursor-pointer ${
                        fontFamily === 'sans' 
                          ? 'border-gold bg-gold/15 text-gold-200' 
                          : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      Modern Sans
                    </button>
                  </div>
                </div>

                {/* Words of Christ in Red Toggle */}
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                      <span>Words of Jesus in Red</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">Red-letter gospel edition</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={redLetterEnabled}
                    onChange={(e) => setRedLetterEnabled(e.target.checked)}
                    className="accent-red-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Theme Selector */}
                <div className="space-y-1.5">
                  <div className="text-xs text-neutral-400">Reading Palette</div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setReadingTheme('dark')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        readingTheme === 'dark' ? 'border-gold ring-1 ring-gold' : 'border-neutral-800'
                      }`}
                      style={{ backgroundColor: '#121212' }}
                    >
                      <span className="text-[10px] text-neutral-200 font-bold">Dark</span>
                    </button>
                    <button
                      onClick={() => setReadingTheme('midnight')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        readingTheme === 'midnight' ? 'border-gold ring-1 ring-gold' : 'border-neutral-800'
                      }`}
                      style={{ backgroundColor: '#0b1329' }}
                    >
                      <span className="text-[10px] text-slate-200 font-bold">Navy</span>
                    </button>
                    <button
                      onClick={() => setReadingTheme('sepia')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        readingTheme === 'sepia' ? 'border-amber-600 ring-1 ring-amber-600' : 'border-neutral-800'
                      }`}
                      style={{ backgroundColor: '#fbf0d9' }}
                    >
                      <span className="text-[10px] text-[#433422] font-bold">Sepia</span>
                    </button>
                    <button
                      onClick={() => setReadingTheme('light')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                        readingTheme === 'light' ? 'border-gold ring-1 ring-gold' : 'border-neutral-800'
                      }`}
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <span className="text-[10px] text-slate-900 font-bold">White</span>
                    </button>
                  </div>
                </div>

                {/* Parallel View Mode Toggle */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Parallel View</span>
                  <button
                    onClick={() => setViewMode(viewMode === 'single' ? 'parallel' : 'single')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                      viewMode === 'parallel' ? 'bg-gold text-slate-950 font-bold' : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {viewMode === 'parallel' ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Quick Access to Stories */}
                {onNavigate && (
                  <div className="pt-2 border-t border-neutral-800">
                    <button
                      onClick={() => { setIsDisplayMenuOpen(false); onNavigate('stories'); }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition cursor-pointer"
                    >
                      <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                      <span>Explore Bible Stories</span>
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN READING CANVAS (Clean, Full Screen, Paragraph Flow)   */}
      {/* ============================================================== */}
      <div className="w-full px-4 sm:px-6 pt-3 sm:pt-5 pb-44 select-text">
        <div className="max-w-[620px] mx-auto">
          {viewMode === 'single' ? (
            verses.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#C5A46D]/15 border border-[#C5A46D]/30 flex items-center justify-center text-[#C5A46D]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#C5A46D]" />
                </div>
                <div className="space-y-1">
                  <div className="font-serif font-bold text-lg text-white">Opening Scripture...</div>
                  <div className="text-xs text-neutral-400">Loading {selectedBook.name} {currentChapter} ({selectedTranslation})</div>
                </div>
              </div>
            ) : (
              <div 
                key={`${selectedBook.id}-${currentChapter}-${selectedTranslation}`}
                className="animate-in fade-in duration-200"
              >
                {paragraphGroups.map((group, groupIdx) => {
                  const firstVerseWithSection = group.find(v => !!v.sectionTitle);
                  return (
                    <div key={`para-${groupIdx}`} className="mb-6">
                      {/* Section Title Heading (e.g. "Israel Defeats the Southern Armies") */}
                      {firstVerseWithSection?.sectionTitle && (
                        <h2 
                          className="font-bold text-[21px] sm:text-[23px] text-white tracking-tight leading-snug mb-3.5 pt-3"
                          style={{ fontFamily: "-apple-system-ui-serif, Charter, 'Sitka Text', Cambria, Georgia, serif" }}
                        >
                          {firstVerseWithSection.sectionTitle}
                        </h2>
                      )}

                      {/* Paragraph Text with Inline Flow & Superscript Verse Numbers */}
                      <p 
                        className="leading-[1.78] text-[18px] text-[#EDEDED] font-serif"
                        style={{ 
                          fontSize: `${fontSizePx}px`,
                          fontFamily: fontFamily === 'serif' ? "-apple-system-ui-serif, Charter, 'Sitka Text', Cambria, Georgia, serif" : 'inherit'
                        }}
                      >
                        {group.map((v) => {
                          const hl = getVerseHighlight(v.verse);
                          const isSelected = selectedVerse?.verse === v.verse;
                          const isSpoken = currentSpokenVerse === v.verse;
                          const isRed = redLetterEnabled && (v.isJesusWords || false);

                          return (
                            <span
                              key={`${selectedBook.id}-${currentChapter}-${v.verse}`}
                              id={`verse-${v.verse}`}
                              onClick={() => handleSelectVerse(v)}
                              className={`inline cursor-pointer rounded transition-colors relative ${
                                isSelected 
                                  ? 'border-b-2 border-dotted border-white/80 bg-white/10 pb-0.5' 
                                  : 'hover:bg-white/5'
                              } ${hl ? `${hl.color === 'yellow' ? 'bg-yellow-400/25 text-yellow-100' : hl.color === 'green' ? 'bg-emerald-400/25 text-emerald-100' : hl.color === 'cyan' ? 'bg-cyan-400/25 text-cyan-100' : hl.color === 'peach' ? 'bg-orange-400/25 text-orange-100' : 'bg-fuchsia-400/25 text-fuchsia-100'} px-1 py-0.5 rounded` : ''} ${
                                isSpoken ? 'bg-gold/30 text-gold-200' : ''
                              }`}
                            >
                              {/* Space before next verse in paragraph */}
                              {v.verse > 1 && ' '}

                              {/* Superscript Verse Number */}
                              <sup className="text-[0.64em] font-sans font-bold text-neutral-400 select-none mr-1 -top-1 inline-block">
                                {v.verse}
                              </sup>

                              {/* Verse Text: Red Letter Rendering when Jesus speaks */}
                              <span className={isRed ? 'text-red-400 font-medium' : ''}>
                                {v.text}
                              </span>

                              {/* Footnote Comment Bubble Icon (💬) */}
                              {v.hasNote && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveFootnote(activeFootnote?.verse === v.verse ? null : { verse: v.verse, note: v.footnote || '' });
                                  }}
                                  className="inline-flex items-center text-neutral-400 hover:text-white mx-1 align-baseline transition cursor-pointer"
                                  title="Footnote / Study Note"
                                  aria-label="View Footnote"
                                >
                                  <svg className="w-[13.5px] h-[13.5px] inline text-neutral-400 hover:text-white -mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                  </svg>
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Parallel 2-Column Comparison View */
            <div 
              key={`parallel-${selectedBook.id}-${currentChapter}-${selectedTranslation}-${comparisonTranslation}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 font-serif text-sm animate-in fade-in duration-200"
            >
              <div className="space-y-4 border-r border-neutral-800 pr-4">
                <div className="sticky top-20 bg-neutral-900/80 px-3 py-1 rounded-lg text-xs font-bold text-gold inline-block">
                  {selectedTranslation}
                </div>
                {verses.map(v => (
                  <div 
                    key={`p1-${v.verse}`} 
                    onClick={() => handleSelectVerse(v)}
                    className="space-y-1 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition"
                    title="Click to ask BJC AI about this verse"
                  >
                    <span className="text-xs text-neutral-500 font-bold mr-1">{v.verse}</span>
                    <span>{v.text}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pl-2">
                <div className="sticky top-20 bg-neutral-900/80 px-3 py-1 rounded-lg text-xs font-bold text-neutral-300 inline-block">
                  {comparisonTranslation}
                </div>
                {parallelVerses.map(pv => (
                  <div 
                    key={`p2-${pv.verse}`} 
                    onClick={() => handleSelectVerse(pv)}
                    className="space-y-1 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition"
                    title="Click to ask BJC AI about this verse"
                  >
                    <span className="text-xs text-neutral-500 font-bold mr-1">{pv.verse}</span>
                    <span>{pv.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FLOATING BOTTOM CONTROLS (Exact YouVersion Control Cluster) */}
      {/* ============================================================== */}
      {isActive && typeof document !== 'undefined' && createPortal(
        <div className="fixed bottom-[66px] sm:bottom-[74px] md:bottom-8 left-0 right-0 z-40 pointer-events-none flex items-center justify-center gap-3.5 px-4 select-none">
          {/* Prev Chapter */}
          <button
            onClick={handlePrevChapter}
            disabled={isAtFirstChapter}
            className="pointer-events-auto w-10 h-10 rounded-full bg-[#2A2B2E] hover:bg-[#343538] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed text-white shadow-xl flex items-center justify-center transition cursor-pointer shrink-0 border border-white/5"
            title="Previous Chapter"
            aria-label="Previous Chapter"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Play / Pause Audio */}
          <button
            onClick={toggleAudio}
            className="pointer-events-auto w-[58px] h-[58px] rounded-full bg-[#38383B] hover:bg-[#444448] active:scale-95 text-white shadow-2xl flex items-center justify-center transition cursor-pointer shrink-0 border border-white/10"
            title={isAudioPlaying ? 'Pause Audio' : 'Play Audio'}
            aria-label={isAudioPlaying ? 'Pause Audio' : 'Play Audio'}
          >
            {isAudioPlaying ? (
              <Pause className="w-6 h-6 fill-white text-white" />
            ) : (
              <Play className="w-6 h-6 fill-white text-white ml-0.5" />
            )}
          </button>

          {/* Next Chapter */}
          <button
            onClick={handleNextChapter}
            disabled={isAtLastChapter}
            className="pointer-events-auto w-10 h-10 rounded-full bg-[#2A2B2E] hover:bg-[#343538] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed text-white shadow-xl flex items-center justify-center transition cursor-pointer shrink-0 border border-white/5"
            title="Next Chapter"
            aria-label="Next Chapter"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* BOOK & CHAPTER SELECTOR MODAL (YouVersion Style)               */}
      {/* ============================================================== */}
      {isActive && isBookPickerOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsBookPickerOpen(false);
          }}
        >
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[88vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  {pickerMode === 'chapters' ? `${tempBook.name} — Select Chapter` : 'Select Scripture Book'}
                </h3>
              </div>
              <button 
                onClick={() => setIsBookPickerOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Toggle: Books vs Chapters */}
            <div className="flex gap-2 p-1 bg-neutral-950/80 rounded-2xl border border-neutral-800 shrink-0">
              <button
                onClick={() => setPickerMode('books')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  pickerMode === 'books' ? 'bg-gold text-slate-950 shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                1. Book ({tempBook.name})
              </button>
              <button
                onClick={() => setPickerMode('chapters')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  pickerMode === 'chapters' ? 'bg-gold text-slate-950 shadow-xs' : 'text-neutral-400 hover:text-white'
                }`}
              >
                2. Chapter ({currentChapter})
              </button>
            </div>

            {pickerMode === 'books' ? (
              <>
                {/* Testament Tabs */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setBookPickerTab('OT')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      bookPickerTab === 'OT' ? 'bg-white/15 text-white border border-white/20' : 'bg-neutral-800/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Old Testament (39)
                  </button>
                  <button
                    onClick={() => setBookPickerTab('NT')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      bookPickerTab === 'NT' ? 'bg-white/15 text-white border border-white/20' : 'bg-neutral-800/60 text-neutral-400 hover:text-white'
                    }`}
                  >
                    New Testament (27)
                  </button>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto flex-1 pr-1 max-h-[50vh]">
                  {BIBLE_BOOKS.filter(b => b.testament === bookPickerTab).map(book => {
                    const isCurrent = tempBook.id === book.id;
                    return (
                      <button
                        key={book.id}
                        onClick={() => {
                          setTempBook(book);
                          if (book.chaptersCount === 1) {
                            setSelectedBook(book);
                            setCurrentChapter(1);
                            setIsBookPickerOpen(false);
                          } else {
                            setPickerMode('chapters');
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer active:scale-95 ${
                          isCurrent 
                            ? 'border-gold bg-gold/20 text-gold-200 font-bold' 
                            : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/40 text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold truncate">{book.name}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{book.chaptersCount} {book.chaptersCount === 1 ? 'chapter' : 'chapters'}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Chapters Grid */
              <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between text-xs text-neutral-400 shrink-0">
                  <span>Select a chapter in <strong className="text-white">{tempBook.name}</strong>:</span>
                  <button
                    onClick={() => setPickerMode('books')}
                    className="text-gold hover:underline font-semibold cursor-pointer"
                  >
                    Change Book
                  </button>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 overflow-y-auto flex-1 pr-1 max-h-[50vh]">
                  {Array.from({ length: tempBook.chaptersCount }, (_, i) => i + 1).map(num => {
                    const isCurrent = selectedBook.id === tempBook.id && currentChapter === num;
                    return (
                      <button
                        key={num}
                        onClick={() => {
                          setSelectedBook(tempBook);
                          setCurrentChapter(num);
                          setIsBookPickerOpen(false);
                          setPickerMode('books');
                        }}
                        className={`h-11 rounded-xl text-sm font-bold transition flex items-center justify-center cursor-pointer active:scale-95 ${
                          isCurrent
                            ? 'bg-gold text-slate-950 font-bold shadow-gold ring-2 ring-gold/40'
                            : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/60'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* TRANSLATION PICKER MODAL                                      */}
      {/* ============================================================== */}
      {isActive && isTranslationPickerOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTranslationPickerOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl text-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Select Bible Translation</h3>
              <button 
                onClick={() => setIsTranslationPickerOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {BIBLE_TRANSLATIONS.map(tr => {
                const isSelected = selectedTranslation === tr.code;
                return (
                  <button
                    key={tr.code}
                    onClick={() => {
                      setSelectedTranslation(tr.code);
                      setIsTranslationPickerOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-gold bg-gold/15 text-white font-bold' 
                        : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/40 text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{tr.code}</span>
                        {isSelected && <Check className="w-4 h-4 text-gold" />}
                      </div>
                      <div className="text-xs text-neutral-400 font-normal mt-0.5">{tr.name}</div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
                      Offline
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* SCRIPTURE SEARCH / REFERENCE MODAL                             */}
      {/* ============================================================== */}
      {isActive && isSearchOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSearchOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Search Scripture or Jump to Verse</h3>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => { handleReferenceSubmit(e); setIsSearchOpen(false); }} className="relative">
              <div className="flex items-center w-full px-3.5 py-2.5 rounded-2xl bg-neutral-800 border border-neutral-700 focus-within:border-gold transition">
                <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Joshua 10, John 3:16, grace, salvation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-neutral-500 font-medium"
                />
              </div>
            </form>

            {/* Quick reference examples */}
            {searchResults.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-1.5 divide-y divide-neutral-800 pr-1">
                {searchResults.slice(0, 15).map((sr) => (
                  <div
                    key={`${sr.book}-${sr.chapter}-${sr.verse}`}
                    onClick={() => {
                      const b = BIBLE_BOOKS.find(item => item.name.toLowerCase() === sr.book.toLowerCase());
                      if (b) setSelectedBook(b);
                      setCurrentChapter(sr.chapter);
                      setIsSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-neutral-800 cursor-pointer transition text-xs"
                  >
                    <div className="font-bold text-gold mb-0.5">{sr.book} {sr.chapter}:{sr.verse}</div>
                    <div className="text-neutral-300 line-clamp-2">{sr.text}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-400 space-y-2">
                <div className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Quick Jump Examples:</div>
                <div className="flex flex-wrap gap-2">
                  {['Joshua 10', 'John 3', 'Psalm 23', 'Romans 8', 'Colossians 1'].map((ref) => (
                    <button
                      key={ref}
                      onClick={() => {
                        setSearchQuery(ref);
                        const match = ref.trim().match(/^([1-3]?\s*[A-Za-z]+)\s*(\d+)?(?::(\d+))?$/);
                        if (match) {
                          const bookQuery = match[1].toLowerCase().replace(/\s+/g, '');
                          const chap = match[2] ? parseInt(match[2], 10) : 1;
                          const foundBook = BIBLE_BOOKS.find(b => 
                            b.name.toLowerCase().replace(/\s+/g, '').startsWith(bookQuery) ||
                            b.id.toLowerCase() === bookQuery
                          );
                          if (foundBook) {
                            setSelectedBook(foundBook);
                            setCurrentChapter(Math.min(chap, foundBook.chaptersCount));
                          }
                        }
                        setIsSearchOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs transition cursor-pointer"
                    >
                      {ref}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* 3. INTERACTIVE FLOATING ACTION POPOVER (Exact Match to Image 2) */}
      {/* ============================================================== */}
      {isActive && selectedVerse && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedVerse(null);
              setSelectedWord('');
            }
          }}
        >
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
            {/* Visual drag handle indicator for mobile bottom sheet */}
            <div className="w-10 h-1 rounded-full bg-neutral-700 mx-auto -mt-1 mb-2 sm:hidden" />
            
            {/* Header: Currently Selected + Reference + Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <div className="text-[11px] text-neutral-400 font-sans">Currently Selected:</div>
                <div className="font-serif font-bold text-base text-white flex items-center gap-1.5">
                  <span>{selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse} {selectedVerse.translation}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>
              <button
                onClick={() => { setSelectedVerse(null); setSelectedWord(''); }}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Verse Preview Quotation */}
            <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 text-xs text-neutral-200 italic leading-relaxed border-l-2 border-l-[#C5A46D]">
              "{selectedVerse.text}"
            </div>

            {/* BJC AI Study Assistant Section */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#111c2e] via-[#1a283e] to-[#0f172a] border border-[#C5A46D]/60 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E6CA92] to-[#C5A46D] text-slate-950 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="font-serif font-bold text-xs text-white tracking-wide">
                    BJC AI Study Companion
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Scripture AI
                </span>
              </div>

              {selectedWord && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gold/15 border border-gold/30 text-[11px] text-gold-200">
                  <Search className="w-3 h-3 text-[#C5A46D] shrink-0" />
                  <span className="truncate">Selected word: <strong>"{selectedWord}"</strong></span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenAiExegesis('meaning')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-[#C5A46D] hover:text-slate-950 text-white text-left transition flex flex-col gap-1 border border-white/10 group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gold group-hover:text-slate-950">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span>Ask Meaning</span>
                  </div>
                  <span className="text-[10px] text-neutral-300 group-hover:text-slate-900 leading-tight">
                    {selectedWord ? `Meaning of "${selectedWord}"` : 'Life application & truth'}
                  </span>
                </button>

                <button
                  onClick={() => handleOpenAiExegesis('context')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-[#C5A46D] hover:text-slate-950 text-white text-left transition flex flex-col gap-1 border border-white/10 group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gold group-hover:text-slate-950">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Deeper Context</span>
                  </div>
                  <span className="text-[10px] text-neutral-300 group-hover:text-slate-900 leading-tight">
                    Historical & original roots
                  </span>
                </button>
              </div>

              {/* Quick Custom Question Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (aiCustomQuestion.trim()) {
                    handleOpenAiExegesis('custom', aiCustomQuestion.trim());
                    setAiCustomQuestion('');
                  }
                }}
                className="flex items-center gap-1.5 pt-0.5"
              >
                <input
                  type="text"
                  value={aiCustomQuestion}
                  onChange={(e) => setAiCustomQuestion(e.target.value)}
                  placeholder="Ask BJC AI anything about this verse..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-gold/60"
                />
                <button
                  type="submit"
                  disabled={!aiCustomQuestion.trim()}
                  className="p-1.5 rounded-xl bg-[#C5A46D] disabled:opacity-30 text-slate-950 font-bold hover:bg-[#d6b77e] transition shrink-0 cursor-pointer"
                  title="Ask BJC AI"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Action 1: Highlight with 5 Color Circles */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
                <Highlighter className="w-4 h-4 text-neutral-400" />
                <span>Highlight</span>
              </div>

              <div className="flex items-center gap-2.5">
                {HIGHLIGHT_PALETTE.map(item => {
                  const currentHl = getVerseHighlight(selectedVerse.verse);
                  const isColorActive = currentHl?.color === item.color;
                  return (
                    <button
                      key={item.color}
                      onClick={() => handleApplyHighlight(item.color)}
                      style={{ backgroundColor: item.circle }}
                      className={`w-6 h-6 rounded-full transition-transform hover:scale-125 ${
                        isColorActive ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      title={item.label}
                    />
                  );
                })}
              </div>
            </div>

            {/* Action 2: Copy */}
            <button
              onClick={handleCopySelectedVerse}
              className="w-full flex items-center gap-3 py-2 px-1 text-sm font-semibold text-neutral-200 hover:text-white transition"
            >
              <Copy className="w-4 h-4 text-neutral-400" />
              <span>Copy</span>
            </button>

            {/* Action 3: Compare Translations */}
            <button
              onClick={() => setViewMode('compare-verse')}
              className="w-full flex items-center gap-3 py-2 px-1 text-sm font-semibold text-neutral-200 hover:text-white transition"
            >
              <Columns className="w-4 h-4 text-neutral-400" />
              <span>Compare</span>
            </button>

            {/* Action 4: Share */}
            <button
              onClick={handleShareSelectedVerse}
              className="w-full flex items-center gap-3 py-2 px-1 text-sm font-semibold text-neutral-200 hover:text-white transition"
            >
              <Share2 className="w-4 h-4 text-neutral-400" />
              <span>Share</span>
            </button>

            {/* Action 5: Personal Note */}
            <button
              onClick={() => {
                setNoteTitle(`Study Note on ${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`);
                setIsNoteModalOpen(true);
              }}
              className="w-full flex items-center gap-3 py-2 px-1 text-sm font-semibold text-neutral-200 hover:text-white transition"
            >
              <PenSquare className="w-4 h-4 text-neutral-400" />
              <span>Add Personal Note</span>
            </button>

            {/* Footer Banner: Holy Bible Synced Across Devices (Matches Image 2) */}
            <div className="pt-3 border-t border-neutral-800">
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center gap-3">
                {/* Holy Bible Red Icon Badge */}
                <div className="w-8 h-10 rounded bg-red-700 text-white flex flex-col items-center justify-center font-serif text-[8px] font-bold shadow shrink-0 leading-tight">
                  <span>HOLY</span>
                  <span>BIBLE</span>
                </div>
                <div className="text-[11px] text-neutral-300 leading-snug">
                  Want to have your highlights saved across all your devices?{' '}
                  <span className="text-gold font-bold underline cursor-pointer">
                    Connected to Beholding Jesus Church
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
      {/* ============================================================== */}
      {activeFootnote && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 bg-neutral-900 border border-gold/40 rounded-2xl shadow-elevated text-white space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gold">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Study Note: {selectedBook.name} {currentChapter}:{activeFootnote.verse}</span>
            </span>
            <button onClick={() => setActiveFootnote(null)} className="text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-serif">
            {activeFootnote.note}
          </p>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MULTI-TRANSLATION COMPARISON MODAL */}
      {/* ============================================================== */}
      {isActive && viewMode === 'compare-verse' && selectedVerse && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewMode('single');
          }}
        >
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-elevated text-white space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="font-serif font-bold text-lg">Compare Translations</h3>
                <p className="text-xs text-gold font-serif">
                  {selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse}
                </p>
              </div>
              <button
                onClick={() => setViewMode('single')}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 divide-y divide-neutral-800/80">
              {verseComparisonData.map((item) => (
                <div key={item.translation} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-gold/20 text-gold-300 text-xs font-bold font-mono">
                      {item.translation}
                    </span>
                    <span className="text-[10px] text-neutral-500">{item.name}</span>
                  </div>
                  <p className="font-serif text-sm text-neutral-200 leading-relaxed">
                    “{item.text}”
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* 6. ADD NOTE MODAL */}
      {/* ============================================================== */}
      {isActive && isNoteModalOpen && selectedVerse && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsNoteModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-elevated text-white space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-lg">Personal Scripture Study Note</h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 text-xs font-serif italic text-neutral-300">
              “{selectedVerse.text}” — {selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Note Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white outline-none focus:border-gold"
                  placeholder="e.g. Born Again Regeneration"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Topic / Category</label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white outline-none focus:border-gold"
                  placeholder="e.g. Discipleship, Salvation, Grace"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Devotional Reflection</label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-white outline-none focus:border-gold"
                  placeholder="What is the Holy Spirit speaking through this verse?"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-5 py-2 rounded-xl bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-dark hover:text-white transition"
              >
                Save Private Note
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* 7. BJC AI SCRIPTURE EXEGESIS MODAL                             */}
      {/* ============================================================== */}
      {isActive && isAiModalOpen && aiActiveVerse && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAiModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg sm:max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-elevated text-white flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-[#111c2e] to-[#1a283e] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#E6CA92] via-[#C5A46D] to-[#99793D] text-slate-950 flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                      BJC AI Scripture Exegesis
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider">
                      {aiTopic === 'meaning' ? 'Meaning & Life' : aiTopic === 'context' ? 'Deeper Context' : 'Verse Inquiry'}
                    </span>
                  </div>
                  <p className="text-xs text-gold/90 font-sans mt-0.5 font-semibold">
                    {aiActiveVerse.book} {aiActiveVerse.chapter}:{aiActiveVerse.verse} ({aiActiveVerse.translation})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verse Reference Card */}
            <div className="p-4 bg-neutral-950/60 border-b border-neutral-800/80 shrink-0">
              <div className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs sm:text-sm italic text-neutral-200 leading-relaxed border-l-4 border-l-[#C5A46D]">
                "{aiActiveVerse.text}"
              </div>
              {selectedWord && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/20 text-gold-200 text-[11px] font-semibold border border-gold/30">
                  <span>Focused on:</span>
                  <strong>"{selectedWord}"</strong>
                </div>
              )}
            </div>

            {/* Main Exegesis & Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-xs sm:text-sm bg-[#14171f]/80">
              {isAiLoading && !aiExegesisResult ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <p className="font-serif text-sm font-semibold text-neutral-200 italic animate-pulse">
                    BJC AI is seeking the Scriptures...
                  </p>
                  <p className="text-[11px] text-neutral-400 max-w-xs">
                    Analyzing {aiActiveVerse.book} {aiActiveVerse.chapter}:{aiActiveVerse.verse} with biblical exegesis and discipleship insights...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Initial Exegesis Answer */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-gold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Exegesis & Insights
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiExegesisResult);
                            setCopySuccessToast('Copied BJC AI exegesis!');
                            setTimeout(() => setCopySuccessToast(null), 2500);
                          }}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Copy exegesis"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={handleSaveAiExegesisAsNote}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Save to My Study Notes"
                        >
                          {isAiNoteSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Saved</span>
                            </>
                          ) : (
                            <>
                              <PenSquare className="w-3.5 h-3.5" />
                              <span>Save to Notes</span>
                            </>
                          )}
                        </button>
                        {onNavigate && (
                          <button
                            onClick={handleContinueInFullAi}
                            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Continue in Full BJC AI"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Full Chat</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Formatted Markdown Content */}
                    <div className="space-y-3 text-neutral-200 leading-relaxed">
                      {formatMarkdown(aiExegesisResult)}
                    </div>
                  </div>

                  {/* Follow-up Q&A turns */}
                  {aiChatTurns.slice(1).map((turn, tIdx) => (
                    <div
                      key={tIdx}
                      className={`p-4 rounded-2xl ${
                        turn.role === 'user'
                          ? 'bg-[#1E293B] text-white ml-6 sm:ml-12 border border-slate-700'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-200 mr-4'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-gold">
                        {turn.role === 'user' ? 'Your Question' : 'BJC AI'}
                      </div>
                      <div>{formatMarkdown(turn.text)}</div>
                    </div>
                  ))}

                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2 italic">
                      <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                      <span>BJC AI is seeking the Scriptures...</span>
                    </div>
                  )}

                  <div ref={aiChatEndRef} />
                </div>
              )}
            </div>

            {/* Footer Follow-up Input */}
            <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiFollowUp();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={aiFollowUpInput}
                  onChange={(e) => setAiFollowUpInput(e.target.value)}
                  placeholder="Ask a follow-up question about this verse..."
                  disabled={isAiLoading}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-gold/40"
                />
                <button
                  type="submit"
                  disabled={!aiFollowUpInput.trim() || isAiLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#C5A46D] disabled:opacity-40 text-slate-950 font-bold hover:bg-[#d6b77e] transition flex items-center gap-1.5 text-xs sm:text-sm shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask</span>
                </button>
              </form>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
