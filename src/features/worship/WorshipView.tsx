import React, { useState, useEffect } from 'react';
import { 
  Music, Mic, Volume2, Plus, Search, ChevronRight, Edit3, Trash2, 
  Calendar, CheckCircle2, Clock, Users, Sparkles, Filter, 
  Play, Square, ArrowUpDown, ChevronDown, ListPlus, FileText, Share2,
  X, Check
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { 
  Song, Singer, MusicalKey, SingerSongAssignment, 
  WorshipSetlist, WorshipSetlistItem 
} from '../../types';
import { 
  STANDARD_KEYS, CHROMATIC_SCALE, COMMON_VOCAL_RANGES, 
  COMMON_GENRES, SINGER_ROLES, playKeyTone, getKeyNotation, 
  calculateKeyDifference 
} from '../../utils/music';

export const WorshipView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'songs' | 'singers' | 'setlists' | 'wizard'>('songs');
  const [songs, setSongs] = useState<Song[]>(ChurchDataStore.getSongs());
  const [singers, setSingers] = useState<Singer[]>(ChurchDataStore.getSingers());
  const [setlists, setSetlists] = useState<WorshipSetlist[]>(ChurchDataStore.getSetlists());

  // Cloud Sync for Worship Songs & Singers (Cross-Device PC & Mobile)
  useEffect(() => {
    let isMounted = true;
    const loadCloudWorship = async () => {
      const [cloudSongs, cloudSingers] = await Promise.all([
        ChurchDataStore.fetchSongsFromCloud(),
        ChurchDataStore.fetchSingersFromCloud()
      ]);
      if (isMounted) {
        if (cloudSongs) setSongs(cloudSongs);
        if (cloudSingers) setSingers(cloudSingers);
      }
    };
    loadCloudWorship();
    const interval = setInterval(loadCloudWorship, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [activeSongForDetail, setActiveSongForDetail] = useState<Song | null>(null);

  // Audio tone playing state
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  // -------------------------------------------------------------
  // FLOWCHART WIZARD STATE (Exact 4-Step Diagram)
  // 1. Add Song -> 2. Add Singer -> 3. Add Vocal Keys -> Decision Loops -> 4. View / Manage
  // -------------------------------------------------------------
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
  
  // Step 1: Song fields
  const [wSongTitle, setWSongTitle] = useState('');
  const [wSongArtist, setWSongArtist] = useState('');
  const [wSongComposer, setWSongComposer] = useState('');
  const [wSongGenre, setWSongGenre] = useState('Worship / Contemporary');
  const [wSongTempo, setWSongTempo] = useState('72');
  const [wSongOriginalKey, setWSongOriginalKey] = useState<MusicalKey>('D');
  const [wSongNotes, setWSongNotes] = useState('');
  const [wSongLyrics, setWSongLyrics] = useState('');

  // Step 2: Singer fields
  const [wSelectedSingerId, setWSelectedSingerId] = useState<string>('');
  const [wSingerName, setWSingerName] = useState('');
  const [wSingerRole, setWSingerRole] = useState<'Lead' | 'Backup' | 'Duet' | 'Choir' | 'Acoustic Lead'>('Lead');
  const [wSingerRange, setWSingerRange] = useState('C3 – C5');

  // Step 3: Vocal Keys fields
  const [wVocalKey, setWVocalKey] = useState<MusicalKey>('D');
  const [wKeyRange, setWKeyRange] = useState('D4 – D5');
  const [wKeyNotes, setWKeyNotes] = useState('');
  const [wAccumulatedKeys, setWAccumulatedKeys] = useState<{
    key: MusicalKey;
    notation: string;
    range?: string;
    notes?: string;
  }[]>([]);

  // Current active song being created or augmented in wizard
  const [wizardActiveSongId, setWizardActiveSongId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // MODAL STATES FOR INDEPENDENT ADDS
  // -------------------------------------------------------------
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isAddSingerModalOpen, setIsAddSingerModalOpen] = useState(false);
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [keyTargetSong, setKeyTargetSong] = useState<Song | null>(null);

  // New Singer Direct State
  const [newSingerName, setNewSingerName] = useState('');
  const [newSingerRole, setNewSingerRole] = useState('Lead / Soprano');
  const [newSingerRange, setNewSingerRange] = useState('C3 – C5');
  const [newSingerNotes, setNewSingerNotes] = useState('');

  // Setlist Active View
  const [selectedSetlist, setSelectedSetlist] = useState<WorshipSetlist | null>(setlists[0] || null);

  // Audio Play helper
  const handlePlayTone = (key: string, isChord: boolean = false) => {
    setPlayingKey(key);
    playKeyTone(key, isChord);
    setTimeout(() => setPlayingKey(null), 1200);
  };

  // -------------------------------------------------------------
  // WIZARD EXECUTION LOGIC (Matching Flowchart)
  // -------------------------------------------------------------
  const startWizard = (existingSongId?: string) => {
    if (existingSongId) {
      const existing = songs.find(s => s.id === existingSongId);
      if (existing) {
        setWizardActiveSongId(existing.id);
        setWSongTitle(existing.title);
        setWSongArtist(existing.artist);
        setWSongOriginalKey(existing.originalKey as MusicalKey);
        setWizardStep(2); // Jump straight to Add Singer for this song
      }
    } else {
      setWizardActiveSongId(null);
      setWSongTitle('');
      setWSongArtist('');
      setWSongComposer('');
      setWSongGenre('Worship / Contemporary');
      setWSongTempo('72');
      setWSongOriginalKey('D');
      setWSongNotes('');
      setWSongLyrics('');
      setWizardStep(1);
    }
    setWSelectedSingerId('');
    setWSingerName('');
    setWAccumulatedKeys([]);
    setIsWizardModalOpen(true);
  };

  // Step 1 Finish -> Save Song to Database -> Go to Step 2 (Add Singer)
  const handleFinishStep1 = () => {
    if (!wSongTitle.trim()) return;
    const saved = ChurchDataStore.saveSong({
      id: wizardActiveSongId || undefined,
      title: wSongTitle,
      artist: wSongArtist,
      composer: wSongComposer,
      genre: wSongGenre,
      tempo: wSongTempo,
      originalKey: wSongOriginalKey,
      notes: wSongNotes,
      lyrics: wSongLyrics
    });
    setSongs(ChurchDataStore.getSongs());
    setWizardActiveSongId(saved.id);
    setWizardStep(2);
  };

  // Step 2 Finish -> Prepare Singer -> Go to Step 3 (Add Vocal Keys)
  const handleFinishStep2 = () => {
    let singerId = wSelectedSingerId;
    let sName = wSingerName;

    if (singerId) {
      const found = singers.find(s => s.id === singerId);
      if (found) sName = found.name;
    } else if (sName.trim()) {
      // Create new singer
      const newSinger = ChurchDataStore.saveSinger({
        name: sName,
        defaultRole: wSingerRole,
        vocalRange: wSingerRange
      });
      setSingers(ChurchDataStore.getSingers());
      singerId = newSinger.id;
      setWSelectedSingerId(singerId);
    } else {
      return;
    }

    setWSingerName(sName);
    setWizardStep(3);
  };

  // Step 3 Add Key to temporary buffer
  const handleAddKeyToBuffer = () => {
    const notation = getKeyNotation(wVocalKey);
    setWAccumulatedKeys([
      ...wAccumulatedKeys,
      {
        key: wVocalKey,
        notation,
        range: wKeyRange,
        notes: wKeyNotes
      }
    ]);
    setWKeyNotes('');
  };

  // Step 3 Finish -> Save Vocal Keys to Database -> Step 4 (Decision Loops)
  const handleFinishStep3 = () => {
    if (!wizardActiveSongId || !wSelectedSingerId) return;
    
    // If user entered a key without clicking "Add Key to List", add it
    const keysToSave = wAccumulatedKeys.length > 0 ? wAccumulatedKeys : [
      {
        key: wVocalKey,
        notation: getKeyNotation(wVocalKey),
        range: wKeyRange,
        notes: wKeyNotes
      }
    ];

    ChurchDataStore.addVocalKeysToSong({
      songId: wizardActiveSongId,
      singerId: wSelectedSingerId,
      singerName: wSingerName,
      role: wSingerRole,
      keys: keysToSave
    });

    setSongs(ChurchDataStore.getSongs());
    setWizardStep(4); // Decision step
  };

  // Delete key handler
  const handleDeleteKey = (songId: string, singerId: string, keyId: string) => {
    ChurchDataStore.deleteSingerKey(songId, singerId, keyId);
    setSongs(ChurchDataStore.getSongs());
  };

  // Filtered songs
  const filteredSongs = songs.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.singers?.some(sg => sg.singerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === 'All' || s.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER & PITCH PIPE BANNER */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-primary text-white border border-slate-800 p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/icons/hero-cross-cinematic.png')" }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
              <Music className="w-3.5 h-3.5 text-gold" />
              <span>Worship Ministry Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Song & Vocal Key Management System
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Standardized key management following the official church workflow. Assign singers, store customized vocal keys and octave ranges, and plan Sunday setlists.
            </p>
          </div>

          {/* Action triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => startWizard()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs sm:text-sm hover:bg-gold-dark hover:text-white transition shadow-gold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch 4-Step Wizard</span>
            </button>
            <button
              onClick={() => setIsAddSongModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/20 transition"
            >
              <Plus className="w-4 h-4 text-gold-300" />
              <span>Add Song</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BUILT-IN PITCH PIPE / AUDIO REFERENCE BAR */}
        {/* ============================================================ */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gold-300">
              <Volume2 className="w-4 h-4" />
              <span>Interactive Chromatic Pitch Pipe (Click to hear reference tone / pitch)</span>
            </div>
            <span className="text-[11px] text-slate-400">A440 Web Audio Synthesizer</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {CHROMATIC_SCALE.map(k => (
              <button
                key={k.key}
                onClick={() => handlePlayTone(k.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition shadow-sm ${
                  playingKey === k.key
                    ? 'bg-gold text-slate-950 ring-2 ring-white scale-105'
                    : 'bg-white/10 hover:bg-white/25 text-white border border-white/15'
                }`}
                title={`Play ${k.name}`}
              >
                {k.key}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ============================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'songs' 
                ? 'bg-primary text-white shadow-soft' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Songs & Vocal Keys ({songs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('singers')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'singers' 
                ? 'bg-primary text-white shadow-soft' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Singers Roster ({singers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('setlists')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'setlists' 
                ? 'bg-primary text-white shadow-soft' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Worship Setlists ({setlists.length})</span>
          </button>
        </div>

        {/* Quick Add Singer button */}
        <button
          onClick={() => setIsAddSingerModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Singer</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. SONGS & VOCAL KEYS VIEW (Step 4: View / Manage) */}
      {/* ============================================================== */}
      {activeTab === 'songs' && (
        <div className="space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search songs, artists, or singers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-gold/30 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Genre:</span>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none shadow-sm"
              >
                <option value="All">All Genres</option>
                {COMMON_GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Songs List */}
          <div className="space-y-4">
            {filteredSongs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
                <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto">
                  <Music className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-slate-800 dark:text-white">Your Song Library is Clean & Ready</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">No placeholder songs! Worship leaders and team members can now input real church songs, assign singers, and test vocal key ranges.</p>
                </div>
                <button
                  onClick={() => setIsWizardModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-dark hover:text-white transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Song & Keys</span>
                </button>
              </div>
            ) : (
              filteredSongs.map(song => (
              <div 
                key={song.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4 transition hover:border-gold/40"
              >
                {/* Song Meta Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                        {song.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark dark:text-gold border border-gold/30">
                        Original Key: {song.originalKey}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>{song.artist || 'Original Church Worship'}</span>
                      <span>•</span>
                      <span>{song.genre}</span>
                      <span>•</span>
                      <span>{song.tempo} BPM</span>
                      {song.mood && (
                        <>
                          <span>•</span>
                          <span className="italic">{song.mood}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Song actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePlayTone(song.originalKey, true)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition"
                      title="Play original key chord"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-gold" />
                      <span>Hear {song.originalKey}</span>
                    </button>

                    <button
                      onClick={() => {
                        setKeyTargetSong(song);
                        setIsAddKeyModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gold text-slate-950 hover:bg-gold-dark hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Singer Keys</span>
                    </button>

                    <button
                      onClick={() => {
                        const updated = ChurchDataStore.deleteSong(song.id);
                        setSongs(updated);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                      title="Delete Song"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Song Notes (if any) */}
                {song.notes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    “{song.notes}”
                  </p>
                )}

                {/* Singers & Vocal Keys Table (Flowchart Step 4 Detail) */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Assigned Singers & Vocal Keys ({song.singers?.length || 0})</span>
                  </div>

                  {(!song.singers || song.singers.length === 0) ? (
                    <div className="py-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                      No singers assigned to this song yet. Click <strong>“Add Singer Keys”</strong> to assign vocal keys.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {song.singers.map(assignment => (
                        <div 
                          key={assignment.id || assignment.singerId}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-2.5"
                        >
                          {/* Singer Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center font-bold text-xs text-gold-dark dark:text-gold">
                                {assignment.singerName.charAt(0)}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                  {assignment.singerName}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Role: {assignment.role || 'Lead'}
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                              {assignment.keys.length} {assignment.keys.length === 1 ? 'key' : 'keys'}
                            </span>
                          </div>

                          {/* Vocal Keys for this Singer */}
                          <div className="space-y-1.5 pt-1">
                            {assignment.keys.map(k => {
                              const diff = calculateKeyDifference(song.originalKey, k.key);
                              return (
                                <div 
                                  key={k.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handlePlayTone(k.key)}
                                      className={`px-2 py-0.5 rounded font-bold font-mono text-xs transition ${
                                        playingKey === k.key ? 'bg-gold text-slate-950 scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-gold/20'
                                      }`}
                                      title="Click to play vocal pitch"
                                    >
                                      Key: {k.key}
                                    </button>
                                    <div className="truncate">
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Range: {k.range || 'C3 – C5'}
                                      </span>
                                      {k.notes && (
                                        <span className="text-[10px] text-slate-400 block truncate">
                                          {k.notes}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] text-slate-400">
                                      {diff.description}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteKey(song.id, assignment.singerId, k.id)}
                                      className="text-slate-300 hover:text-rose-500 p-0.5"
                                      title="Remove this key"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lyrics & Chords snippet preview */}
                {song.lyrics && (
                  <div className="pt-2">
                    <details className="text-xs text-slate-500 cursor-pointer">
                      <summary className="font-semibold text-gold hover:underline">
                        View Lyrics & Chord Structure
                      </summary>
                      <pre className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-200 dark:border-slate-800">
                        {song.lyrics}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )))}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SINGERS ROSTER VIEW */}
      {/* ============================================================== */}
      {activeTab === 'singers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {singers.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
                <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-slate-800 dark:text-white">No Singers Added Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">Add your worship vocalists, choir members, and backup singers with their comfortable vocal ranges.</p>
                </div>
                <button
                  onClick={() => setIsWizardModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-dark hover:text-white transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Singer</span>
                </button>
              </div>
            ) : (
              singers.map(s => {
              // Count how many songs this singer is assigned to
              const assignedCount = songs.filter(song => 
                song.singers?.some(assignment => assignment.singerId === s.id)
              ).length;

              return (
                <div 
                  key={s.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center font-bold text-base text-gold-dark dark:text-gold border border-gold/30 shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {s.name}
                        </h4>
                        <div className="text-xs text-sage-600 dark:text-sage-400 font-medium">
                          {s.defaultRole || 'Lead Vocalist'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div>
                        <strong>Vocal Range:</strong> {s.vocalRange || 'C3 – C5'}
                      </div>
                      {s.notes && (
                        <div className="text-[11px] text-slate-400 line-clamp-2">
                          {s.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">
                      {assignedCount} {assignedCount === 1 ? 'Song' : 'Songs'} Assigned
                    </span>
                    <button
                      onClick={() => {
                        const updated = ChurchDataStore.deleteSinger(s.id);
                        setSingers(updated);
                        setSongs(ChurchDataStore.getSongs());
                      }}
                      className="text-slate-300 hover:text-rose-500 p-1"
                      title="Delete Singer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. WORSHIP SETLISTS & SUNDAY PLANNER VIEW */}
      {/* ============================================================== */}
      {activeTab === 'setlists' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Setlists Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Worship Setlists
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{setlists.length} plans</span>
            </div>

            <div className="space-y-2">
              {setlists.map(sl => (
                <div
                  key={sl.id}
                  onClick={() => setSelectedSetlist(sl)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    selectedSetlist?.id === sl.id
                      ? 'bg-primary text-white border-primary shadow-soft'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-gold'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold">{sl.serviceDate}</span>
                    <span className="text-[10px] uppercase font-bold opacity-80">{sl.items?.length || 0} Songs</span>
                  </div>
                  <h4 className="font-bold text-sm">{sl.title}</h4>
                  <div className="text-xs opacity-75 mt-1">{sl.notes}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Setlist Detail Canvas */}
          <div className="lg:col-span-2 space-y-6">
            {selectedSetlist ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-gold uppercase tracking-wider">
                      Sunday Worship Service Lineup
                    </span>
                    <h2 className="font-serif font-bold text-2xl text-slate-900 dark:text-white mt-1">
                      {selectedSetlist.title}
                    </h2>
                    <div className="text-xs text-slate-500 mt-1">
                      Date: {selectedSetlist.serviceDate} • Leader: {selectedSetlist.worshipLeader || 'Mica Ramos'}
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-slate-200 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Print / Export Lineup</span>
                  </button>
                </div>

                {/* Setlist Song Items */}
                <div className="space-y-3">
                  {selectedSetlist.items?.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-gold/20 font-bold text-xs text-gold-dark dark:text-gold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sage-600 dark:text-sage-400">
                            {item.segment}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.songTitle}
                          </h4>
                          <div className="text-xs text-slate-500">
                            Lead: <strong>{item.leadSinger || item.singerName}</strong> {item.backups && `(Backups: ${item.backups})`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handlePlayTone(item.chosenKey, true)}
                          className="px-3 py-1.5 rounded-xl bg-gold/15 text-gold-dark dark:text-gold font-bold font-mono text-xs flex items-center gap-1.5 hover:bg-gold/25 transition"
                          title="Click to play setlist key"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Key: {item.chosenKey}</span>
                        </button>

                        {item.tempo && (
                          <span className="text-xs font-mono text-slate-400">
                            {item.tempo} BPM
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Select a setlist to view song order and vocal assignments.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 6. GUIDED FLOWCHART WIZARD MODAL (1. Add Song -> 2. Add Singer -> 3. Add Vocal Keys -> 4. View/Manage) */}
      {/* ============================================================== */}
      {isWizardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 my-8">
            
            {/* Wizard Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold dark:text-gold-300">
                  Step-by-Step Flowchart Wizard
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                  Song & Vocal Key Setup Workflow
                </h3>
              </div>
              <button onClick={() => setIsWizardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
              <div className={`p-2 rounded-xl transition ${wizardStep >= 1 ? 'bg-primary text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                1. Add Song
              </div>
              <div className={`p-2 rounded-xl transition ${wizardStep >= 2 ? 'bg-primary text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                2. Add Singer
              </div>
              <div className={`p-2 rounded-xl transition ${wizardStep >= 3 ? 'bg-primary text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                3. Vocal Keys
              </div>
              <div className={`p-2 rounded-xl transition ${wizardStep >= 4 ? 'bg-gold text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                4. View / Loops
              </div>
            </div>

            {/* STEP 1: ADD SONG */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="p-3 bg-gold/10 rounded-xl text-xs text-gold-dark dark:text-gold font-medium">
                  Step 1: Enter song title, original musical key, artist, tempo, and optional notes.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Song Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Goodness of God"
                      value={wSongTitle}
                      onChange={(e) => setWSongTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Artist / Composer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bethel Music / Jenn Johnson"
                      value={wSongArtist}
                      onChange={(e) => setWSongArtist(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Original Key *
                    </label>
                    <select
                      value={wSongOriginalKey}
                      onChange={(e) => setWSongOriginalKey(e.target.value as MusicalKey)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none font-bold"
                    >
                      {STANDARD_KEYS.map(k => (
                        <option key={k} value={k}>{k} ({getKeyNotation(k)})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tempo (BPM)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 72"
                      value={wSongTempo}
                      onChange={(e) => setWSongTempo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Song Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Worship instructions, dynamics, acoustic transition notes..."
                    value={wSongNotes}
                    onChange={(e) => setWSongNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setIsWizardModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinishStep1}
                    disabled={!wSongTitle.trim()}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    Next: Add Singer →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ADD SINGER */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 bg-sage-50 dark:bg-slate-800/80 rounded-xl text-xs text-sage-700 dark:text-sage-400 font-medium">
                  Step 2: Choose an existing singer from the database or type a new singer name and their worship role.
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Select Existing Singer (or type below)
                    </label>
                    <select
                      value={wSelectedSingerId}
                      onChange={(e) => {
                        setWSelectedSingerId(e.target.value);
                        const s = singers.find(singer => singer.id === e.target.value);
                        if (s) {
                          setWSingerName(s.name);
                          setWSingerRange(s.vocalRange || 'C3 – C5');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                    >
                      <option value="">-- Choose from Singer Database --</option>
                      {singers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.defaultRole || 'Lead'})</option>
                      ))}
                    </select>
                  </div>

                  {!wSelectedSingerId && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Or Enter New Singer Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John"
                        value={wSingerName}
                        onChange={(e) => setWSingerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Role / Part
                      </label>
                      <select
                        value={wSingerRole}
                        onChange={(e) => setWSingerRole(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none font-semibold"
                      >
                        <option value="Lead">Lead Vocalist</option>
                        <option value="Backup">Backup Vocalist</option>
                        <option value="Duet">Duet</option>
                        <option value="Choir">Choir / Ensemble</option>
                        <option value="Acoustic Lead">Acoustic Lead</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Vocal Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. C3 – C5"
                        value={wSingerRange}
                        onChange={(e) => setWSingerRange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    ← Back to Song
                  </button>
                  <button
                    onClick={handleFinishStep2}
                    disabled={!wSelectedSingerId && !wSingerName.trim()}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                  >
                    Next: Add Vocal Keys →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ADD VOCAL KEYS FOR SINGER */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-slate-800/80 rounded-xl text-xs text-amber-800 dark:text-amber-400 font-medium">
                  Step 3: Add one or more vocal keys for <strong>{wSingerName}</strong>. Support for all 12 keys (C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B) and vocal ranges.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Vocal Key *
                    </label>
                    <select
                      value={wVocalKey}
                      onChange={(e) => setWVocalKey(e.target.value as MusicalKey)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold outline-none"
                    >
                      {STANDARD_KEYS.map(k => (
                        <option key={k} value={k}>Key of {k} ({getKeyNotation(k)})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Range in this Key
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. C3 – C5"
                      value={wKeyRange}
                      onChange={(e) => setWKeyRange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Key Notes / Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Comfortable acoustic range, Capo on 2nd fret"
                    value={wKeyNotes}
                    onChange={(e) => setWKeyNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleAddKeyToBuffer}
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Key for {wSingerName}</span>
                  </button>

                  <button
                    onClick={() => handlePlayTone(wVocalKey)}
                    type="button"
                    className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hear Tone ({wVocalKey})</span>
                  </button>
                </div>

                {/* Accumulated Keys preview */}
                {wAccumulatedKeys.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Keys to be saved:</span>
                    <div className="flex flex-wrap gap-2">
                      {wAccumulatedKeys.map((k, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold">
                          Key: {k.key} ({k.range || 'Range standard'})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    ← Back to Singer
                  </button>
                  <button
                    onClick={handleFinishStep3}
                    className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Save & Next: Decision Loops →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DECISION LOOPS (Matching Flowchart) */}
            {wizardStep === 4 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>

                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    Vocal Keys Saved Successfully!
                  </h4>
                  <p className="text-xs text-slate-500">
                    Flowchart Decision Loops: Would you like to add another singer to this song, or add another song?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  {/* Loop 1: Add Another Singer? */}
                  <button
                    onClick={() => {
                      setWSelectedSingerId('');
                      setWSingerName('');
                      setWAccumulatedKeys([]);
                      setWizardStep(2); // Loop back to Add Singer
                    }}
                    className="p-3 rounded-2xl border border-gold/40 hover:bg-gold/10 text-gold-dark dark:text-gold text-xs font-bold transition flex flex-col items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Singer</span>
                    <span className="text-[10px] font-normal opacity-80">(Keep active song)</span>
                  </button>

                  {/* Loop 2: Add Another Song? */}
                  <button
                    onClick={() => {
                      setWizardActiveSongId(null);
                      setWSongTitle('');
                      setWSongArtist('');
                      setWSongComposer('');
                      setWAccumulatedKeys([]);
                      setWizardStep(1); // Loop back to Add Song
                    }}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex flex-col items-center gap-1"
                  >
                    <Music className="w-4 h-4" />
                    <span>Add Another Song</span>
                    <span className="text-[10px] font-normal opacity-80">(Start new song)</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsWizardModalOpen(false);
                      setActiveTab('songs');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800 shadow-soft"
                  >
                    Finish & View / Manage in Database
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. INDEPENDENT MODAL: ADD SINGER TO DATABASE */}
      {/* ============================================================== */}
      {isAddSingerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Add Singer to Roster
              </h3>
              <button onClick={() => setIsAddSingerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Singer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mica, Kyle, Jane"
                  value={newSingerName}
                  onChange={(e) => setNewSingerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Default Role / Part
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead / Soprano, Alto, Tenor"
                  value={newSingerRole}
                  onChange={(e) => setNewSingerRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Vocal Range (e.g. C3 – C5)
                </label>
                <input
                  type="text"
                  placeholder="e.g. C3 – C5, F3 – F5"
                  value={newSingerRange}
                  onChange={(e) => setNewSingerRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Vocal tone, strengths, availability..."
                  value={newSingerNotes}
                  onChange={(e) => setNewSingerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddSingerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newSingerName.trim()) return;
                  ChurchDataStore.saveSinger({
                    name: newSingerName,
                    defaultRole: newSingerRole,
                    vocalRange: newSingerRange,
                    notes: newSingerNotes
                  });
                  setSingers(ChurchDataStore.getSingers());
                  setIsAddSingerModalOpen(false);
                  setNewSingerName('');
                  setNewSingerNotes('');
                }}
                disabled={!newSingerName.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                Save Singer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. INDEPENDENT MODAL: ADD VOCAL KEYS TO A SPECIFIC SONG */}
      {/* ============================================================== */}
      {isAddKeyModalOpen && keyTargetSong && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  Add Vocal Keys to “{keyTargetSong.title}”
                </h3>
                <div className="text-xs text-gold">Original Key: {keyTargetSong.originalKey}</div>
              </div>
              <button onClick={() => setIsAddKeyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Select Singer
                </label>
                <select
                  value={wSelectedSingerId}
                  onChange={(e) => {
                    setWSelectedSingerId(e.target.value);
                    const s = singers.find(singer => singer.id === e.target.value);
                    if (s) setWSingerName(s.name);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                >
                  <option value="">-- Choose Singer --</option>
                  {singers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.defaultRole || 'Lead'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Vocal Key
                  </label>
                  <select
                    value={wVocalKey}
                    onChange={(e) => setWVocalKey(e.target.value as MusicalKey)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  >
                    {STANDARD_KEYS.map(k => (
                      <option key={k} value={k}>Key of {k} ({getKeyNotation(k)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Range (e.g. C3 – C5)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. C3 – C5"
                    value={wKeyRange}
                    onChange={(e) => setWKeyRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Key Notes / Transition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Comfortable acoustic range"
                  value={wKeyNotes}
                  onChange={(e) => setWKeyNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!wSelectedSingerId) return;
                  ChurchDataStore.addVocalKeysToSong({
                    songId: keyTargetSong.id,
                    singerId: wSelectedSingerId,
                    singerName: wSingerName,
                    role: 'Lead',
                    keys: [
                      {
                        key: wVocalKey,
                        notation: getKeyNotation(wVocalKey),
                        range: wKeyRange,
                        notes: wKeyNotes
                      }
                    ]
                  });
                  setSongs(ChurchDataStore.getSongs());
                  setIsAddKeyModalOpen(false);
                }}
                disabled={!wSelectedSingerId}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                Add Key to Song
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. INDEPENDENT MODAL: ADD SONG */}
      {/* ============================================================== */}
      {isAddSongModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Add New Worship Song
              </h3>
              <button onClick={() => setIsAddSongModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Way Maker"
                    value={wSongTitle}
                    onChange={(e) => setWSongTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Artist / Composer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sinach / Leeland"
                    value={wSongArtist}
                    onChange={(e) => setWSongArtist(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Original Key *
                  </label>
                  <select
                    value={wSongOriginalKey}
                    onChange={(e) => setWSongOriginalKey(e.target.value as MusicalKey)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  >
                    {STANDARD_KEYS.map(k => (
                      <option key={k} value={k}>{k} ({getKeyNotation(k)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Lyrics & Chords (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste lyrics with bracketed chords e.g. [D] Into your [A] hand..."
                  value={wSongLyrics}
                  onChange={(e) => setWSongLyrics(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddSongModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!wSongTitle.trim()) return;
                  ChurchDataStore.saveSong({
                    title: wSongTitle,
                    artist: wSongArtist,
                    originalKey: wSongOriginalKey,
                    genre: wSongGenre,
                    tempo: wSongTempo,
                    lyrics: wSongLyrics
                  });
                  setSongs(ChurchDataStore.getSongs());
                  setIsAddSongModalOpen(false);
                  setWSongTitle('');
                  setWSongArtist('');
                  setWSongLyrics('');
                }}
                disabled={!wSongTitle.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                Save Song to Database
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
