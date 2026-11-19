import { supabase } from '../lib/supabase';
import { PushNotificationService } from './pushNotificationService';
import { ChurchDataStore } from './churchDataStore';

export type MinistryId = 'ministry-worship' | 'ministry-usher' | 'ministry-multimedia';

export type MinistryRole = 'leader' | 'assistant_leader' | 'core_member' | 'volunteer';

export interface MinistryItem {
  id: MinistryId;
  name: string;
  slug: string;
  category: string;
  leaderTitle: string;
  leaderName: string;
  assistantLeaderName?: string;
  icon: string;
  color: string;
  description: string;
  meetingTime: string;
  location: string;
  membersCount: number;
  coverImage: string;
  upcomingSchedule: string;
  activities: string[];
}

export interface MinistryMemberItem {
  id: string;
  userId: string;
  name: string;
  role: MinistryRole;
  roleTitle: string;
  avatar: string;
  ministryId: MinistryId;
  joinedDate: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface MinistryTask {
  id: string;
  ministryId: MinistryId;
  title: string;
  description: string;
  assignedTo: string;
  assignedToId: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'normal';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface MinistrySchedule {
  id: string;
  ministryId: MinistryId;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'service' | 'rehearsal' | 'meeting' | 'special_event';
  notes?: string;
  assignedMemberNames?: string[];
}

export interface MinistryAnnouncement {
  id: string;
  ministryId: MinistryId;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  imageUrl?: string;
  acknowledgedUserIds: string[];
}

export interface MinistryResource {
  id: string;
  ministryId: MinistryId;
  title: string;
  category: 'Guidelines' | 'Training' | 'Schedules' | 'Reference' | 'Media';
  fileUrl?: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  size?: string;
}

export interface MinistryAttendanceRecord {
  id: string;
  ministryId: MinistryId;
  date: string;
  eventTitle: string;
  recordedBy: string;
  recordedAt: string;
  attendees: {
    userId: string;
    userName: string;
    status: 'present' | 'absent' | 'excused';
    notes?: string;
  }[];
}

export interface MemberAvailability {
  id: string;
  userId: string;
  userName: string;
  ministryId: MinistryId;
  serviceDate: string;
  status: 'available' | 'tentative' | 'unavailable';
  reason?: string;
  updatedAt: string;
}

export interface UnifiedServicePlan {
  id: string;
  serviceDate: string;
  title: string;
  theme: string;
  serviceLeader: string;
  worship: {
    worshipLeader: string;
    singers: string[];
    instrumentalists: string[];
    setlistIds: string[];
    songsSummary: string[];
    rehearsalStatus: 'Scheduled' | 'Completed' | 'Pending';
    checklist: {
      songsSelected: boolean;
      keysConfirmed: boolean;
      worshipLeaderAssigned: boolean;
      vocalistsAssigned: boolean;
      instrumentalistsAssigned: boolean;
      harmoniesPrepared: boolean;
      rehearsalScheduled: boolean;
      finalSetlistApproved: boolean;
    };
    notes?: string;
  };
  ushering: {
    assignedUshers: string[];
    welcomeTeam: string[];
    seatingLead: string;
    offeringTeam: string[];
    bulletinsReady: boolean;
    checklist: {
      entranceAreaPrepared: boolean;
      seatingAreaOrganized: boolean;
      welcomeTeamAssigned: boolean;
      guestAssistanceReady: boolean;
      serviceMaterialsPrepared: boolean;
      finalCoordinationDone: boolean;
    };
    notes?: string;
  };
  multimedia: {
    soundOperator: string;
    presentationOperator: string;
    cameraOperator: string;
    livestreamOperator: string;
    photographer: string;
    presentationStatus: 'Draft' | 'In Review' | 'Sunday Ready';
    checklist: {
      soundChecked: boolean;
      projectorScreensReady: boolean;
      lyricsVersesSynced: boolean;
      camerasPositioned: boolean;
      livestreamTested: boolean;
      cablesSecured: boolean;
    };
    notes?: string;
  };
}

export interface UsheringVisitorRecord {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  serviceDate: string;
  isFirstTime: boolean;
  prayerRequest?: string;
  followUpStatus: 'new' | 'contacted' | 'welcomed' | 'prayed_for';
  assignedLeader: string;
  notes?: string;
}

export interface UsheringLostFoundItem {
  id: string;
  item: string;
  location: string;
  date: string;
  isClaimed: boolean;
  claimedBy?: string;
}

export interface UsheringIncidentReport {
  id: string;
  date: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  isResolved: boolean;
  reportedBy: string;
}

export interface MultimediaEquipmentItem {
  id: string;
  name: string;
  category: 'Microphones' | 'Speakers' | 'Audio mixer' | 'Projector' | 'Display screens' | 'Computers' | 'Cameras' | 'Livestream equipment' | 'Cables & accessories';
  status: 'ready' | 'needs_attention' | 'unavailable';
  notes?: string;
  lastChecked: string;
}

export interface MultimediaPresentationItem {
  id: string;
  serviceDate: string;
  title: string;
  slidesCount: number;
  lyricsReady: boolean;
  versesReady: boolean;
  status: 'draft' | 'in_review' | 'ready';
  downloadUrl?: string;
}

export interface MediaRequestItem {
  id: string;
  title: string;
  requestType: 'Announcement Graphics' | 'Event Posters' | 'Presentation Slides' | 'Video Editing' | 'Photography' | 'Livestream Support';
  requestedBy: string;
  requestedRole: string;
  dueDate: string;
  status: 'submitted' | 'in_progress' | 'for_review' | 'approved' | 'completed';
  description: string;
  attachmentUrl?: string;
}

const STORAGE_KEYS = {
  MINISTRIES: 'bjc_ministry_defs_v4',
  MEMBERS: 'bjc_ministry_members_v4',
  TASKS: 'bjc_ministry_tasks_v4',
  SCHEDULES: 'bjc_ministry_schedules_v4',
  ANNOUNCEMENTS: 'bjc_ministry_announcements_v4',
  RESOURCES: 'bjc_ministry_resources_v4',
  ATTENDANCE: 'bjc_ministry_attendance_v4',
  AVAILABILITY: 'bjc_ministry_availability_v4',
  SERVICE_PLANS: 'bjc_ministry_service_plans_v4',
  VISITORS: 'bjc_ministry_visitors_v4',
  LOST_FOUND: 'bjc_ministry_lost_found_v4',
  INCIDENTS: 'bjc_ministry_incidents_v4',
  EQUIPMENT: 'bjc_ministry_equipment_v4',
  PRESENTATIONS: 'bjc_ministry_presentations_v4',
  MEDIA_REQUESTS: 'bjc_ministry_media_requests_v4',
};

// Initial Data Seed
const INITIAL_MINISTRY_ITEMS: MinistryItem[] = [
  {
    id: 'ministry-worship',
    name: 'Worship Team',
    slug: 'worship-team',
    category: 'Praise & Music Ministry',
    leaderTitle: 'Worship Director',
    leaderName: 'Worship Leadership',
    assistantLeaderName: 'Music Team',
    icon: 'Music',
    color: '#C5A46D',
    description: 'Responsible for leading congregational worship through music, singing, and musical instruments, beholding the sufficiency of Jesus Christ in every song.',
    meetingTime: 'Saturdays 3:00 PM – 5:30 PM (Vocal & Band Rehearsal)',
    location: 'Main Sanctuary Stage',
    membersCount: 1,
    coverImage: '/images/worship_service_poster.jpg',
    upcomingSchedule: 'Rehearsal: Sat 3:00 PM • Sunday Service: 8:00 AM Call Time',
    activities: [
      'Weekly Band & Vocal Rehearsals',
      'Sunday Corporate Worship Services',
      'Vocal Harmony & Key Pitch Preparation',
      'Special Music & Prayer Nights'
    ]
  },
  {
    id: 'ministry-usher',
    name: 'Ushering Team',
    slug: 'ushering-team',
    category: 'Hospitality & Order',
    leaderTitle: 'Head Usher & Welcome Lead',
    leaderName: 'John Miko Sarsalijo',
    assistantLeaderName: 'Hospitality Team',
    icon: 'Users',
    color: '#059669',
    description: 'Responsible for welcoming visitors, assisting church members, organizing seating, facilitating offerings, and supporting the congregation during all worship services.',
    meetingTime: 'Sundays 8:00 AM (Briefing) • 1st Sat of Month 5:00 PM',
    location: 'Sanctuary Foyer, Doors & Aisles',
    membersCount: 1,
    coverImage: '/images/bjc-family-fellowship.jpg',
    upcomingSchedule: 'Sunday Service Duty: 8:00 AM Call Time (Foyer & Welcome)',
    activities: [
      'Foyer Welcome & Bulletin Distribution',
      'Sanctuary Seating Assistance & Comfort',
      'Visitor Registration & Welcoming Workflow',
      'Tithes & Offering Stewardship & Collection'
    ]
  },
  {
    id: 'ministry-multimedia',
    name: 'Multimedia Team',
    slug: 'multimedia-team',
    category: 'Technical & Production',
    leaderTitle: 'Media & Tech Director',
    leaderName: 'John Miko Sarsalijo',
    assistantLeaderName: 'Technical Production Team',
    icon: 'Monitor',
    color: '#0284c7',
    description: 'Responsible for audio engineering, visual presentations, photography, video recording, livestreaming, and technical production for church services and digital outreach.',
    meetingTime: 'Sundays 7:15 AM (System Calibration & Soundcheck)',
    location: 'Media Booth & Tech Station',
    membersCount: 1,
    coverImage: '/images/theology-class-poster.png',
    upcomingSchedule: 'Sunday Tech Run: 7:15 AM (Sound, Livestream & Slides Test)',
    activities: [
      'Sound Engineering & Acoustic Mixing',
      'Live Video Streaming & Stage Cameras',
      'Lyrics & Scripture Slide Presentation',
      'Worship Photography & Social Media Recaps'
    ]
  }
];

export class MinistryStore {
  private static load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('bjc_ministry_change', { detail: { key } }));
    } catch (e) {
      console.warn('MinistryStore save error:', e);
    }
  }

  // --- MINISTRIES ---
  static getMinistries(): MinistryItem[] {
    return this.load<MinistryItem[]>(STORAGE_KEYS.MINISTRIES, INITIAL_MINISTRY_ITEMS);
  }

  static getMinistryById(id: MinistryId): MinistryItem | undefined {
    return this.getMinistries().find(m => m.id === id);
  }

  // --- MEMBERS ---
  static getMembers(ministryId?: MinistryId): MinistryMemberItem[] {
    const list = this.load<MinistryMemberItem[]>(STORAGE_KEYS.MEMBERS, []);
    return ministryId ? list.filter(m => m.ministryId === ministryId) : list;
  }

  static addMember(member: Omit<MinistryMemberItem, 'id'>): MinistryMemberItem {
    const list = this.getMembers();
    const newMember: MinistryMemberItem = {
      ...member,
      id: `mem-${Date.now()}`
    };
    list.push(newMember);
    this.save(STORAGE_KEYS.MEMBERS, list);

    // Update member count
    const ministries = this.getMinistries();
    const min = ministries.find(m => m.id === member.ministryId);
    if (min) {
      min.membersCount = list.filter(m => m.ministryId === member.ministryId).length;
      this.save(STORAGE_KEYS.MINISTRIES, ministries);
    }
    return newMember;
  }

  static removeMember(memberId: string): void {
    const list = this.getMembers();
    const target = list.find(m => m.id === memberId);
    const updated = list.filter(m => m.id !== memberId);
    this.save(STORAGE_KEYS.MEMBERS, updated);

    if (target) {
      const ministries = this.getMinistries();
      const min = ministries.find(m => m.id === target.ministryId);
      if (min) {
        min.membersCount = updated.filter(m => m.ministryId === target.ministryId).length;
        this.save(STORAGE_KEYS.MINISTRIES, ministries);
      }
    }
  }

  // --- TASKS ---
  static getTasks(ministryId?: MinistryId): MinistryTask[] {
    const list = this.load<MinistryTask[]>(STORAGE_KEYS.TASKS, []);
    return ministryId ? list.filter(t => t.ministryId === ministryId) : list;
  }

  static saveTask(task: Omit<MinistryTask, 'id' | 'createdAt'> & { id?: string }): MinistryTask {
    const list = this.getTasks();
    let saved: MinistryTask;
    if (task.id) {
      const idx = list.findIndex(t => t.id === task.id);
      saved = { ...list[idx], ...task };
      list[idx] = saved;
    } else {
      saved = {
        ...task,
        id: `tsk-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      list.unshift(saved);
    }
    this.save(STORAGE_KEYS.TASKS, list);
    return saved;
  }

  static deleteTask(taskId: string): void {
    const list = this.getTasks().filter(t => t.id !== taskId);
    this.save(STORAGE_KEYS.TASKS, list);
  }

  static toggleTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed'): void {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date().toISOString().split('T')[0];
      } else {
        task.completedAt = undefined;
      }
      this.save(STORAGE_KEYS.TASKS, list);
    }
  }

  // --- SCHEDULES ---
  static getSchedules(ministryId?: MinistryId): MinistrySchedule[] {
    const list = this.load<MinistrySchedule[]>(STORAGE_KEYS.SCHEDULES, []);
    return ministryId ? list.filter(s => s.ministryId === ministryId) : list;
  }

  static saveSchedule(schedule: Omit<MinistrySchedule, 'id'> & { id?: string }): MinistrySchedule {
    const list = this.getSchedules();
    let saved: MinistrySchedule;
    if (schedule.id) {
      const idx = list.findIndex(s => s.id === schedule.id);
      saved = { ...list[idx], ...schedule };
      list[idx] = saved;
    } else {
      saved = {
        ...schedule,
        id: `sch-${Date.now()}`
      };
      list.push(saved);
    }
    this.save(STORAGE_KEYS.SCHEDULES, list);

    // Notify assigned members of schedule update
    try {
      const min = this.getMinistryById(saved.ministryId);
      const minName = min ? min.name : 'Church Ministry';
      const members = this.getMembers(saved.ministryId);
      const targetUserIds = saved.assignedMemberNames && saved.assignedMemberNames.length > 0
        ? members.filter(m => saved.assignedMemberNames?.includes(m.name)).map(m => m.userId)
        : members.map(m => m.userId);

      if (targetUserIds.length > 0) {
        targetUserIds.forEach(uid => {
          ChurchDataStore.addNotification({
            userId: uid,
            type: 'ministry',
            title: `📅 ${minName}: Schedule Update`,
            message: `${saved.title} on ${saved.date} at ${saved.time}`,
            linkRoute: 'ministries'
          });
        });
        PushNotificationService.notifyMinistry(
          targetUserIds,
          minName,
          'Schedule Update: ' + saved.title,
          `${saved.date} (${saved.time}) - ${saved.location || 'Sanctuary'}`,
          saved.ministryId
        );
      }
    } catch {}

    return saved;
  }

  static deleteSchedule(scheduleId: string): void {
    const list = this.getSchedules().filter(s => s.id !== scheduleId);
    this.save(STORAGE_KEYS.SCHEDULES, list);
  }

  // --- ANNOUNCEMENTS ---
  static getAnnouncements(ministryId?: MinistryId): MinistryAnnouncement[] {
    const list = this.load<MinistryAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    return ministryId ? list.filter(a => a.ministryId === ministryId) : list;
  }

  static saveAnnouncement(ann: Omit<MinistryAnnouncement, 'id' | 'createdAt' | 'acknowledgedUserIds'> & { id?: string }): MinistryAnnouncement {
    const list = this.getAnnouncements();
    let saved: MinistryAnnouncement;
    if (ann.id) {
      const idx = list.findIndex(a => a.id === ann.id);
      saved = { ...list[idx], ...ann };
      list[idx] = saved;
    } else {
      saved = {
        ...ann,
        id: `ann-${Date.now()}`,
        createdAt: new Date().toISOString(),
        acknowledgedUserIds: []
      };
      list.unshift(saved);
    }
    this.save(STORAGE_KEYS.ANNOUNCEMENTS, list);

    // Notify ministry members of announcement
    try {
      const min = this.getMinistryById(saved.ministryId);
      const minName = min ? min.name : 'Church Ministry';
      const memberUserIds = this.getMembers(saved.ministryId).map(m => m.userId);

      if (memberUserIds.length > 0) {
        memberUserIds.forEach(uid => {
          ChurchDataStore.addNotification({
            userId: uid,
            type: 'ministry',
            title: `📢 ${minName} Announcement`,
            message: `${saved.title}: ${saved.content.slice(0, 60)}...`,
            linkRoute: 'ministries'
          });
        });
        PushNotificationService.notifyMinistry(
          memberUserIds,
          minName,
          saved.title,
          saved.content,
          saved.ministryId
        );
      }
    } catch {}

    return saved;
  }

  static acknowledgeAnnouncement(annId: string, userId: string): void {
    const list = this.getAnnouncements();
    const ann = list.find(a => a.id === annId);
    if (ann && !ann.acknowledgedUserIds.includes(userId)) {
      ann.acknowledgedUserIds.push(userId);
      this.save(STORAGE_KEYS.ANNOUNCEMENTS, list);
    }
  }

  // --- RESOURCES ---
  static getResources(ministryId?: MinistryId): MinistryResource[] {
    const list = this.load<MinistryResource[]>(STORAGE_KEYS.RESOURCES, []);
    return ministryId ? list.filter(r => r.ministryId === ministryId) : list;
  }

  static saveResource(resource: Omit<MinistryResource, 'id' | 'uploadedAt'> & { id?: string }): MinistryResource {
    const list = this.getResources();
    const saved: MinistryResource = {
      ...resource,
      id: resource.id || `res-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(saved);
    this.save(STORAGE_KEYS.RESOURCES, list);
    return saved;
  }

  static deleteResource(id: string): void {
    const list = this.getResources().filter(r => r.id !== id);
    this.save(STORAGE_KEYS.RESOURCES, list);
  }

  // --- ATTENDANCE ---
  static getAttendance(ministryId?: MinistryId): MinistryAttendanceRecord[] {
    const list = this.load<MinistryAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    return ministryId ? list.filter(a => a.ministryId === ministryId) : list;
  }

  static saveAttendance(record: Omit<MinistryAttendanceRecord, 'id' | 'recordedAt'> & { id?: string }): MinistryAttendanceRecord {
    const list = this.getAttendance();
    const saved: MinistryAttendanceRecord = {
      ...record,
      id: record.id || `att-${Date.now()}`,
      recordedAt: new Date().toISOString()
    };
    list.unshift(saved);
    this.save(STORAGE_KEYS.ATTENDANCE, list);
    return saved;
  }

  // --- MEMBER AVAILABILITY ---
  static getAvailability(ministryId?: MinistryId, serviceDate?: string): MemberAvailability[] {
    const list = this.load<MemberAvailability[]>(STORAGE_KEYS.AVAILABILITY, []);

    return list.filter(item => {
      if (ministryId && item.ministryId !== ministryId) return false;
      if (serviceDate && item.serviceDate !== serviceDate) return false;
      return true;
    });
  }

  static updateAvailability(
    userId: string, 
    userName: string, 
    ministryId: MinistryId, 
    serviceDate: string, 
    status: 'available' | 'tentative' | 'unavailable', 
    reason?: string
  ): MemberAvailability {
    const list = this.getAvailability();
    const existingIndex = list.findIndex(a => a.userId === userId && a.ministryId === ministryId && a.serviceDate === serviceDate);
    const now = new Date().toISOString().split('T')[0];

    let result: MemberAvailability;
    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        status,
        reason: reason || undefined,
        updatedAt: now
      };
      result = list[existingIndex];
    } else {
      result = {
        id: `av-${Date.now()}`,
        userId,
        userName,
        ministryId,
        serviceDate,
        status,
        reason: reason || undefined,
        updatedAt: now
      };
      list.push(result);
    }

    this.save(STORAGE_KEYS.AVAILABILITY, list);
    return result;
  }

  // --- CONVENIENCE ALIASES FOR WORKSPACE VIEWS ---
  static getMembersByMinistry(ministryId: MinistryId): MinistryMemberItem[] {
    return this.getMembers(ministryId);
  }

  static getTasksByMinistry(ministryId: MinistryId): MinistryTask[] {
    return this.getTasks(ministryId);
  }

  static getSchedulesByMinistry(ministryId: MinistryId): MinistrySchedule[] {
    return this.getSchedules(ministryId);
  }

  static getAnnouncementsByMinistry(ministryId: MinistryId): MinistryAnnouncement[] {
    return this.getAnnouncements(ministryId);
  }

  static getResourcesByMinistry(ministryId: MinistryId): MinistryResource[] {
    return this.getResources(ministryId);
  }

  static getAttendanceByMinistry(ministryId: MinistryId): MinistryAttendanceRecord[] {
    return this.getAttendance(ministryId);
  }

  static getAvailabilityByMinistry(ministryId: MinistryId, serviceDate?: string): MemberAvailability[] {
    return this.getAvailability(ministryId, serviceDate);
  }

  static updateTaskStatus(taskId: string, status: MinistryTask['status']): void {
    this.toggleTaskStatus(taskId, status);
  }

  static setAvailability(params: {
    userId: string;
    userName: string;
    ministryId: MinistryId;
    serviceDate: string;
    status: MemberAvailability['status'];
    reason?: string;
  }): MemberAvailability {
    return this.updateAvailability(
      params.userId,
      params.userName,
      params.ministryId,
      params.serviceDate,
      params.status,
      params.reason
    );
  }

  // --- UNIFIED SUNDAY SERVICE PLANNER ---
  static getServicePlans(): UnifiedServicePlan[] {
    return this.load<UnifiedServicePlan[]>(STORAGE_KEYS.SERVICE_PLANS, []);
  }

  static getServicePlanByDate(date: string): UnifiedServicePlan {
    const plans = this.getServicePlans();
    const found = plans.find(p => p.serviceDate === date);
    if (found) return found;

    // Create blank plan for that Sunday
    const newPlan: UnifiedServicePlan = {
      id: `plan-${date}`,
      serviceDate: date,
      title: 'Sunday Worship Service',
      theme: 'Beholding Jesus Corporate Service',
      serviceLeader: 'Pastoral Team',
      worship: {
        worshipLeader: 'Unassigned',
        singers: [],
        instrumentalists: [],
        setlistIds: [],
        songsSummary: [],
        rehearsalStatus: 'Pending',
        checklist: {
          songsSelected: false,
          keysConfirmed: false,
          worshipLeaderAssigned: false,
          vocalistsAssigned: false,
          instrumentalistsAssigned: false,
          harmoniesPrepared: false,
          rehearsalScheduled: false,
          finalSetlistApproved: false
        }
      },
      ushering: {
        assignedUshers: [],
        welcomeTeam: [],
        seatingLead: 'Unassigned',
        offeringTeam: [],
        bulletinsReady: false,
        checklist: {
          entranceAreaPrepared: false,
          seatingAreaOrganized: false,
          welcomeTeamAssigned: false,
          guestAssistanceReady: false,
          serviceMaterialsPrepared: false,
          finalCoordinationDone: false
        }
      },
      multimedia: {
        soundOperator: 'Unassigned',
        presentationOperator: 'Unassigned',
        cameraOperator: 'Unassigned',
        livestreamOperator: 'Unassigned',
        photographer: 'Unassigned',
        presentationStatus: 'Draft',
        checklist: {
          soundChecked: false,
          projectorScreensReady: false,
          lyricsVersesSynced: false,
          camerasPositioned: false,
          livestreamTested: false,
          cablesSecured: false
        }
      }
    };
    plans.push(newPlan);
    this.save(STORAGE_KEYS.SERVICE_PLANS, plans);
    return newPlan;
  }

  static saveServicePlan(plan: UnifiedServicePlan): void {
    const list = this.getServicePlans();
    const idx = list.findIndex(p => p.serviceDate === plan.serviceDate);
    if (idx >= 0) {
      list[idx] = plan;
    } else {
      list.push(plan);
    }
    this.save(STORAGE_KEYS.SERVICE_PLANS, list);
  }

  static updateWorshipPrep(date: string, updates: Partial<UnifiedServicePlan['worship']>): void {
    const plan = this.getServicePlanByDate(date);
    plan.worship = {
      ...plan.worship,
      ...updates,
      checklist: {
        ...plan.worship.checklist,
        ...(updates.checklist || {})
      }
    };
    this.saveServicePlan(plan);
  }

  static updateUsheringPrep(date: string, updates: Partial<UnifiedServicePlan['ushering']>): void {
    const plan = this.getServicePlanByDate(date);
    plan.ushering = {
      ...plan.ushering,
      ...updates,
      checklist: {
        ...plan.ushering.checklist,
        ...(updates.checklist || {})
      }
    };
    this.saveServicePlan(plan);
  }

  static updateMultimediaPrep(date: string, updates: Partial<UnifiedServicePlan['multimedia']>): void {
    const plan = this.getServicePlanByDate(date);
    plan.multimedia = {
      ...plan.multimedia,
      ...updates,
      checklist: {
        ...plan.multimedia.checklist,
        ...(updates.checklist || {})
      }
    };
    this.saveServicePlan(plan);
  }

  // --- USHERING: VISITORS ---
  static getVisitors(): UsheringVisitorRecord[] {
    return this.load<UsheringVisitorRecord[]>(STORAGE_KEYS.VISITORS, []);
  }

  static saveVisitor(visitor: Omit<UsheringVisitorRecord, 'id'> & { id?: string }): UsheringVisitorRecord {
    const list = this.getVisitors();
    const saved: UsheringVisitorRecord = {
      ...visitor,
      id: visitor.id || `vis-${Date.now()}`
    };
    list.unshift(saved);
    this.save(STORAGE_KEYS.VISITORS, list);
    return saved;
  }

  static updateVisitorStatus(visitorId: string, status: UsheringVisitorRecord['followUpStatus'], notes?: string): void {
    const list = this.getVisitors();
    const vis = list.find(v => v.id === visitorId);
    if (vis) {
      vis.followUpStatus = status;
      if (notes) vis.notes = notes;
      this.save(STORAGE_KEYS.VISITORS, list);
    }
  }

  // --- USHERING: LOST & FOUND ---
  static getLostFound(): UsheringLostFoundItem[] {
    return this.load<UsheringLostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, []);
  }

  static saveLostFound(item: Omit<UsheringLostFoundItem, 'id'> & { id?: string }): UsheringLostFoundItem {
    const list = this.getLostFound();
    const saved: UsheringLostFoundItem = {
      ...item,
      id: item.id || `lf-${Date.now()}`
    };
    list.unshift(saved);
    this.save(STORAGE_KEYS.LOST_FOUND, list);
    return saved;
  }

  static toggleLostFoundClaim(id: string, claimedBy?: string): void {
    const list = this.getLostFound();
    const item = list.find(i => i.id === id);
    if (item) {
      item.isClaimed = !item.isClaimed;
      item.claimedBy = item.isClaimed ? (claimedBy || 'Claimed by owner') : undefined;
      this.save(STORAGE_KEYS.LOST_FOUND, list);
    }
  }

  // --- USHERING: INCIDENT REPORTS ---
  static getIncidents(): UsheringIncidentReport[] {
    return this.load<UsheringIncidentReport[]>(STORAGE_KEYS.INCIDENTS, []);
  }

  static saveIncident(report: Omit<UsheringIncidentReport, 'id'> & { id?: string }): UsheringIncidentReport {
    const list = this.getIncidents();
    const saved: UsheringIncidentReport = {
      ...report,
      id: report.id || `inc-${Date.now()}`
    };
    list.unshift(saved);
    this.save(STORAGE_KEYS.INCIDENTS, list);
    return saved;
  }

  // --- MULTIMEDIA: EQUIPMENT CHECKLIST ---
  static getEquipment(): MultimediaEquipmentItem[] {
    return this.load<MultimediaEquipmentItem[]>(STORAGE_KEYS.EQUIPMENT, [
      { id: 'eq-1', name: 'Wireless Handheld Mics (4 units)', category: 'Microphones', status: 'ready', notes: 'Batteries fully charged', lastChecked: '2026-11-05' },
      { id: 'eq-2', name: 'Sanctuary Main PA & Stage Monitors', category: 'Speakers', status: 'ready', notes: 'Tested with acoustic guitar', lastChecked: '2026-11-05' },
      { id: 'eq-3', name: '32-Channel Digital Mixer (Behringer X32)', category: 'Audio mixer', status: 'ready', notes: 'Scene presets saved for Sunday', lastChecked: '2026-11-05' },
      { id: 'eq-4', name: 'Center Stage High-Lumen Projector', category: 'Projector', status: 'ready', notes: 'Lens cleaned, bulb hours ok', lastChecked: '2026-11-04' },
      { id: 'eq-5', name: 'Stage Confidence & Foyer Displays', category: 'Display screens', status: 'ready', notes: 'HDMI splitters operating normally', lastChecked: '2026-11-04' },
      { id: 'eq-6', name: 'Main Presentation & Livestream PCs', category: 'Computers', status: 'ready', notes: 'Software updated, restart complete', lastChecked: '2026-11-05' },
      { id: 'eq-7', name: 'Center & Side 4K PTZ Cameras', category: 'Cameras', status: 'ready', notes: 'Presets 1-4 aligned to stage', lastChecked: '2026-11-05' },
      { id: 'eq-8', name: 'OBS & ATEM Mini Livestream Switcher', category: 'Livestream equipment', status: 'ready', notes: 'Stream health tested at 6000kbps', lastChecked: '2026-11-05' },
      { id: 'eq-9', name: 'Stage DI Boxes & XLR Snake Cables', category: 'Cables & accessories', status: 'needs_attention', notes: 'XLR Cable #4 has loose collar; marked for repair', lastChecked: '2026-11-05' }
    ]);
  }

  static updateEquipmentStatus(id: string, status: MultimediaEquipmentItem['status'], notes?: string): void {
    const list = this.getEquipment();
    const item = list.find(e => e.id === id);
    if (item) {
      item.status = status;
      if (notes !== undefined) item.notes = notes;
      item.lastChecked = new Date().toISOString().split('T')[0];
      this.save(STORAGE_KEYS.EQUIPMENT, list);
    }
  }

  // --- MULTIMEDIA: PRESENTATION MANAGER ---
  static getPresentations(): MultimediaPresentationItem[] {
    return this.load<MultimediaPresentationItem[]>(STORAGE_KEYS.PRESENTATIONS, []);
  }

  static savePresentation(item: Omit<MultimediaPresentationItem, 'id'> & { id?: string }): MultimediaPresentationItem {
    const list = this.getPresentations();
    let saved: MultimediaPresentationItem;
    if (item.id) {
      const idx = list.findIndex(p => p.id === item.id);
      saved = { ...list[idx], ...item };
      list[idx] = saved;
    } else {
      saved = { ...item, id: `pres-${Date.now()}` };
      list.unshift(saved);
    }
    this.save(STORAGE_KEYS.PRESENTATIONS, list);
    return saved;
  }

  // --- MULTIMEDIA: MEDIA REQUESTS ---
  static getMediaRequests(): MediaRequestItem[] {
    return this.load<MediaRequestItem[]>(STORAGE_KEYS.MEDIA_REQUESTS, []);
  }

  static saveMediaRequest(req: Omit<MediaRequestItem, 'id'> & { id?: string }): MediaRequestItem {
    const list = this.getMediaRequests();
    let saved: MediaRequestItem;
    if (req.id) {
      const idx = list.findIndex(r => r.id === req.id);
      saved = { ...list[idx], ...req };
      list[idx] = saved;
    } else {
      saved = { ...req, id: `mreq-${Date.now()}` };
      list.unshift(saved);
    }
    this.save(STORAGE_KEYS.MEDIA_REQUESTS, list);
    return saved;
  }

  static updateMediaRequestStatus(id: string, status: MediaRequestItem['status']): void {
    const list = this.getMediaRequests();
    const req = list.find(r => r.id === id);
    if (req) {
      req.status = status;
      this.save(STORAGE_KEYS.MEDIA_REQUESTS, list);
    }
  }
}
