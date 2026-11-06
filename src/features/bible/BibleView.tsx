import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Search, Bookmark, Highlighter, MessageSquare, 
  ChevronLeft, ChevronRight, Copy, Share2, Check, SlidersHorizontal,
  Columns, AlignLeft, Sparkles, BookMarked, PenSquare, Trash2, X,
  ExternalLink, Layers, Info, Headphones, Volume2, VolumeX, Play, Pause,
  Square, Maximize2, Minimize2, Type, CheckCircle2, Globe, Heart, Loader2,
  Lightbulb, Send
} from 'lucide-react';
import { BIBLE_BOOKS, BIBLE_TRANSLATIONS } from './bibleBooks';
import { BibleService } from './bibleService';
import { BjcAiService, BjcAiMessage } from '../../services/bjcAiService';
import { 
  BibleBook, BibleVerse, BibleTranslationCode, 
  BibleHighlight, BibleBookmark, BibleNote 
} from '../../types';

interface BibleViewProps {
  onNavigate?: (tab: string) => void;
}

export const BibleView: React.FC<BibleViewProps> = ({ onNavigate }) => {
  // -------------------------------------------------------------
  // NAVIGATION & TRANSLATION STATE
  // -------------------------------------------------------------
  // Default to John 3 (matching reference screenshot) or Colossians
  const [selectedBook, setSelectedBook] = useState<BibleBook>(() => {
    return BIBLE_BOOKS.find(b => b.id === 'JHN') || BIBLE_BOOKS.find(b => b.id === 'COL') || BIBLE_BOOKS[0];
  });
  const [currentChapter, setCurrentChapter] = useState<number>(3);
  const [selectedTranslation, setSelectedTranslation] = useState<BibleTranslationCode>('NIV');
  const [comparisonTranslation, setComparisonTranslation] = useState<BibleTranslationCode>('KJV');
  const [viewMode, setViewMode] = useState<'single' | 'parallel' | 'compare-verse'>('single');

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
  const [bookPickerTab, setBookPickerTab] = useState<'OT' | 'NT'>('NT');

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
    dark: 'bg-[#121212] text-[#f1f5f9]',
    midnight: 'bg-[#0b1329] text-[#e2e8f0]',
    sepia: 'bg-[#fbf0d9] text-[#433422]',
    light: 'bg-[#ffffff] text-[#1e293b]'
  };

  const themeTopBar = {
    dark: 'bg-[#181818]/90 border-neutral-800 text-white',
    midnight: 'bg-[#111c38]/90 border-slate-800 text-white',
    sepia: 'bg-[#f4e6cb]/90 border-[#e6d3af] text-[#433422]',
    light: 'bg-white/90 border-slate-200 text-slate-800'
  };

  return (
    <div className={`transition-colors duration-200 min-h-[calc(100dvh-64px)] ${
      isExpanded 
        ? 'fixed inset-0 z-50 overflow-y-auto ' + themeStyles[readingTheme]
        : 'border-0 md:rounded-2xl md:border md:m-3 border-slate-200/80 dark:border-slate-800 shadow-xs ' + themeStyles[readingTheme]
    }`}>

      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR (Exact Design from Reference Screenshot 1 & 2) */}
      {/* ============================================================== */}
      <div className={`sticky top-0 z-30 px-4 sm:px-6 py-3 border-b backdrop-blur-md flex items-center justify-between gap-3 ${themeTopBar[readingTheme]}`}>
        
        {/* Left Side: Search Pill + Quick Book Picker Icon */}
        <div className="flex items-center gap-2 flex-1 max-w-sm sm:max-w-md">
          <form onSubmit={handleReferenceSubmit} className="relative flex-1">
            <div className="flex items-center w-full px-3 py-1.5 rounded-full bg-black/20 dark:bg-neutral-800/80 border border-white/10 dark:border-neutral-700/60 focus-within:border-gold/50 transition">
              <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder={`${selectedBook.name} ${currentChapter}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-neutral-400 font-medium"
              />
            </div>
          </form>

          {/* Book / Chapter Picker Button (Book Icon) */}
          <button
            onClick={() => setIsBookPickerOpen(!isBookPickerOpen)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title="Browse Books & Chapters"
            aria-label="Browse Books"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Translation Pill, Headphones (Audio), View/Compare, AA, Expand */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Translation Selector Pill (e.g., 'NIV') */}
          <div className="relative group">
            <button
              onClick={() => {
                const codes: BibleTranslationCode[] = ['NIV', 'KJV', 'ESV', 'NLT', 'WEB', 'ASV', 'NKJV', 'NASB', 'FSV'];
                const nextIdx = (codes.indexOf(selectedTranslation) + 1) % codes.length;
                setSelectedTranslation(codes[nextIdx]);
              }}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold tracking-wider text-white transition flex items-center gap-1"
              title="Click to cycle translation or hover for menu"
            >
              <span>{selectedTranslation}</span>
            </button>

            {/* Translation Dropdown Hover */}
            <div className="hidden group-hover:block absolute right-0 top-full pt-1.5 z-40">
              <div className="p-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-elevated w-36 text-xs text-slate-200">
                {BIBLE_TRANSLATIONS.map(tr => (
                  <button
                    key={tr.code}
                    onClick={() => setSelectedTranslation(tr.code)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      selectedTranslation === tr.code ? 'bg-gold text-slate-950 font-bold' : 'hover:bg-neutral-800'
                    }`}
                  >
                    <span>{tr.code}</span>
                    <span className="text-[10px] opacity-75 font-normal truncate ml-1">{tr.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio / Headphones Icon (Text-to-Speech) */}
          <button
            onClick={() => {
              if (isAudioPlaying) pauseAudio();
              else startAudio();
            }}
            className={`p-2 rounded-full transition relative ${
              isAudioPlaying 
                ? 'bg-gold text-slate-950 ring-2 ring-gold/40' 
                : 'hover:bg-white/10 text-neutral-300 hover:text-white'
            }`}
            title={isAudioPlaying ? 'Pause Audio Reading' : 'Listen to Chapter Audio'}
            aria-label="Audio Bible"
          >
            <Headphones className="w-4 h-4" />
            {isAudioPlaying && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          {/* Parallel / Comparison Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'single' ? 'parallel' : 'single')}
            className={`p-2 rounded-full transition ${
              viewMode === 'parallel' 
                ? 'bg-white/20 text-white' 
                : 'hover:bg-white/10 text-neutral-300 hover:text-white'
            }`}
            title={viewMode === 'parallel' ? 'Single Translation View' : 'Side-by-Side Parallel View'}
            aria-label="Parallel Mode"
          >
            <Columns className="w-4 h-4" />
          </button>

          {/* Display Settings Button: "AA" */}
          <div className="relative">
            <button
              onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)}
              className={`px-2 py-1 rounded-full text-xs font-serif font-bold tracking-tight transition ${
                isDisplayMenuOpen 
                  ? 'bg-white/20 text-white' 
                  : 'hover:bg-white/10 text-neutral-300 hover:text-white'
              }`}
              title="Reading Display & Typography (AA)"
              aria-label="Text Settings"
            >
              AA
            </button>

            {/* Display Menu Popover */}
            {isDisplayMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-elevated z-50 text-white space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  <span>Reading Settings</span>
                  <button onClick={() => setIsDisplayMenuOpen(false)} className="text-neutral-500 hover:text-white">
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
                      className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold"
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
                      className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold"
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
                      className={`p-2 rounded-xl text-xs font-serif font-bold border transition ${
                        fontFamily === 'serif' 
                          ? 'border-gold bg-gold/15 text-gold-200' 
                          : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      Biblical Serif
                    </button>
                    <button
                      onClick={() => setFontFamily('sans')}
                      className={`p-2 rounded-xl text-xs font-sans font-bold border transition ${
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
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                        readingTheme === 'dark' ? 'border-gold ring-1 ring-gold' : 'border-neutral-800'
                      }`}
                      style={{ backgroundColor: '#121212' }}
                    >
                      <span className="text-[10px] text-neutral-200 font-bold">Dark</span>
                    </button>
                    <button
                      onClick={() => setReadingTheme('midnight')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                        readingTheme === 'midnight' ? 'border-gold ring-1 ring-gold' : 'border-neutral-800'
                      }`}
                      style={{ backgroundColor: '#0b1329' }}
                    >
                      <span className="text-[10px] text-slate-200 font-bold">Navy</span>
                    </button>
                    <button
                      onClick={() => setReadingTheme('sepia')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                        readingTheme === 'sepia' ? 'border-amber-600 ring-1 ring-amber-600' : 'border-neutral-800'
                      }`}
                      style={{ backgroundColor: '#fbf0d9' }}
                    >
                      <span className="text-[10px] text-[#433422] font-bold">Sepia</span>
                    </button>
                    <button
                      onClick={() => setReadingTheme('light')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition ${
                        readingTheme === 'light' ? 'border-gold ring-1 ring-gold' : 'border-neutral-800'
                      }`}
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <span className="text-[10px] text-slate-900 font-bold">White</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Expand / Maximize Immersion Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition"
            title={isExpanded ? 'Exit Expanded View (Esc)' : 'Expand to Fullscreen View'}
            aria-label="Expand Reader"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4 text-gold" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* AUDIO PLAYBACK STICKY BAR (When audio is active) */}
      {/* ============================================================== */}
      {isAudioPlaying && (
        <div className="sticky top-14 z-20 px-6 py-2 bg-gold/15 dark:bg-gold/10 border-b border-gold/30 backdrop-blur-md flex items-center justify-between text-xs text-gold-300">
          <div className="flex items-center gap-2 font-medium">
            <Volume2 className="w-4 h-4 animate-pulse text-gold" />
            <span>Reading {selectedBook.name} {currentChapter} in {selectedTranslation}</span>
            {currentSpokenVerse && (
              <span className="px-2 py-0.5 rounded bg-gold/20 font-bold text-gold-200">
                Verse {currentSpokenVerse}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextSpeed = audioSpeed === 1.0 ? 1.25 : audioSpeed === 1.25 ? 0.8 : 1.0;
                setAudioSpeed(nextSpeed);
              }}
              className="px-2 py-0.5 rounded bg-black/30 text-[11px] font-mono hover:bg-black/50"
            >
              {audioSpeed}x
            </button>
            <button onClick={pauseAudio} className="hover:text-white">
              <Pause className="w-4 h-4" />
            </button>
            <button onClick={stopAudio} className="hover:text-white">
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TOAST CONFIRMATION NOTIFICATION */}
      {/* ============================================================== */}
      {copySuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-neutral-900 border border-gold/40 text-white shadow-elevated text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <span>{copySuccessToast}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOOK & CHAPTER QUICK SELECTOR MODAL */}
      {/* ============================================================== */}
      {isBookPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-elevated text-white space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-lg">Select Scripture Book & Chapter</h3>
              </div>
              <button 
                onClick={() => setIsBookPickerOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Testament Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setBookPickerTab('NT')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  bookPickerTab === 'NT' ? 'bg-gold text-slate-950 font-bold' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                New Testament (27 Books)
              </button>
              <button
                onClick={() => setBookPickerTab('OT')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  bookPickerTab === 'OT' ? 'bg-gold text-slate-950 font-bold' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                Old Testament (39 Books)
              </button>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto flex-1 pr-1">
              {BIBLE_BOOKS.filter(b => b.testament === bookPickerTab).map(book => (
                <button
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setCurrentChapter(1);
                    setIsBookPickerOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    selectedBook.id === book.id 
                      ? 'border-gold bg-gold/20 text-gold-200 font-bold' 
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-800/40 text-neutral-300'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{book.name}</div>
                  <div className="text-[10px] text-neutral-500">{book.chaptersCount} ch</div>
                </button>
              ))}
            </div>

            {/* Current Book Chapters Bar */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <div className="text-xs text-neutral-400 font-medium">
                Chapters in <span className="text-white font-bold">{selectedBook.name}</span>:
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setCurrentChapter(num);
                      setIsBookPickerOpen(false);
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                      currentChapter === num
                        ? 'bg-gold text-slate-950 font-bold shadow-gold'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MAIN READING CANVAS (Exact Typography & Red Letters) */}
      {/* ============================================================== */}
      <div className="relative min-h-[75vh] px-4 sm:px-12 md:px-20 lg:px-28 py-10">
        
        {/* Floating Previous Chapter Chevron on Left (Desktop only to prevent mobile overlap) */}
        <button
          onClick={handlePrevChapter}
          disabled={isAtFirstChapter}
          className="hidden md:flex fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed text-white border border-white/10 items-center justify-center shadow-lg transition backdrop-blur-sm"
          title="Previous Chapter"
          aria-label="Previous Chapter"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Floating Next Chapter Chevron on Right (Desktop only to prevent mobile overlap) */}
        <button
          onClick={handleNextChapter}
          disabled={isAtLastChapter}
          className="hidden md:flex fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed text-white border border-white/10 items-center justify-center shadow-lg transition backdrop-blur-sm"
          title="Next Chapter"
          aria-label="Next Chapter"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Reader Container */}
        <div className={`mx-auto transition-all duration-200 ${
          readerWidth === 'expanded' || isExpanded ? 'max-w-4xl' : 'max-w-2xl'
        }`}>
          
          {/* Chapter Top Navigation Bar (Responsive on Mobile and Desktop) */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-8">
            <button
              onClick={handlePrevChapter}
              disabled={isAtFirstChapter}
              className="px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="text-center space-y-1">
              <button 
                onClick={() => setIsBookPickerOpen(true)}
                className="group inline-flex items-center gap-2 hover:opacity-85 transition"
                title="Change book or chapter"
              >
                <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-none text-white group-hover:text-gold transition">
                  {selectedBook.name} {currentChapter}
                </h1>
              </button>
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-neutral-400 font-sans font-semibold">
                <span>{selectedTranslation}</span>
                <span>•</span>
                <span>Chapter {currentChapter} of {selectedBook.chaptersCount}</span>
                {isLoadingVerses && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gold lowercase font-normal tracking-normal">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    syncing...
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleNextChapter}
              disabled={isAtLastChapter}
              className="px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              title="Next Chapter"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ============================================================== */}
          {/* SINGLE TRANSLATION CONTINUOUS FLOW */}
          {/* ============================================================== */}
          {viewMode === 'single' ? (
            <div 
              key={`${selectedBook.id}-${currentChapter}-${selectedTranslation}`}
              className={`leading-relaxed space-y-4 animate-in fade-in duration-200 ${
                fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
              style={{ fontSize: `${fontSizePx}px` }}
            >
              {verses.map((v) => {
                const hl = getVerseHighlight(v.verse);
                const isSelected = selectedVerse?.verse === v.verse;
                const isSpoken = currentSpokenVerse === v.verse;
                const isRed = redLetterEnabled && (v.isJesusWords || false);

                return (
                  <React.Fragment key={`${selectedBook.id}-${currentChapter}-${v.verse}`}>
                    
                    {/* Section Title Heading (e.g. "Jesus Teaches Nicodemus") */}
                    {v.sectionTitle && (
                      <h2 className="font-serif font-bold text-lg sm:text-xl pt-6 pb-2 text-white/95 tracking-wide">
                        {v.sectionTitle}
                      </h2>
                    )}

                    {/* Verse Span in Paragraph Flow */}
                    <span
                      onClick={() => handleSelectVerse(v)}
                      className={`inline cursor-pointer rounded transition-all relative ${
                        isSelected 
                          ? 'border-b-2 border-dotted border-white/80 bg-white/5 pb-0.5' 
                          : 'hover:bg-white/5'
                      } ${hl ? `${hl.color === 'yellow' ? 'bg-yellow-400/25 text-yellow-100' : hl.color === 'green' ? 'bg-emerald-400/25 text-emerald-100' : hl.color === 'cyan' ? 'bg-cyan-400/25 text-cyan-100' : hl.color === 'peach' ? 'bg-orange-400/25 text-orange-100' : 'bg-fuchsia-400/25 text-fuchsia-100'} px-1 py-0.5 rounded` : ''} ${
                        isSpoken ? 'bg-gold/30 text-gold-200' : ''
                      }`}
                    >
                      {/* Superscript Verse Number */}
                      <sup className="text-[0.68em] font-sans font-bold text-neutral-500 mr-1 select-none">
                        {v.verse}
                      </sup>

                      {/* Verse Text: Red Letter Rendering when Jesus speaks */}
                      <span className={isRed ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
                        {v.text}{' '}
                      </span>

                      {/* Footnote Comment Bubble Icon (💬) */}
                      {v.hasNote && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFootnote(activeFootnote?.verse === v.verse ? null : { verse: v.verse, note: v.footnote || '' });
                          }}
                          className="inline-flex items-center text-neutral-500 hover:text-gold mx-1 transition align-middle"
                          title="Study Note / Footnote"
                        >
                          <MessageSquare className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
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

          {/* Bottom Chapter Navigation (Seamless across mobile and desktop) */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10 text-xs sm:text-sm">
            <button
              onClick={handlePrevChapter}
              disabled={isAtFirstChapter}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed text-white font-medium transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Chapter</span>
            </button>

            <span className="text-[11px] sm:text-xs text-neutral-400 font-sans tracking-wide">
              {selectedBook.name} {currentChapter} of {selectedBook.chaptersCount}
            </span>

            <button
              onClick={handleNextChapter}
              disabled={isAtLastChapter}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed text-white font-medium transition shadow-sm"
            >
              <span>Next Chapter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. INTERACTIVE FLOATING ACTION POPOVER (Exact Match to Image 2) */}
      {/* ============================================================== */}
      {selectedVerse && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-sm sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-elevated text-white space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
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
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FOOTNOTE POPOVER (When clicking 💬 comment bubble) */}
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
      {viewMode === 'compare-verse' && selectedVerse && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
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
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. ADD NOTE MODAL */}
      {/* ============================================================== */}
      {isNoteModalOpen && selectedVerse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. BJC AI SCRIPTURE EXEGESIS MODAL                             */}
      {/* ============================================================== */}
      {isAiModalOpen && aiActiveVerse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
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
        </div>
      )}

    </div>
  );
};
