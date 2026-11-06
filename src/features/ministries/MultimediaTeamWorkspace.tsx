import React, { useState } from 'react';
import { 
  Video, Mic, Speaker, Monitor, Film, Camera, 
  Wifi, Cable, CheckCircle2, AlertTriangle, XCircle, 
  Plus, Clock, FileText, Download, Check, Sparkles, 
  Calendar, Layers, Filter, ChevronRight
} from 'lucide-react';
import { 
  MinistryStore, MultimediaEquipmentItem, MultimediaPresentationItem, 
  MediaRequestItem, UnifiedServicePlan 
} from '../../services/ministryStore';
import { UserProfile } from '../../types';

interface MultimediaTeamWorkspaceProps {
  currentUser?: UserProfile | null;
}

export const MultimediaTeamWorkspace: React.FC<MultimediaTeamWorkspaceProps> = ({
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tech_checklist' | 'presentations' | 'crew_assignments' | 'media_requests'>('tech_checklist');

  // Equipment state (9 categories)
  const [equipment, setEquipment] = useState<MultimediaEquipmentItem[]>(() => MinistryStore.getEquipment());
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Presentation state
  const [presentations, setPresentations] = useState<MultimediaPresentationItem[]>(() => MinistryStore.getPresentations());
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [newPres, setNewPres] = useState({
    serviceDate: '2026-11-08',
    title: '',
    slidesCount: 30,
    lyricsReady: true,
    versesReady: true,
    status: 'ready' as const
  });

  // Media requests state
  const [mediaRequests, setMediaRequests] = useState<MediaRequestItem[]>(() => MinistryStore.getMediaRequests());
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newReq, setNewReq] = useState({
    title: '',
    requestType: 'Announcement Graphics' as MediaRequestItem['requestType'],
    dueDate: '2026-11-20',
    description: ''
  });

  const equipmentCategories = [
    'All',
    'Microphones',
    'Speakers',
    'Audio mixer',
    'Projector',
    'Display screens',
    'Computers',
    'Cameras',
    'Livestream equipment',
    'Cables & accessories'
  ];

  const handleStatusChange = (id: string, status: MultimediaEquipmentItem['status']) => {
    MinistryStore.updateEquipmentStatus(id, status);
    setEquipment(MinistryStore.getEquipment());
  };

  const handleCreatePresentation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPres.title.trim()) return;
    MinistryStore.savePresentation(newPres);
    setPresentations(MinistryStore.getPresentations());
    setIsPresModalOpen(false);
    setNewPres({
      serviceDate: '2026-11-08',
      title: '',
      slidesCount: 30,
      lyricsReady: true,
      versesReady: true,
      status: 'ready'
    });
  };

  const handleCreateMediaRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.title.trim()) return;
    MinistryStore.saveMediaRequest({
      ...newReq,
      requestedBy: currentUser?.name || 'Ministry Leader',
      requestedRole: currentUser?.role?.replace('_', ' ') || 'Staff',
      status: 'submitted'
    });
    setMediaRequests(MinistryStore.getMediaRequests());
    setIsRequestModalOpen(false);
    setNewReq({
      title: '',
      requestType: 'Announcement Graphics',
      dueDate: '2026-11-20',
      description: ''
    });
  };

  const handleUpdateReqStatus = (id: string, status: MediaRequestItem['status']) => {
    MinistryStore.updateMediaRequestStatus(id, status);
    setMediaRequests(MinistryStore.getMediaRequests());
  };

  const filteredEquipment = filterCategory === 'All' 
    ? equipment 
    : equipment.filter(e => e.category === filterCategory);

  const readyEquipCount = equipment.filter(e => e.status === 'ready').length;
  const attentionCount = equipment.filter(e => e.status === 'needs_attention').length;
  const unavailableCount = equipment.filter(e => e.status === 'unavailable').length;

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#17153B] via-[#1E1B4B] to-[#12102E] text-white p-6 sm:p-8 border border-indigo-900/40 shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span>Technical & Production Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Multimedia Team Operations
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Equipping Sunday worship with crystal-clear audio, dynamic visuals, reverent slide presentations, and HD live broadcasts to extend the reach of the Gospel.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 sm:gap-3">
            <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] font-bold uppercase text-stone-300 block">Equipment Ready</span>
              <span className="text-xl font-black text-emerald-400">{readyEquipCount}/{equipment.length}</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] font-bold uppercase text-stone-300 block">Active Requests</span>
              <span className="text-xl font-black text-indigo-400">{mediaRequests.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('tech_checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'tech_checklist'
              ? 'bg-indigo-600 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Technical Equipment (9 Categories)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('presentations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'presentations'
              ? 'bg-indigo-600 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Sunday Presentations ({presentations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('crew_assignments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'crew_assignments'
              ? 'bg-indigo-600 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Technical Crew Roles</span>
        </button>

        <button
          onClick={() => setActiveSubTab('media_requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'media_requests'
              ? 'bg-indigo-600 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Media Requests Tracker ({mediaRequests.length})</span>
        </button>
      </div>

      {/* 1. TECHNICAL EQUIPMENT (9 CATEGORIES) */}
      {activeSubTab === 'tech_checklist' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <Mic className="w-5 h-5 text-indigo-600" />
                Equipment & Production Hardware Verification
              </h3>
              <p className="text-xs text-stone-500">
                Ensure all 9 critical AV categories are stage-ready prior to Sunday corporate service.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {equipmentCategories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    filterCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm mt-0.5">
                      {item.name}
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.status === 'ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                    item.status === 'needs_attention' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                    'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 p-2 rounded-xl border border-stone-200/60 dark:border-stone-700">
                    {item.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">Checked: {item.lastChecked}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStatusChange(item.id, 'ready')}
                      title="Mark Ready"
                      className={`p-1.5 rounded-lg text-xs font-bold transition ${item.status === 'ready' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-100 text-stone-500'}`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'needs_attention')}
                      title="Needs Attention"
                      className={`p-1.5 rounded-lg text-xs font-bold transition ${item.status === 'needs_attention' ? 'bg-amber-600 text-white' : 'hover:bg-amber-100 text-stone-500'}`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'unavailable')}
                      title="Mark Unavailable"
                      className={`p-1.5 rounded-lg text-xs font-bold transition ${item.status === 'unavailable' ? 'bg-red-600 text-white' : 'hover:bg-red-100 text-stone-500'}`}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PRESENTATION MANAGER */}
      {activeSubTab === 'presentations' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5 text-indigo-600" />
                Sunday Presentation Slide Decks
              </h3>
              <p className="text-xs text-stone-500">
                Synchronize song lyrics, scripture readings, and pastoral sermon slides.
              </p>
            </div>

            <button
              onClick={() => setIsPresModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition"
            >
              <Plus className="w-4 h-4" />
              <span>Stage New Slide Deck</span>
            </button>
          </div>

          <div className="space-y-3">
            {presentations.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white text-sm">
                      {p.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                      p.status === 'in_review' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-stone-500 flex items-center gap-3 text-[11px]">
                    <span>Service: <strong>{p.serviceDate}</strong></span>
                    <span>•</span>
                    <span>{p.slidesCount} Slides</span>
                    <span>•</span>
                    <span className={p.lyricsReady ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      Lyrics: {p.lyricsReady ? 'Verified' : 'Pending'}
                    </span>
                    <span>•</span>
                    <span className={p.versesReady ? 'text-emerald-600 font-semibold' : 'text-stone-400'}>
                      Verses: {p.versesReady ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const updated = presentations.map(item => item.id === p.id ? { ...item, status: 'ready' as const } : item);
                      setPresentations(updated);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sunday Ready</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TECHNICAL CREW ROLES */}
      {activeSubTab === 'crew_assignments' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              Technical Crew Roles & Responsibilities
            </h3>
            <p className="text-xs text-stone-500">
              Assigned operators for audio, presentation, camera switching, livestream, and visual media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role: 'Sound Operator', name: 'Mark Anthony Diaz', icon: Speaker, desc: 'Sanctuary PA levels, wireless mics, stage in-ear monitors, and sound dynamics.' },
              { role: 'Presentation Operator', name: 'Alyssa Reyes', icon: Monitor, desc: 'Advancing praise lyrics, scripture slides, and announcement loops on cue.' },
              { role: 'Camera Operator', name: 'Joshua Tan', icon: Camera, desc: 'Directing stage cameras, tracking worship leader and pastor preaching.' },
              { role: 'Livestream Operator', name: 'Joshua Tan', icon: Wifi, desc: 'Managing OBS / ATEM streaming switcher, stream bitrate, and online viewer feed.' },
              { role: 'Photographer', name: 'Alyssa Reyes', icon: Camera, desc: 'Capturing reverent church moments, guest greetings, and sermon highlights.' },
              { role: 'Video Editor & Motion', name: 'Mark Anthony Diaz', icon: Film, desc: 'Post-service sermon clip editing, YouTube upload, and social highlights.' }
            ].map((crew, idx) => {
              const Icon = crew.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">{crew.role}</span>
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm">{crew.name}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 pt-1 leading-relaxed">
                    {crew.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MEDIA REQUESTS TRACKER */}
      {activeSubTab === 'media_requests' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Church-Wide Media Requests Tracker
              </h3>
              <p className="text-xs text-stone-500">
                Staff and ministry leaders can request event posters, announcement graphics, slides, and video edits.
              </p>
            </div>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Media Request</span>
            </button>
          </div>

          <div className="space-y-3">
            {mediaRequests.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {req.requestType}
                    </span>
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm mt-0.5">
                      {req.title}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      Requested by <strong>{req.requestedBy}</strong> ({req.requestedRole}) • Due: {req.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {(['submitted', 'in_progress', 'for_review', 'approved', 'completed'] as MediaRequestItem['status'][]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateReqStatus(req.id, st)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                          req.status === st
                            ? 'bg-indigo-600 text-white shadow-soft'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-700">
                  {req.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Presentation */}
      {isPresModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">Stage New Presentation Deck</h3>
            <form onSubmit={handleCreatePresentation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Presentation Title</label>
                <input 
                  type="text" 
                  value={newPres.title} 
                  onChange={e => setNewPres({ ...newPres, title: e.target.value })} 
                  placeholder="e.g. Sunday Worship & Sermon Slide Deck"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Service Date</label>
                  <input 
                    type="date" 
                    value={newPres.serviceDate} 
                    onChange={e => setNewPres({ ...newPres, serviceDate: e.target.value })} 
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Slides Count</label>
                  <input 
                    type="number" 
                    value={newPres.slidesCount} 
                    onChange={e => setNewPres({ ...newPres, slidesCount: parseInt(e.target.value) || 0 })} 
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsPresModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Slide Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Media Request */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">Submit Media / Design Request</h3>
            <form onSubmit={handleCreateMediaRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={newReq.title} 
                  onChange={e => setNewReq({ ...newReq, title: e.target.value })} 
                  placeholder="e.g. Christmas Eve Service Social Poster"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Request Type</label>
                  <select
                    value={newReq.requestType}
                    onChange={e => setNewReq({ ...newReq, requestType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  >
                    <option value="Announcement Graphics" className="bg-slate-900 text-white">Announcement Graphics</option>
                    <option value="Event Posters" className="bg-slate-900 text-white">Event Posters</option>
                    <option value="Presentation Slides" className="bg-slate-900 text-white">Presentation Slides</option>
                    <option value="Video Editing" className="bg-slate-900 text-white">Video Editing</option>
                    <option value="Photography" className="bg-slate-900 text-white">Photography</option>
                    <option value="Livestream Support" className="bg-slate-900 text-white">Livestream Support</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={newReq.dueDate} 
                    onChange={e => setNewReq({ ...newReq, dueDate: e.target.value })} 
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Brief & Details</label>
                <textarea 
                  value={newReq.description} 
                  onChange={e => setNewReq({ ...newReq, description: e.target.value })} 
                  placeholder="Provide dimensions, text, theme, and specific requests..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white h-24"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};