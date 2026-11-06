import { supabase } from '../lib/supabase';

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
  MINISTRIES: 'bjc_ministry_defs_v2',
  MEMBERS: 'bjc_ministry_members_v2',
  TASKS: 'bjc_ministry_tasks_v2',
  SCHEDULES: 'bjc_ministry_schedules_v2',
  ANNOUNCEMENTS: 'bjc_ministry_announcements_v2',
  RESOURCES: 'bjc_ministry_resources_v2',
  ATTENDANCE: 'bjc_ministry_attendance_v2',
  AVAILABILITY: 'bjc_ministry_availability_v2',
  SERVICE_PLANS: 'bjc_ministry_service_plans_v2',
  VISITORS: 'bjc_ministry_visitors_v2',
  LOST_FOUND: 'bjc_ministry_lost_found_v2',
  INCIDENTS: 'bjc_ministry_incidents_v2',
  EQUIPMENT: 'bjc_ministry_equipment_v2',
  PRESENTATIONS: 'bjc_ministry_presentations_v2',
  MEDIA_REQUESTS: 'bjc_ministry_media_requests_v2',
};

// Initial Data Seed
const INITIAL_MINISTRY_ITEMS: MinistryItem[] = [
  {
    id: 'ministry-worship',
    name: 'Worship Team',
    slug: 'worship-team',
    category: 'Praise & Music Ministry',
    leaderTitle: 'Worship Director',
    leaderName: 'Mica Ramos',
    assistantLeaderName: 'Pastor John Eric Manjares',
    icon: 'Music',
    color: '#C5A46D',
    description: 'Responsible for leading congregational worship through music, singing, and musical instruments, beholding the sufficiency of Jesus Christ in every song.',
    meetingTime: 'Saturdays 3:00 PM – 5:30 PM (Vocal & Band Rehearsal)',
    location: 'Main Sanctuary Stage',
    membersCount: 9,
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
    assistantLeaderName: 'Kennedy Lopez',
    icon: 'Users',
    color: '#059669',
    description: 'Responsible for welcoming visitors, assisting church members, organizing seating, facilitating offerings, and supporting the congregation during all worship services.',
    meetingTime: 'Sundays 8:00 AM (Briefing) • 1st Sat of Month 5:00 PM',
    location: 'Sanctuary Foyer, Doors & Aisles',
    membersCount: 8,
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
    leaderName: 'Tech Lead / Production Team',
    assistantLeaderName: 'Bro. Joshua Tan',
    icon: 'Monitor',
    color: '#0284c7',
    description: 'Responsible for audio engineering, visual presentations, photography, video recording, livestreaming, and technical production for church services and digital outreach.',
    meetingTime: 'Sundays 7:15 AM (System Calibration & Soundcheck)',
    location: 'Media Booth & Tech Station',
    membersCount: 7,
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
    const list = this.load<MinistryMemberItem[]>(STORAGE_KEYS.MEMBERS, [
      // Worship Team
      { id: 'mem-w-1', userId: 'usr-mica-01', name: 'Mica Ramos', role: 'leader', roleTitle: 'Worship Director & Lead Vocal', avatar: '/icons/church-logo.png', ministryId: 'ministry-worship', joinedDate: '2023-02-01', phone: '+63 917 123 4567' },
      { id: 'mem-w-2', userId: 'usr-pastor-john-eric', name: 'Pastor John Eric Manjares', role: 'assistant_leader', roleTitle: 'Pastoral Advisor & Acoustic', avatar: '/images/pastor-john-eric-manjares.png', ministryId: 'ministry-worship', joinedDate: '2023-01-01' },
      { id: 'mem-w-3', userId: 'usr-owner-001', name: 'John Miko Sarsalijo', role: 'core_member', roleTitle: 'Keyboard & Bass Support', avatar: '/images/avatar-john-miko.png', ministryId: 'ministry-worship', joinedDate: '2024-01-15' },
      { id: 'mem-w-4', userId: 'usr-sarah-g', name: 'Sarah Gomez', role: 'core_member', roleTitle: 'Alto Vocalist', avatar: '/icons/church-logo.png', ministryId: 'ministry-worship', joinedDate: '2024-05-10' },
      { id: 'mem-w-5', userId: 'usr-david-c', name: 'David Cruz', role: 'core_member', roleTitle: 'Drummer', avatar: '/icons/church-logo.png', ministryId: 'ministry-worship', joinedDate: '2024-03-20' },
      { id: 'mem-w-6', userId: 'usr-chloe-d', name: 'Chloe Diaz', role: 'volunteer', roleTitle: 'Soprano Vocalist', avatar: '/icons/church-logo.png', ministryId: 'ministry-worship', joinedDate: '2025-01-12' },
      
      // Ushering Team
      { id: 'mem-u-1', userId: 'usr-owner-001', name: 'John Miko Sarsalijo', role: 'leader', roleTitle: 'Head Usher', avatar: '/images/avatar-john-miko.png', ministryId: 'ministry-usher', joinedDate: '2024-01-15', phone: '+63 920 987 6543' },
      { id: 'mem-u-2', userId: 'user-1793740018746', name: 'Kennedy Lopez', role: 'assistant_leader', roleTitle: 'Assistant Head Usher', avatar: '/icons/church-logo.png', ministryId: 'ministry-usher', joinedDate: '2025-02-14' },
      { id: 'mem-u-3', userId: 'user-1793738310185', name: 'Justin Dasco', role: 'core_member', roleTitle: 'Sanctuary Usher', avatar: '/icons/church-logo.png', ministryId: 'ministry-usher', joinedDate: '2026-11-04' },
      { id: 'mem-u-4', userId: 'usr-grace-l', name: 'Grace Lim', role: 'core_member', roleTitle: 'Foyer Greeter', avatar: '/icons/church-logo.png', ministryId: 'ministry-usher', joinedDate: '2024-06-01' },
      { id: 'mem-u-5', userId: 'usr-daniel-k', name: 'Daniel Kim', role: 'volunteer', roleTitle: 'Offering Steward', avatar: '/icons/church-logo.png', ministryId: 'ministry-usher', joinedDate: '2025-04-18' },
      
      // Multimedia Team
      { id: 'mem-m-1', userId: 'usr-tech-01', name: 'Markus Tech', role: 'leader', roleTitle: 'Audio Engineer Lead', avatar: '/icons/church-logo.png', ministryId: 'ministry-multimedia', joinedDate: '2023-06-01', phone: '+63 918 333 4455' },
      { id: 'mem-m-2', userId: 'usr-joshua-t', name: 'Joshua Tan', role: 'assistant_leader', roleTitle: 'Livestream Operator', avatar: '/icons/church-logo.png', ministryId: 'ministry-multimedia', joinedDate: '2024-02-15' },
      { id: 'mem-m-3', userId: 'usr-carlo-m', name: 'Carlo Medina', role: 'core_member', roleTitle: 'Presentation & Lyrics Operator', avatar: '/icons/church-logo.png', ministryId: 'ministry-multimedia', joinedDate: '2024-08-20' },
      { id: 'mem-m-4', userId: 'usr-alyssa-r', name: 'Alyssa Reyes', role: 'core_member', roleTitle: 'Church Photographer', avatar: '/icons/church-logo.png', ministryId: 'ministry-multimedia', joinedDate: '2025-03-01' },
      { id: 'mem-m-5', userId: 'usr-owner-001', name: 'John Miko Sarsalijo', role: 'core_member', roleTitle: 'Digital Engagement & Graphics', avatar: '/images/avatar-john-miko.png', ministryId: 'ministry-multimedia', joinedDate: '2024-01-15' }
    ]);
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
    const list = this.load<MinistryTask[]>(STORAGE_KEYS.TASKS, [
      // Worship
      { id: 'tsk-w-1', ministryId: 'ministry-worship', title: 'Prepare Colossians Praise Setlist', description: 'Confirm song keys with Mica Ramos and review transition chords for Colossians series.', assignedTo: 'Mica Ramos', assignedToId: 'usr-mica-01', dueDate: '2026-11-07', priority: 'high', status: 'completed', createdAt: '2026-11-02' },
      { id: 'tsk-w-2', ministryId: 'ministry-worship', title: 'Acoustic Guitar String Replacement', description: 'Restring church acoustic guitar before Saturday 3PM rehearsal.', assignedTo: 'David Cruz', assignedToId: 'usr-david-c', dueDate: '2026-11-07', priority: 'medium', status: 'in_progress', createdAt: '2026-11-04' },
      { id: 'tsk-w-3', ministryId: 'ministry-worship', title: 'Vocal Harmony Notes for "King of Kings"', description: 'Write alto and tenor vocal parts for the chorus bridge.', assignedTo: 'Sarah Gomez', assignedToId: 'usr-sarah-g', dueDate: '2026-11-08', priority: 'normal', status: 'pending', createdAt: '2026-11-05' },
      
      // Ushering
      { id: 'tsk-u-1', ministryId: 'ministry-usher', title: 'Print 120 Sunday Bulletins & Visitor Cards', description: 'Ensure welcome packets are stocked at the foyer table with pens.', assignedTo: 'Grace Lim', assignedToId: 'usr-grace-l', dueDate: '2026-11-07', priority: 'high', status: 'completed', createdAt: '2026-11-03' },
      { id: 'tsk-u-2', ministryId: 'ministry-usher', title: 'Sanctuary Row Setup & Aisle Check', description: 'Verify row spacing, reserve pastoral seating, clean front rows.', assignedTo: 'Justin Dasco', assignedToId: 'user-1793738310185', dueDate: '2026-11-08', priority: 'medium', status: 'pending', createdAt: '2026-11-05' },
      { id: 'tsk-u-3', ministryId: 'ministry-usher', title: 'Sanitize Offering Pouches & Envelopes', description: 'Prepare 6 offering bags with fresh envelopes for worship service.', assignedTo: 'Kennedy Lopez', assignedToId: 'user-1793740018746', dueDate: '2026-11-07', priority: 'normal', status: 'in_progress', createdAt: '2026-11-04' },
      
      // Multimedia
      { id: 'tsk-m-1', ministryId: 'ministry-multimedia', title: 'Colossians 1 Scripture Slide Deck', description: 'Format lyrics for 4 songs and Scripture passages in presentation slides.', assignedTo: 'Carlo Medina', assignedToId: 'usr-carlo-m', dueDate: '2026-11-07', priority: 'high', status: 'in_progress', createdAt: '2026-11-04' },
      { id: 'tsk-m-2', ministryId: 'ministry-multimedia', title: 'Wireless Microphone Frequency & Battery Check', description: 'Inspect 4 handheld microphones and ensure fresh rechargeable batteries.', assignedTo: 'Markus Tech', assignedToId: 'usr-tech-01', dueDate: '2026-11-08', priority: 'high', status: 'completed', createdAt: '2026-11-05' },
      { id: 'tsk-m-3', ministryId: 'ministry-multimedia', title: 'Livestream Stream Key & Audio Level Test', description: 'Run test broadcast 15 mins before service to verify YouTube & FB sync.', assignedTo: 'Joshua Tan', assignedToId: 'usr-joshua-t', dueDate: '2026-11-08', priority: 'medium', status: 'pending', createdAt: '2026-11-05' }
    ]);
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
    const list = this.load<MinistrySchedule[]>(STORAGE_KEYS.SCHEDULES, [
      { id: 'sch-w-1', ministryId: 'ministry-worship', title: 'Weekly Praise & Vocal Rehearsal', date: '2026-11-07', time: '3:00 PM – 5:30 PM', location: 'Main Sanctuary Stage', type: 'rehearsal', notes: 'Full band and vocal warmup. Focus on key transitions.', assignedMemberNames: ['Mica Ramos', 'David Cruz', 'Sarah Gomez', 'John Miko Sarsalijo'] },
      { id: 'sch-w-2', ministryId: 'ministry-worship', title: 'Sunday Worship Service Leading', date: '2026-11-08', time: '8:00 AM Call Time (9:00 AM Service)', location: 'Main Sanctuary', type: 'service', notes: '4-song setlist for Walking in Colossians Series.', assignedMemberNames: ['Mica Ramos', 'Pastor John Eric', 'Sarah Gomez', 'David Cruz'] },
      { id: 'sch-u-1', ministryId: 'ministry-usher', title: 'Sunday Foyer & Entrance Welcome', date: '2026-11-08', time: '8:00 AM – 11:30 AM', location: 'Sanctuary Main Doors', type: 'service', notes: 'Warm greeting, distributing church bulletins, and welcoming visitors.', assignedMemberNames: ['John Miko Sarsalijo', 'Grace Lim', 'Justin Dasco', 'Kennedy Lopez'] },
      { id: 'sch-u-2', ministryId: 'ministry-usher', title: 'Monthly Ushering & Hospitality Alignment', date: '2026-11-14', time: '5:00 PM – 6:15 PM', location: 'Fellowship Hall Room 2', type: 'meeting', notes: 'Review communion procedures and guest follow-up workflow.', assignedMemberNames: ['All Ushering Members'] },
      { id: 'sch-m-1', ministryId: 'ministry-multimedia', title: 'Sunday Audio/Visual & Livestream Setup', date: '2026-11-08', time: '7:15 AM – 11:30 AM', location: 'Media Booth', type: 'service', notes: 'Calibrate mics, test livestream bitrates, and verify song slides.', assignedMemberNames: ['Markus Tech', 'Joshua Tan', 'Carlo Medina', 'Alyssa Reyes'] },
      { id: 'sch-m-2', ministryId: 'ministry-multimedia', title: 'Presentation & ProPresenter Workshop', date: '2026-11-14', time: '2:00 PM – 4:00 PM', location: 'Tech Booth', type: 'meeting', notes: 'Hands-on training for slide formatting and background loop syncing.', assignedMemberNames: ['Carlo Medina', 'Joshua Tan'] }
    ]);
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
    return saved;
  }

  static deleteSchedule(scheduleId: string): void {
    const list = this.getSchedules().filter(s => s.id !== scheduleId);
    this.save(STORAGE_KEYS.SCHEDULES, list);
  }

  // --- ANNOUNCEMENTS ---
  static getAnnouncements(ministryId?: MinistryId): MinistryAnnouncement[] {
    const list = this.load<MinistryAnnouncement[]>(STORAGE_KEYS.ANNOUNCEMENTS, [
      { id: 'ann-w-1', ministryId: 'ministry-worship', title: 'New Song Keys Added for Colossians Series', content: 'Beloved worship team, we have added new key variations for "King of Kings" and "Living Hope" in the Song & Vocal Key Manager. Please practice your vocal ranges.', authorName: 'Mica Ramos', authorRole: 'Worship Director', createdAt: '2026-11-04T10:00:00Z', acknowledgedUserIds: ['usr-owner-001'] },
      { id: 'ann-u-1', ministryId: 'ministry-usher', title: 'Visitor Care: Warm Hospitality Reminder', content: 'Team, let us remember to extend Christ-like warmth to everyone walking through our doors. First-time visitors will receive our church welcome kit and pen.', authorName: 'John Miko Sarsalijo', authorRole: 'Head Usher', createdAt: '2026-11-03T14:30:00Z', acknowledgedUserIds: ['usr-owner-001', 'user-1793740018746'] },
      { id: 'ann-m-1', ministryId: 'ministry-multimedia', title: 'New HDMI 4K Cables Installed at Main Stage', content: 'The stage monitor and projector feeds have been upgraded with new high-speed shielded cables. Please do not disconnect cables during rehearsal.', authorName: 'Markus Tech', authorRole: 'Tech Director', createdAt: '2026-11-05T09:15:00Z', acknowledgedUserIds: ['usr-owner-001'] }
    ]);
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
    const list = this.load<MinistryResource[]>(STORAGE_KEYS.RESOURCES, [
      { id: 'res-w-1', ministryId: 'ministry-worship', title: 'BJC Worship Team Handbook & Guidelines', category: 'Guidelines', fileType: 'PDF Document', uploadedBy: 'Mica Ramos', uploadedAt: '2026-10-15', size: '1.4 MB' },
      { id: 'res-w-2', ministryId: 'ministry-worship', title: 'Vocal Harmony & Solfa Reference Sheet', category: 'Reference', fileType: 'PDF Document', uploadedBy: 'Mica Ramos', uploadedAt: '2026-10-20', size: '820 KB' },
      { id: 'res-u-1', ministryId: 'ministry-usher', title: 'Ushering Protocol & Sanctuary Safety Guide', category: 'Guidelines', fileType: 'PDF Document', uploadedBy: 'John Miko Sarsalijo', uploadedAt: '2026-09-10', size: '2.1 MB' },
      { id: 'res-u-2', ministryId: 'ministry-usher', title: 'Visitor Follow-up Care Protocol', category: 'Training', fileType: 'Document', uploadedBy: 'Kennedy Lopez', uploadedAt: '2026-10-01', size: '540 KB' },
      { id: 'res-m-1', ministryId: 'ministry-multimedia', title: 'Beholding Jesus Church Slide Template (16:9 4K)', category: 'Media', fileType: 'Presentation File', uploadedBy: 'Markus Tech', uploadedAt: '2026-10-28', size: '8.5 MB' },
      { id: 'res-m-2', ministryId: 'ministry-multimedia', title: 'Digital Audio Mixer Channel Mapping Guide', category: 'Training', fileType: 'PDF Document', uploadedBy: 'Joshua Tan', uploadedAt: '2026-11-01', size: '1.2 MB' }
    ]);
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
    const list = this.load<MinistryAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, [
      {
        id: 'att-w-1',
        ministryId: 'ministry-worship',
        date: '2026-11-01',
        eventTitle: 'Sunday Worship Service',
        recordedBy: 'Mica Ramos',
        recordedAt: '2026-11-01T12:00:00Z',
        attendees: [
          { userId: 'usr-mica-01', userName: 'Mica Ramos', status: 'present' },
          { userId: 'usr-owner-001', userName: 'John Miko Sarsalijo', status: 'present' },
          { userId: 'usr-sarah-g', userName: 'Sarah Gomez', status: 'present' },
          { userId: 'usr-david-c', userName: 'David Cruz', status: 'present' },
          { userId: 'usr-chloe-d', userName: 'Chloe Diaz', status: 'excused', notes: 'Out of town family commitment' }
        ]
      },
      {
        id: 'att-u-1',
        ministryId: 'ministry-usher',
        date: '2026-11-01',
        eventTitle: 'Sunday Service Duty',
        recordedBy: 'John Miko Sarsalijo',
        recordedAt: '2026-11-01T12:30:00Z',
        attendees: [
          { userId: 'usr-owner-001', userName: 'John Miko Sarsalijo', status: 'present' },
          { userId: 'user-1793740018746', userName: 'Kennedy Lopez', status: 'present' },
          { userId: 'usr-grace-l', userName: 'Grace Lim', status: 'present' },
          { userId: 'user-1793738310185', userName: 'Justin Dasco', status: 'present' }
        ]
      }
    ]);
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
    const list = this.load<MemberAvailability[]>(STORAGE_KEYS.AVAILABILITY, [
      { id: 'av-1', userId: 'usr-mica-01', userName: 'Mica Ramos', ministryId: 'ministry-worship', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-03' },
      { id: 'av-2', userId: 'usr-sarah-g', userName: 'Sarah Gomez', ministryId: 'ministry-worship', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-04' },
      { id: 'av-3', userId: 'usr-david-c', userName: 'David Cruz', ministryId: 'ministry-worship', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-04' },
      { id: 'av-4', userId: 'usr-chloe-d', userName: 'Chloe Diaz', ministryId: 'ministry-worship', serviceDate: '2026-11-08', status: 'unavailable', reason: 'College midterm exam study', updatedAt: '2026-11-05' },
      { id: 'av-5', userId: 'usr-owner-001', userName: 'John Miko Sarsalijo', ministryId: 'ministry-usher', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-02' },
      { id: 'av-6', userId: 'user-1793740018746', userName: 'Kennedy Lopez', ministryId: 'ministry-usher', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-03' },
      { id: 'av-7', userId: 'user-1793738310185', userName: 'Justin Dasco', ministryId: 'ministry-usher', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-04' },
      { id: 'av-8', userId: 'usr-tech-01', userName: 'Markus Tech', ministryId: 'ministry-multimedia', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-03' },
      { id: 'av-9', userId: 'usr-joshua-t', userName: 'Joshua Tan', ministryId: 'ministry-multimedia', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-04' },
      { id: 'av-10', userId: 'usr-carlo-m', userName: 'Carlo Medina', ministryId: 'ministry-multimedia', serviceDate: '2026-11-08', status: 'available', updatedAt: '2026-11-04' }
    ]);

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
    return this.load<UnifiedServicePlan[]>(STORAGE_KEYS.SERVICE_PLANS, [
      {
        id: 'plan-2026-11-08',
        serviceDate: '2026-11-08',
        title: 'Sunday Worship Celebration',
        theme: 'Walking in Colossians: The Supreme Sufficiency of Jesus Christ',
        serviceLeader: 'Pastor Daniel Santos',
        worship: {
          worshipLeader: 'Mica Ramos',
          singers: ['Sarah Gomez (Alto)', 'Mica Ramos (Lead)'],
          instrumentalists: ['David Cruz (Drums)', 'John Miko Sarsalijo (Keys/Bass)'],
          setlistIds: ['setlist-colossians-1'],
          songsSummary: ['King of Kings (D)', 'Living Hope (C)', 'Yet Not I But Through Christ In Me (C)', 'What A Beautiful Name (D)'],
          rehearsalStatus: 'Completed',
          checklist: {
            songsSelected: true,
            keysConfirmed: true,
            worshipLeaderAssigned: true,
            vocalistsAssigned: true,
            instrumentalistsAssigned: true,
            harmoniesPrepared: true,
            rehearsalScheduled: true,
            finalSetlistApproved: true
          },
          notes: 'Congregational response prayer after 3rd song.'
        },
        ushering: {
          assignedUshers: ['John Miko Sarsalijo', 'Grace Lim', 'Kennedy Lopez', 'Justin Dasco'],
          welcomeTeam: ['Grace Lim (Main Door)', 'Justin Dasco (Foyer Table)'],
          seatingLead: 'John Miko Sarsalijo',
          offeringTeam: ['Kennedy Lopez', 'Justin Dasco'],
          bulletinsReady: true,
          checklist: {
            entranceAreaPrepared: true,
            seatingAreaOrganized: true,
            welcomeTeamAssigned: true,
            guestAssistanceReady: true,
            serviceMaterialsPrepared: true,
            finalCoordinationDone: true
          },
          notes: 'Special visitor gift bags ready at the foyer.'
        },
        multimedia: {
          soundOperator: 'Markus Tech',
          presentationOperator: 'Carlo Medina',
          cameraOperator: 'Alyssa Reyes',
          livestreamOperator: 'Joshua Tan',
          photographer: 'Alyssa Reyes',
          presentationStatus: 'Sunday Ready',
          checklist: {
            soundChecked: true,
            projectorScreensReady: true,
            lyricsVersesSynced: true,
            camerasPositioned: true,
            livestreamTested: true,
            cablesSecured: true
          },
          notes: 'Livestream start at 8:50 AM with countdown timer.'
        }
      },
      {
        id: 'plan-2026-11-15',
        serviceDate: '2026-11-15',
        title: 'Sunday Worship Celebration',
        theme: 'Colossians Chapter 2: Alive in Christ',
        serviceLeader: 'Pastor Daniel Santos',
        worship: {
          worshipLeader: 'Mica Ramos',
          singers: ['Sarah Gomez', 'Chloe Diaz'],
          instrumentalists: ['David Cruz', 'Nathan Reyes'],
          setlistIds: [],
          songsSummary: ['10,000 Reasons (G)', 'In Christ Alone (D)', 'Holy Forever (A#)'],
          rehearsalStatus: 'Scheduled',
          checklist: {
            songsSelected: true,
            keysConfirmed: true,
            worshipLeaderAssigned: true,
            vocalistsAssigned: true,
            instrumentalistsAssigned: false,
            harmoniesPrepared: false,
            rehearsalScheduled: true,
            finalSetlistApproved: false
          }
        },
        ushering: {
          assignedUshers: ['Kennedy Lopez', 'Grace Lim'],
          welcomeTeam: ['Grace Lim'],
          seatingLead: 'Kennedy Lopez',
          offeringTeam: ['Justin Dasco'],
          bulletinsReady: false,
          checklist: {
            entranceAreaPrepared: false,
            seatingAreaOrganized: false,
            welcomeTeamAssigned: true,
            guestAssistanceReady: false,
            serviceMaterialsPrepared: false,
            finalCoordinationDone: false
          }
        },
        multimedia: {
          soundOperator: 'Markus Tech',
          presentationOperator: 'Carlo Medina',
          cameraOperator: 'Joshua Tan',
          livestreamOperator: 'Joshua Tan',
          photographer: 'Alyssa Reyes',
          presentationStatus: 'In Review',
          checklist: {
            soundChecked: false,
            projectorScreensReady: true,
            lyricsVersesSynced: false,
            camerasPositioned: false,
            livestreamTested: false,
            cablesSecured: false
          }
        }
      }
    ]);
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
    return this.load<UsheringVisitorRecord[]>(STORAGE_KEYS.VISITORS, [
      { id: 'vis-1', name: 'Ronald De Guzman', phone: '+63 917 555 1234', email: 'ronald.dg@example.com', serviceDate: '2026-11-01', isFirstTime: true, prayerRequest: 'Prayer for family guidance and job transition.', followUpStatus: 'welcomed', assignedLeader: 'John Miko Sarsalijo', notes: 'Sent church welcome SMS.' },
      { id: 'vis-2', name: 'Patricia Evangelista', phone: '+63 920 444 8899', email: 'patricia.e@example.com', serviceDate: '2026-11-01', isFirstTime: true, prayerRequest: 'Healing for my mother.', followUpStatus: 'prayed_for', assignedLeader: 'Kennedy Lopez', notes: 'Prayer warriors contacted her.' }
    ]);
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
    return this.load<UsheringLostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, [
      { id: 'lf-1', item: 'Black Bible with Gold Zipper (NIV)', location: 'Row 4 Center Seat', date: '2026-11-01', isClaimed: true, claimedBy: 'Bro. Samuel' },
      { id: 'lf-2', item: 'Silver Water Flask (Hydro)', location: 'Foyer Table', date: '2026-11-01', isClaimed: false }
    ]);
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
    return this.load<UsheringIncidentReport[]>(STORAGE_KEYS.INCIDENTS, [
      { id: 'inc-1', date: '2026-10-25', title: 'Water Spill in Right Aisle', description: 'Minor beverage spill during fellowship time; cleaned and dried within 3 minutes. No injuries.', severity: 'low', isResolved: true, reportedBy: 'Kennedy Lopez' }
    ]);
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
    return this.load<MultimediaPresentationItem[]>(STORAGE_KEYS.PRESENTATIONS, [
      { id: 'pres-1', serviceDate: '2026-11-08', title: 'Sunday Praise & Colossians 1 Slide Deck', slidesCount: 38, lyricsReady: true, versesReady: true, status: 'ready', downloadUrl: '#' },
      { id: 'pres-2', serviceDate: '2026-11-15', title: 'Walking in Colossians 2 Slide Deck', slidesCount: 22, lyricsReady: true, versesReady: false, status: 'in_review', downloadUrl: '#' }
    ]);
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
    return this.load<MediaRequestItem[]>(STORAGE_KEYS.MEDIA_REQUESTS, [
      { id: 'req-1', title: 'Christmas Outreach Banner & Social Posters', requestType: 'Event Posters', requestedBy: 'Pastor John Eric', requestedRole: 'Senior Pastor', dueDate: '2026-11-20', status: 'in_progress', description: 'Design 1080x1080 Instagram & 1920x1080 TV slide for our Dec 21 Street Outreach.' },
      { id: 'req-2', title: 'Youth Ignite Fellowship Promo Video Reel', requestType: 'Video Editing', requestedBy: 'Youth Ministry Lead', requestedRole: 'Youth Director', dueDate: '2026-11-12', status: 'submitted', description: '60-second highlight reel with energetic worship clips and invitation voiceover.' }
    ]);
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
