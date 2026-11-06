import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Users, CheckCircle2, 
  Plus, Search, ChevronRight, X, Sparkles, Filter, ExternalLink,
  Compass, ImageIcon, Check
} from 'lucide-react';
import { ChurchDataStore } from '../../services/churchDataStore';
import { CHURCH_INFO } from '../../services/churchInfo';
import { ChurchEvent, EventCategory, UserProfile } from '../../types';

export const EventsView: React.FC = () => {
  const [events, setEvents] = useState<ChurchEvent[]>(ChurchDataStore.getEvents());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Add Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('2026-11-15');
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newEndTime, setNewEndTime] = useState('11:00 AM');
  const [newLocation, setNewLocation] = useState(CHURCH_INFO.address);
  const [newCategory, setNewCategory] = useState<EventCategory>('Sunday Worship Service');
  const [newCapacity, setNewCapacity] = useState('150');

  const currentUser: UserProfile = ChurchDataStore.getCurrentUser();
  const canManageEvents = ['super_admin', 'church_admin', 'pastor', 'ministry_leader'].includes(currentUser.role);

  // Cloud Sync with Supabase (Cross-device PC & Mobile)
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      const cloudEvents = await ChurchDataStore.fetchEventsFromCloud();
      if (isMounted && cloudEvents) {
        setEvents(cloudEvents);
      }
    };
    loadEvents();
    const interval = setInterval(loadEvents, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const categories: EventCategory[] = [
    'Sunday Worship Service',
    'Youth Service',
    'Bible Study',
    'Prayer Meeting',
    'Fellowship',
    'Outreach',
    'Discipleship',
    'Special Church Events'
  ];

  const handleToggleRegistration = (eventId: string) => {
    ChurchDataStore.toggleEventRegistration(eventId);
    setEvents(ChurchDataStore.getEvents());
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(CHURCH_INFO.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvent: ChurchEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      location: newLocation,
      category: newCategory,
      coverImage: '/images/church-service-banner.png',
      organizerName: currentUser.name,
      requiresRegistration: true,
      capacity: parseInt(newCapacity, 10) || 100,
      registeredUserIds: [currentUser.id],
      attendeesCount: 1
    };

    ChurchDataStore.saveEvent(newEvent);
    setEvents(ChurchDataStore.getEvents());
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const filteredEvents = events.filter(e => {
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
              Church Schedules & Events
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark dark:text-gold font-bold uppercase tracking-wider">
              {CHURCH_INFO.primaryMotto}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sunday celebrations, weekly prayer nights, youth fellowship, and systematic Bible studies in Bacoor City, Cavite.
          </p>
        </div>

        {canManageEvents && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gold text-slate-950 font-bold text-xs shadow-gold hover:bg-gold-dark hover:text-white transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Event</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* FEATURED: OFFICIAL WEEKLY GATHERING TIMES CARD */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-primary text-white border border-slate-800 p-6 sm:p-8 shadow-elevated space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-300 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-gold" />
              <span>Official Weekly Gathering Times</span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
              Beholding Jesus Church Weekly Order
            </h2>
            <p className="text-xs text-slate-300">
              {CHURCH_INFO.secondaryMotto} • {CHURCH_INFO.shortAddress}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedBanner(CHURCH_INFO.banners.serviceBanner)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-md border border-white/20 transition flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5 text-gold-300" />
              <span>View Service Banner</span>
            </button>
            <button
              onClick={() => setSelectedBanner(CHURCH_INFO.banners.weeklySchedules)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur-md border border-white/20 transition flex items-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5 text-gold-300" />
              <span>View Schedule Flyer</span>
            </button>
          </div>
        </div>

        {/* 4 Official Schedules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-900">
          {CHURCH_INFO.schedules.map((s, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl transition space-y-2 flex flex-col justify-between ${
                s.highlight ? 'bg-gold text-slate-950 font-medium shadow-gold' : 'bg-white/95 dark:bg-slate-900 text-slate-800 dark:text-slate-100'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    s.highlight ? 'bg-slate-950 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {s.dayAbbr}
                  </span>
                  <span className="text-[10px] opacity-80 font-semibold">{s.badge}</span>
                </div>
                <div className="text-lg font-bold font-serif pt-1 leading-tight">
                  {s.time}
                </div>
                <div className="font-bold text-xs leading-tight">
                  {s.name}
                </div>
                <p className="text-[11px] opacity-85 leading-snug">
                  {s.description}
                </p>
              </div>

              <div className="pt-2 border-t border-black/10 dark:border-white/10 text-[10px] opacity-75 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Every {s.day}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sanctuary Address Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-300 shrink-0" />
            <span className="font-medium">
              <strong>Sanctuary:</strong> {CHURCH_INFO.address}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyAddress}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition flex items-center gap-1"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              <span>{copiedAddress ? 'Address Copied!' : 'Copy Address'}</span>
            </button>
            <a
              href={CHURCH_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-gold text-slate-950 font-bold text-xs hover:bg-gold-dark hover:text-white transition flex items-center gap-1 shadow-sm"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by title, description, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-gold/30 shadow-sm"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
              selectedCategory === 'All' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Events
          </button>
          {categories.slice(0, 4).map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
                selectedCategory === c ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map(event => {
          const isRegistered = event.registeredUserIds?.includes(currentUser.id);
          const capacityLeft = (event.capacity || 100) - (event.attendeesCount || 0);

          return (
            <div
              key={event.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4 flex flex-col justify-between hover:border-gold/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md font-bold uppercase text-[10px] bg-primary/10 dark:bg-slate-800 text-primary dark:text-gold">
                    {event.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-gold" />
                    <span>{event.startTime} – {event.endTime}</span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white leading-snug">
                  {event.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-1.5 pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span><strong>Date:</strong> {event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span className="truncate"><strong>Venue:</strong> {event.location}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Attendance & Registration Row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {event.attendeesCount || 0} Brethren Registered
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {capacityLeft > 0 ? `${capacityLeft} slots open` : 'Full capacity'}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleRegistration(event.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                    isRegistered
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                      : 'bg-primary text-white hover:bg-slate-800'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Registered</span>
                    </>
                  ) : (
                    <span>Register to Attend</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner Lightbox Modal */}
      {selectedBanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-elevated border border-slate-800">
            <button
              onClick={() => setSelectedBanner(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedBanner} 
              alt="Church Banner" 
              className="w-full h-auto object-contain max-h-[80vh]" 
            />
          </div>
        </div>
      )}

      {/* Schedule Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Schedule Church Event
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunday Celebration: Walking in Colossians"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Flr. Camella Springville Molino 3, Bacoor City"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Details, sermon topic, items to bring..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
