import React, { useState } from 'react';
import { 
  Users, UserCheck, ShieldCheck, Heart, AlertTriangle, 
  CheckCircle2, Circle, Clock, Plus, Phone, Mail, 
  MapPin, Calendar, FileText, Check, Lock, Eye, EyeOff
} from 'lucide-react';
import { 
  MinistryStore, UsheringVisitorRecord, UsheringLostFoundItem, 
  UsheringIncidentReport, UnifiedServicePlan 
} from '../../services/ministryStore';
import { UserProfile } from '../../types';

interface UsheringTeamWorkspaceProps {
  currentUser?: UserProfile | null;
}

export const UsheringTeamWorkspace: React.FC<UsheringTeamWorkspaceProps> = ({
  currentUser
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-08');
  const [currentPlan, setCurrentPlan] = useState<UnifiedServicePlan>(() => 
    MinistryStore.getServicePlanByDate('2026-11-08')
  );
  
  // Tab within Ushering
  const [activeSubTab, setActiveSubTab] = useState<'duties' | 'visitors' | 'lost_found' | 'incidents'>('duties');

  // Visitor state
  const [visitors, setVisitors] = useState<UsheringVisitorRecord[]>(() => MinistryStore.getVisitors());
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    phone: '',
    email: '',
    isFirstTime: true,
    prayerRequest: '',
    assignedLeader: 'John Miko Sarsalijo'
  });

  // Lost & Found state
  const [lostFound, setLostFound] = useState<UsheringLostFoundItem[]>(() => MinistryStore.getLostFound());
  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ item: '', location: '', date: '2026-11-08' });

  // Incident reports state
  const [incidents, setIncidents] = useState<UsheringIncidentReport[]>(() => MinistryStore.getIncidents());
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'low' as 'low' | 'medium' | 'high'
  });

  // Role permissions
  const userRole = currentUser?.role || 'member';
  const isAuthorized = ['super_admin', 'church_admin', 'pastor', 'ministry_leader'].includes(userRole);

  const handleToggleCheck = (key: keyof UnifiedServicePlan['ushering']['checklist']) => {
    const updated = {
      ...currentPlan.ushering.checklist,
      [key]: !currentPlan.ushering.checklist[key]
    };
    MinistryStore.updateUsheringPrep(selectedDate, { checklist: updated });
    setCurrentPlan(MinistryStore.getServicePlanByDate(selectedDate));
  };

  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitor.name.trim()) return;
    MinistryStore.saveVisitor({
      ...newVisitor,
      serviceDate: selectedDate,
      followUpStatus: 'new',
      notes: 'Registered during Sunday service.'
    });
    setVisitors(MinistryStore.getVisitors());
    setIsVisitorModalOpen(false);
    setNewVisitor({
      name: '',
      phone: '',
      email: '',
      isFirstTime: true,
      prayerRequest: '',
      assignedLeader: 'John Miko Sarsalijo'
    });
  };

  const handleCreateLostFound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.item.trim()) return;
    MinistryStore.saveLostFound({
      ...newItem,
      isClaimed: false
    });
    setLostFound(MinistryStore.getLostFound());
    setIsLostFoundModalOpen(false);
    setNewItem({ item: '', location: '', date: selectedDate });
  };

  const handleToggleClaim = (id: string) => {
    MinistryStore.toggleLostFoundClaim(id, currentUser?.name || 'Authorized Lead');
    setLostFound(MinistryStore.getLostFound());
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.title.trim()) return;
    MinistryStore.saveIncident({
      ...newIncident,
      date: selectedDate,
      isResolved: false,
      reportedBy: currentUser?.name || 'Usher on Duty'
    });
    setIncidents(MinistryStore.getIncidents());
    setIsIncidentModalOpen(false);
    setNewIncident({ title: '', description: '', severity: 'low' });
  };

  const checklistItems = [
    { key: 'entranceAreaPrepared' as const, label: '1. Entrance Foyer & Sanitizing Station Prepared', desc: 'Doors propped open, foyer greeting tables clean and stocked.' },
    { key: 'seatingAreaOrganized' as const, label: '2. Main Sanctuary Seating Arranged & Cleared', desc: 'Row aisles open, reserve seats marked for elderly and families.' },
    { key: 'welcomeTeamAssigned' as const, label: '3. Foyer Greeters & Warm Welcome Team Stationed', desc: 'Warm smiles, handshake/greeting badges ready.' },
    { key: 'guestAssistanceReady' as const, label: '4. Guest Welcome Bags & Registration Cards Ready', desc: 'First-time visitor gifts and connect cards organized.' },
    { key: 'serviceMaterialsPrepared' as const, label: '5. Offering Buckets, Envelopes & Bulletins Distributed', desc: 'Offering buckets placed at designated stations.' },
    { key: 'finalCoordinationDone' as const, label: '6. Pre-Service Prayer & Headcount Strategy Briefing', desc: 'Briefing at 8:00 AM with Head Usher.' }
  ];

  const completedChecks = Object.values(currentPlan.ushering.checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedChecks / checklistItems.length) * 100);

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0C2419] via-[#0F3022] to-[#0A1B13] text-white p-6 sm:p-8 border border-emerald-900/40 shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hospitality & Sanctuary Care</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Ushering Team Operations
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Welcoming every soul into God's presence with joy, preserving church order, tending to visitors, and ensuring every member is served with love.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 text-center">
              <span className="text-[10px] font-bold uppercase text-stone-300 block">Total Visitors Hosted</span>
              <span className="text-2xl font-black text-emerald-400">{visitors.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('duties')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'duties'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Duty Scheduling & Checklist</span>
        </button>

        <button
          onClick={() => setActiveSubTab('visitors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'visitors'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Guest Welcome System ({visitors.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lost_found')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'lost_found'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Lost & Found ({lostFound.filter(l => !l.isClaimed).length} Unclaimed)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'incidents'
              ? 'bg-emerald-600 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Private Incident Reports</span>
        </button>
      </div>

      {/* 1. DUTIES & SERVICE PREPARATION CHECKLIST */}
      {activeSubTab === 'duties' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Service Preparation Checklist
                </h3>
                <p className="text-xs text-stone-500">Service Sunday: <strong>{selectedDate}</strong></p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600">{progressPercent}% Ready</span>
                <div className="text-[10px] text-stone-400">{completedChecks} of 6 Items</div>
              </div>
            </div>

            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {checklistItems.map(item => {
                const isChecked = currentPlan.ushering.checklist[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleCheck(item.key)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 select-none ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-stone-900 dark:text-white shadow-soft'
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100/80'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className={`text-xs font-bold leading-tight ${isChecked ? 'text-emerald-900 dark:text-emerald-200' : 'text-stone-800 dark:text-stone-200'}`}>
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duty Station Roster */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <Users className="w-5 h-5 text-emerald-600" />
              Duty Station Assignments
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                  Entrance & Foyer Welcomers
                </span>
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {currentPlan.ushering.welcomeTeam.join(', ') || 'Unassigned'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                  Sanctuary Seating Assistance
                </span>
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {currentPlan.ushering.assignedUshers.join(', ') || 'Unassigned'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                  Tithes & Offering Stewards
                </span>
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  {currentPlan.ushering.offeringTeam.join(', ') || 'Unassigned'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GUEST WELCOME SYSTEM */}
      {activeSubTab === 'visitors' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                Guest Welcome & Follow-up System
              </h3>
              <p className="text-xs text-stone-500">
                Protect visitor privacy. Information is accessible only by authorized hospitality leaders.
              </p>
            </div>

            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Guest</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visitors.map(v => (
              <div 
                key={v.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                      {v.name}
                    </h4>
                    <span className="text-[10px] text-stone-400">
                      Visited: {v.serviceDate} • {v.isFirstTime ? '1st Time Visitor' : 'Returning'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    v.followUpStatus === 'welcomed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                    v.followUpStatus === 'prayed_for' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}>
                    {v.followUpStatus.replace('_', ' ')}
                  </span>
                </div>

                {isAuthorized ? (
                  <div className="text-xs space-y-1 text-stone-600 dark:text-stone-300">
                    {v.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-stone-400" /> {v.phone}</div>}
                    {v.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-stone-400" /> {v.email}</div>}
                    {v.prayerRequest && (
                      <p className="mt-2 text-[11px] p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 italic">
                        "{v.prayerRequest}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-400 flex items-center gap-1.5 italic">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Contact details restricted to authorized leaders</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LOST & FOUND */}
      {activeSubTab === 'lost_found' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Sanctuary Lost & Found Log
              </h3>
              <p className="text-xs text-stone-500">
                Log items left in the sanctuary and facilitate safe return to church members.
              </p>
            </div>

            <button
              onClick={() => setIsLostFoundModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record Lost Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {lostFound.map(item => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-stone-900 dark:text-white text-sm">
                    {item.item}
                  </div>
                  <div className="text-stone-500 flex items-center gap-3 text-[11px]">
                    <span>Found at: <strong>{item.location}</strong></span>
                    <span>•</span>
                    <span>Date: {item.date}</span>
                    {item.claimedBy && <span>• Claimed by: {item.claimedBy}</span>}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleClaim(item.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                    item.isClaimed 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                  {item.isClaimed ? 'Claimed' : 'Mark Claimed'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRIVATE INCIDENT REPORTS */}
      {activeSubTab === 'incidents' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                Confidential Incident Reports
              </h3>
              <p className="text-xs text-stone-500">
                Restricted to church leaders and ushers for health, security, and facility incidents.
              </p>
            </div>

            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-soft transition"
            >
              <Plus className="w-4 h-4" />
              <span>File Incident Report</span>
            </button>
          </div>

          <div className="space-y-3">
            {incidents.map(inc => (
              <div 
                key={inc.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.severity === 'high' ? 'bg-red-100 text-red-800' :
                      inc.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {inc.severity} priority
                    </span>
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                      {inc.title}
                    </h4>
                  </div>
                  <span className="text-[11px] text-stone-400">{inc.date}</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300">
                  {inc.description}
                </p>
                <div className="pt-2 text-[10px] text-stone-400 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                  <span>Reported by: {inc.reportedBy}</span>
                  <span className={inc.isResolved ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {inc.isResolved ? 'Resolved' : 'Active / Monitoring'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Register Visitor */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">Register Church Guest</h3>
            <form onSubmit={handleCreateVisitor} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newVisitor.name} 
                  onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })} 
                  placeholder="e.g. Ronald De Guzman"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Mobile / Phone (Optional)</label>
                <input 
                  type="text" 
                  value={newVisitor.phone} 
                  onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })} 
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email (Optional)</label>
                <input 
                  type="email" 
                  value={newVisitor.email} 
                  onChange={e => setNewVisitor({ ...newVisitor, email: e.target.value })} 
                  placeholder="guest@example.com"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Prayer Request / Note</label>
                <textarea 
                  value={newVisitor.prayerRequest} 
                  onChange={e => setNewVisitor({ ...newVisitor, prayerRequest: e.target.value })} 
                  placeholder="How can Beholding Jesus Church pray for you?"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsVisitorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Guest Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Lost Item */}
      {isLostFoundModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">Record Lost & Found Item</h3>
            <form onSubmit={handleCreateLostFound} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Item Name & Description</label>
                <input 
                  type="text" 
                  value={newItem.item} 
                  onChange={e => setNewItem({ ...newItem, item: e.target.value })} 
                  placeholder="e.g. Black leather Bible with gold zipper"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Where was it found?</label>
                <input 
                  type="text" 
                  value={newItem.location} 
                  onChange={e => setNewItem({ ...newItem, location: e.target.value })} 
                  placeholder="e.g. Row 4 Center Aisle"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsLostFoundModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Incident Report */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">Confidential Incident Report</h3>
            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Incident Summary</label>
                <input 
                  type="text" 
                  value={newIncident.title} 
                  onChange={e => setNewIncident({ ...newIncident, title: e.target.value })} 
                  placeholder="e.g. Power fluctuation or medical assistance"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Severity</label>
                <select 
                  value={newIncident.severity} 
                  onChange={e => setNewIncident({ ...newIncident, severity: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                >
                  <option value="low" className="bg-slate-900 text-white">Low (Informational)</option>
                  <option value="medium" className="bg-slate-900 text-white">Medium (Caution)</option>
                  <option value="high" className="bg-slate-900 text-white">High (Immediate Attention)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Details & Actions Taken</label>
                <textarea 
                  value={newIncident.description} 
                  onChange={e => setNewIncident({ ...newIncident, description: e.target.value })} 
                  placeholder="Describe what occurred and how it was resolved..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white h-24"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};