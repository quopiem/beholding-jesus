import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckSquare, Megaphone, FolderGit2, 
  Clock, ShieldCheck, Heart, UserPlus, Trash2, Plus, 
  CheckCircle2, Circle, AlertCircle, ArrowLeft, ExternalLink,
  FileText, Download, Check, X, Shield, Sparkles, MapPin
} from 'lucide-react';
import { 
  MinistryStore, MinistryItem, MinistryMemberItem, MinistryTask, 
  MinistrySchedule, MinistryAnnouncement, MinistryResource, 
  MinistryAttendanceRecord, MemberAvailability, MinistryId 
} from '../../services/ministryStore';
import { UserProfile } from '../../types';
import { WorshipTeamWorkspace } from './WorshipTeamWorkspace';
import { UsheringTeamWorkspace } from './UsheringTeamWorkspace';
import { MultimediaTeamWorkspace } from './MultimediaTeamWorkspace';

interface SharedWorkspaceLayoutProps {
  ministry: MinistryItem;
  currentUser?: UserProfile | null;
  onBack: () => void;
  onOpenWorshipHub?: () => void;
}

export const SharedWorkspaceLayout: React.FC<SharedWorkspaceLayoutProps> = ({
  ministry,
  currentUser,
  onBack,
  onOpenWorshipHub
}) => {
  const [activeTab, setActiveTab] = useState<
    'operations' | 'overview' | 'members' | 'schedules' | 'tasks' | 'announcements' | 'resources' | 'attendance' | 'availability'
  >('operations');

  // Shared store states for this ministry
  const [members, setMembers] = useState<MinistryMemberItem[]>(() => 
    MinistryStore.getMembersByMinistry(ministry.id)
  );
  const [tasks, setTasks] = useState<MinistryTask[]>(() => 
    MinistryStore.getTasksByMinistry(ministry.id)
  );
  const [schedules, setSchedules] = useState<MinistrySchedule[]>(() => 
    MinistryStore.getSchedulesByMinistry(ministry.id)
  );
  const [announcements, setAnnouncements] = useState<MinistryAnnouncement[]>(() => 
    MinistryStore.getAnnouncementsByMinistry(ministry.id)
  );
  const [resources, setResources] = useState<MinistryResource[]>(() => 
    MinistryStore.getResourcesByMinistry(ministry.id)
  );
  const [attendance, setAttendance] = useState<MinistryAttendanceRecord[]>(() => 
    MinistryStore.getAttendanceByMinistry(ministry.id)
  );
  const [availability, setAvailability] = useState<MemberAvailability[]>(() => 
    MinistryStore.getAvailabilityByMinistry(ministry.id)
  );

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: members[0]?.name || 'Ministry Member',
    assignedToId: members[0]?.userId || 'user-1',
    dueDate: '2026-11-08',
    priority: 'medium' as MinistryTask['priority']
  });

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: ''
  });

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'volunteer' as MinistryMemberItem['role'],
    roleTitle: 'Volunteer',
    email: '',
    phone: ''
  });

  // Current user role & permissions
  const userRole = currentUser?.role || 'member';
  const isSuperOrAdmin = ['super_admin', 'church_admin', 'pastor'].includes(userRole);
  const isLeader = isSuperOrAdmin || members.some(m => m.userId === currentUser?.id && (m.role === 'leader' || m.role === 'assistant_leader'));
  const isCurrentMember = members.some(m => m.userId === currentUser?.id);

  // Current user's own availability
  const currentSunday = '2026-11-08';
  const myAvailability = availability.find(
    a => a.userId === currentUser?.id && a.serviceDate === currentSunday
  );

  const handleSetAvailability = (status: MemberAvailability['status'], reason?: string) => {
    if (!currentUser) return;
    MinistryStore.setAvailability({
      userId: currentUser.id,
      userName: currentUser.name,
      ministryId: ministry.id,
      serviceDate: currentSunday,
      status,
      reason
    });
    setAvailability(MinistryStore.getAvailabilityByMinistry(ministry.id));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    MinistryStore.saveTask({
      ...newTask,
      ministryId: ministry.id,
      status: 'pending'
    });
    setTasks(MinistryStore.getTasksByMinistry(ministry.id));
    setIsTaskModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: members[0]?.name || 'Ministry Member',
      assignedToId: members[0]?.userId || 'user-1',
      dueDate: '2026-11-08',
      priority: 'medium'
    });
  };

  const handleToggleTaskStatus = (id: string, currentStatus: MinistryTask['status']) => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    MinistryStore.updateTaskStatus(id, nextStatus);
    setTasks(MinistryStore.getTasksByMinistry(ministry.id));
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim()) return;
    MinistryStore.saveAnnouncement({
      ...newAnnouncement,
      ministryId: ministry.id,
      authorName: currentUser?.name || ministry.leaderName,
      authorRole: isLeader ? 'Ministry Leader' : 'Team Member'
    });
    setAnnouncements(MinistryStore.getAnnouncementsByMinistry(ministry.id));
    setIsAnnouncementModalOpen(false);
    setNewAnnouncement({ title: '', content: '' });
  };

  const handleAcknowledge = (id: string) => {
    if (!currentUser) return;
    MinistryStore.acknowledgeAnnouncement(id, currentUser.id);
    setAnnouncements(MinistryStore.getAnnouncementsByMinistry(ministry.id));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    MinistryStore.addMember({
      ...newMember,
      userId: `user-${Date.now()}`,
      ministryId: ministry.id,
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`
    });
    setMembers(MinistryStore.getMembersByMinistry(ministry.id));
    setIsAddMemberModalOpen(false);
    setNewMember({
      name: '',
      role: 'volunteer',
      roleTitle: 'Volunteer',
      email: '',
      phone: ''
    });
  };

  const handleRemoveMember = (id: string) => {
    if (confirm('Are you sure you want to remove this member from the ministry?')) {
      MinistryStore.removeMember(id);
      setMembers(MinistryStore.getMembersByMinistry(ministry.id));
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:border-gold transition shadow-soft cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Ministries</span>
        </button>

        <div className="flex items-center gap-2">
          {isCurrentMember ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>You are an Active Member</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-semibold text-xs">
              Guest / Visitor View
            </span>
          )}

          {isLeader && (
            <span className="px-3 py-1.5 rounded-xl bg-gold/20 text-gold-700 dark:text-gold-300 font-bold text-xs border border-gold/40 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span>Leader Access</span>
            </span>
          )}
        </div>
      </div>

      {/* Ministry Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#12141D] via-[#1B1E2B] to-[#12141D] text-white p-6 sm:p-8 border border-white/10 shadow-elevated relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold text-xs font-bold uppercase tracking-wider">
              <span>{ministry.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {ministry.name} Workspace
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {ministry.description}
            </p>

            {/* Quick Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-1">
              <div>
                Leader: <strong className="text-white">{ministry.leaderName}</strong>
              </div>
              {ministry.assistantLeaderName && (
                <div>
                  Assistant: <strong className="text-white">{ministry.assistantLeaderName}</strong>
                </div>
              )}
              <div>
                Active Members: <strong className="text-gold">{members.length}</strong>
              </div>
              <div>
                Meeting: <strong className="text-stone-200">{ministry.meetingTime}</strong>
              </div>
            </div>
          </div>

          {/* Availability Prompt for Current User */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 w-full md:w-auto shrink-0 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-300 flex items-center justify-between gap-4">
              <span>Your Sunday Availability</span>
              <span className="text-gold font-bold">{currentSunday}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSetAvailability('available')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  myAvailability?.status === 'available'
                    ? 'bg-emerald-500 text-white shadow-soft'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Available</span>
              </button>

              <button
                onClick={() => handleSetAvailability('tentative')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  myAvailability?.status === 'tentative'
                    ? 'bg-amber-500 text-white shadow-soft'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                <span>Tentative</span>
              </button>

              <button
                onClick={() => {
                  const reason = prompt('Reason for unavailability (optional):') || 'Personal schedule';
                  handleSetAvailability('unavailable', reason);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  myAvailability?.status === 'unavailable'
                    ? 'bg-red-500 text-white shadow-soft'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Unavailable</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-400">
              *Leaders will never assign anyone marked unavailable.
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('operations')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'operations'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Team Operations</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'members'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'schedules'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedules ({schedules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Tasks ({tasks.filter(t => t.status !== 'completed').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'resources'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Resources ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'availability'
              ? 'bg-[#12141D] dark:bg-stone-800 text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Availability Matrix</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB CONTENT                                               */}
      {/* ========================================================= */}

      {/* 1. OPERATIONS (TEAM-SPECIFIC MODULE) */}
      {activeTab === 'operations' && (
        <div>
          {ministry.id === 'ministry-worship' && (
            <WorshipTeamWorkspace 
              currentUser={currentUser} 
              onOpenFullWorshipHub={onOpenWorshipHub || (() => {})} 
            />
          )}

          {ministry.id === 'ministry-usher' && (
            <UsheringTeamWorkspace 
              currentUser={currentUser} 
            />
          )}

          {ministry.id === 'ministry-multimedia' && (
            <MultimediaTeamWorkspace 
              currentUser={currentUser} 
            />
          )}
        </div>
      )}

      {/* 2. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-stone-900 dark:text-white text-base">
                Ministry Mission & Responsibilities
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {ministry.description}
              </p>

              <div className="pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-2">
                  Key Ministry Activities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ministry.activities.map((act, i) => (
                    <div key={i} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Schedules in Overview */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-stone-900 dark:text-white text-base">
                Upcoming Ministry Dates & Call Times
              </h3>
              <div className="space-y-2">
                {schedules.slice(0, 3).map(s => (
                  <div key={s.id} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-stone-900 dark:text-white">{s.title}</h5>
                      <span className="text-[11px] text-stone-500">{s.date} at {s.time} • {s.location}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 font-semibold uppercase text-[10px]">
                      {s.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Overview Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                Leadership Roster
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 text-gold-700 dark:text-gold-300 font-bold flex items-center justify-center">
                    {ministry.leaderName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gold block">
                      {ministry.leaderTitle}
                    </span>
                    <h5 className="font-bold text-stone-900 dark:text-white">{ministry.leaderName}</h5>
                  </div>
                </div>

                {ministry.assistantLeaderName && (
                  <div className="flex items-center gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold flex items-center justify-center">
                      {ministry.assistantLeaderName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">
                        Assistant Leader
                      </span>
                      <h5 className="font-bold text-stone-900 dark:text-white">{ministry.assistantLeaderName}</h5>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-3">
              <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                Ministry Vital Stats
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                  <span className="text-2xl font-black text-stone-900 dark:text-white">{members.length}</span>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mt-0.5">Members</span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50">
                  <span className="text-2xl font-black text-amber-600">{tasks.filter(t => t.status === 'completed').length}</span>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mt-0.5">Tasks Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                Ministry Member Directory ({members.length})
              </h3>
              <p className="text-xs text-stone-500">
                Authorized leaders may add, assign roles, or remove members.
              </p>
            </div>

            {isLeader && (
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-primary text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-soft transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member to Ministry</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(m => (
              <div 
                key={m.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex items-start justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={m.avatar} 
                    alt={m.name} 
                    className="w-11 h-11 rounded-full object-cover border border-stone-200 dark:border-stone-700 shrink-0" 
                  />
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                      {m.name}
                    </h4>
                    <span className="text-[11px] text-stone-500 block">
                      {m.roleTitle}
                    </span>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                      m.role === 'leader' ? 'bg-gold/20 text-gold-700 dark:text-gold-300' :
                      m.role === 'assistant_leader' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}>
                      {m.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {isLeader && m.role !== 'leader' && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    title="Remove member"
                    className="p-1.5 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              Monthly & Weekly Ministry Schedules
            </h3>
            <p className="text-xs text-stone-500">
              Service rosters, rehearsals, and ministry meetings.
            </p>
          </div>

          <div className="space-y-3">
            {schedules.map(sch => (
              <div 
                key={sch.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white text-sm">
                      {sch.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-200 dark:bg-stone-700">
                      {sch.type}
                    </span>
                  </div>
                  <div className="text-stone-500 flex items-center gap-3 text-[11px]">
                    <span>Date: <strong>{sch.date}</strong></span>
                    <span>•</span>
                    <span>Time: {sch.time}</span>
                    <span>•</span>
                    <span>Location: {sch.location}</span>
                  </div>
                  {sch.assignedMemberNames && sch.assignedMemberNames.length > 0 && (
                    <div className="text-[11px] text-stone-600 dark:text-stone-300 pt-1">
                      Assigned: {sch.assignedMemberNames.join(', ')}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                    Confirmed Schedule
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-gold" />
                Ministry Task Management
              </h3>
              <p className="text-xs text-stone-500">
                Track assigned responsibilities, deadlines, and completion statuses.
              </p>
            </div>

            {isLeader && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-primary text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-soft transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Task</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {tasks.map(t => (
              <div 
                key={t.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleTaskStatus(t.id, t.status)}
                      className="cursor-pointer"
                    >
                      {t.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-400 shrink-0" />
                      )}
                    </button>
                    <span className={`font-bold text-sm ${t.status === 'completed' ? 'line-through text-stone-400' : 'text-stone-900 dark:text-white'}`}>
                      {t.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' :
                      t.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 pl-7">
                    {t.description}
                  </p>
                  <div className="text-stone-400 flex items-center gap-3 text-[11px] pl-7 pt-1">
                    <span>Assigned to: <strong>{t.assignedTo}</strong></span>
                    <span>•</span>
                    <span>Due: {t.dueDate}</span>
                    <span>•</span>
                    <span className="capitalize">{t.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="pl-7 sm:pl-0">
                  <button
                    onClick={() => handleToggleTaskStatus(t.id, t.status)}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 transition"
                  >
                    {t.status === 'completed' ? 'Reopen' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-gold" />
                Ministry Announcements & Notices
              </h3>
              <p className="text-xs text-stone-500">
                Official announcements published by ministry leadership.
              </p>
            </div>

            {isLeader && (
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-primary text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-soft transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post Announcement</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {announcements.map(ann => {
              const isAcknowledged = currentUser && ann.acknowledgedUserIds.includes(currentUser.id);
              return (
                <div 
                  key={ann.id}
                  className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-base">
                        {ann.title}
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        Posted by <strong>{ann.authorName}</strong> ({ann.authorRole}) • {ann.createdAt}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAcknowledge(ann.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isAcknowledged 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400">
                    Acknowledged by {ann.acknowledgedUserIds.length} team members
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. RESOURCES */}
      {activeTab === 'resources' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-gold" />
              Ministry Resources, Manuals & Files
            </h3>
            <p className="text-xs text-stone-500">
              Access training materials, schedules, guidelines, and reference files.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(res => (
              <div 
                key={res.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-200 dark:bg-stone-700">
                    {res.category}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                    {res.title}
                  </h4>
                  <span className="text-[11px] text-stone-400">
                    {res.fileType} • {res.size || '1.2 MB'}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-stone-400">By {res.uploadedBy}</span>
                  <a
                    href={res.fileUrl || '#'}
                    download
                    className="inline-flex items-center gap-1 font-bold text-gold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" />
              Attendance Records & Activity History
            </h3>
            <p className="text-xs text-stone-500">
              Attendance tracking for rehearsals, meetings, and Sunday call times.
            </p>
          </div>

          <div className="space-y-4">
            {attendance.map(att => (
              <div 
                key={att.id}
                className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-base">
                      {att.eventTitle}
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      Date: <strong>{att.date}</strong> • Recorded by {att.recordedBy}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                    {att.attendees.filter(a => a.status === 'present').length} / {att.attendees.length} Present
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {att.attendees.map(a => (
                    <div key={a.userId} className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700 text-xs flex items-center justify-between">
                      <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">{a.userName}</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        a.status === 'present' ? 'text-emerald-600' :
                        a.status === 'excused' ? 'text-amber-600' :
                        'text-red-500'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. AVAILABILITY MATRIX */}
      {activeTab === 'availability' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="pb-4 border-b border-stone-100 dark:border-stone-800">
            <h3 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold" />
              Member Availability Matrix (Upcoming Sundays)
            </h3>
            <p className="text-xs text-stone-500">
              Leaders review member availability prior to finalizing duty rosters. Members who mark themselves unavailable will never be scheduled.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availability.map(av => (
              <div 
                key={av.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                    {av.userName}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    av.status === 'available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                    av.status === 'tentative' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                    'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}>
                    {av.status}
                  </span>
                </div>
                <div className="text-stone-500 text-[11px]">
                  Service Sunday: <strong>{av.serviceDate}</strong>
                </div>
                {av.reason && (
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 italic">
                    Reason: {av.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">Create Ministry Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={newTask.title} 
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
                  placeholder="e.g. Prepare acoustic chord sheets"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Assign to Member</label>
                <select
                  value={newTask.assignedTo}
                  onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.name} className="bg-slate-900 text-white">{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  >
                    <option value="normal" className="bg-slate-900 text-white">Normal</option>
                    <option value="medium" className="bg-slate-900 text-white">Medium</option>
                    <option value="high" className="bg-slate-900 text-white">High</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} 
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold block mb-1">Description / Notes</label>
                <textarea 
                  value={newTask.description} 
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })} 
                  placeholder="Details for the assignee..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post Announcement */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">Post Ministry Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Announcement Title</label>
                <input 
                  type="text" 
                  value={newAnnouncement.title} 
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} 
                  placeholder="e.g. Schedule Change for Rehearsal"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Message Content</label>
                <textarea 
                  value={newAnnouncement.content} 
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} 
                  placeholder="Type your message to ministry members..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white h-28"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Member */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white">Add Member to Ministry</h3>
            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newMember.name} 
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })} 
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Role Level</label>
                  <select
                    value={newMember.role}
                    onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  >
                    <option value="volunteer" className="bg-slate-900 text-white">Volunteer</option>
                    <option value="core_member" className="bg-slate-900 text-white">Core Member</option>
                    <option value="assistant_leader" className="bg-slate-900 text-white">Assistant Leader</option>
                    <option value="leader" className="bg-slate-900 text-white">Ministry Leader</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Role Title</label>
                  <input 
                    type="text" 
                    value={newMember.roleTitle} 
                    onChange={e => setNewMember({ ...newMember, roleTitle: e.target.value })} 
                    placeholder="e.g. Tenor Vocalist"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};