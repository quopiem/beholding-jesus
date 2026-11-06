// Clean initial church data for Beholding Jesus Church
// All songs, singers, setlists, announcements, prayers, and group chats are input directly by real members.
import { Song, Singer, WorshipSetlist, Ministry, ChurchEvent, Announcement, PrayerRequest, UserProfile, CommunityPost, ChatRoom } from '../types';

export const INITIAL_SONGS: Song[] = [];

export const INITIAL_SINGERS: Singer[] = [];

export const INITIAL_SETLISTS: WorshipSetlist[] = [];

export const INITIAL_MINISTRIES: Ministry[] = [
  {
    "id": "ministry-multimedia",
    "name": "Multi Media",
    "slug": "multi-media",
    "category": "Media & Production",
    "leaderTitle": "Media & Tech Director",
    "leaderName": "Tech Team",
    "icon": "monitor",
    "color": "#0284c7",
    "description": "Ensuring high-quality sound engineering, live video streaming, lyric projection, lighting, and creative digital engagement for corporate worship.",
    "meetingTime": "Sundays 7:30 AM (Sound & Media Check)",
    "location": "Media Booth & Stage",
    "membersCount": 6,
    "memberIds": ["usr-owner-001"],
    "isCore": true,
    "coverImage": "/icons/church-logo.png",
    "activities": [
      "Audio Mixing & Sound Engineering",
      "Live Streaming & Video Recording",
      "Song Lyrics & Scripture Projection",
      "Stage Lighting & Technical Setup"
    ]
  },
  {
    "id": "ministry-worship",
    "name": "Worship Team",
    slug: "worship-team",
    category: "Worship & Liturgy",
    leaderTitle: "Worship Director",
    leaderName: "Mica Ramos",
    icon: "music",
    color: "#d97706",
    description: "Leading the church family in God-exalting, Christ-centered, Spirit-filled praise, vocal harmony, and corporate adoration.",
    meetingTime: "Saturdays 3:00 PM – 6:00 PM (Rehearsal)",
    location: "Main Sanctuary Stage",
    membersCount: 8,
    memberIds: ["usr-owner-001"],
    isCore: true,
    coverImage: "/icons/cross-hill-sunset.png",
    "activities": [
      "Weekly Musical & Vocal Rehearsals",
      "Leading Sunday Praise & Worship Sets",
      "Vocal Warmups & Skill Development",
      "Prayer & Spiritual Preparation"
    ]
  },
  {
    "id": "ministry-usher",
    "name": "Usher",
    "slug": "usher-ministry",
    "category": "Hospitality & Welcome",
    "leaderTitle": "Head Usher",
    "leaderName": "Ushering Lead",
    "icon": "users",
    "color": "#059669",
    "description": "Warmly greeting worshippers, distributing worship bulletins, seating attendees, collecting tithes and offerings, and maintaining sanctuary order.",
    "meetingTime": "Sundays 8:00 AM – 11:30 AM",
    "location": "Sanctuary Foyer & Entrances",
    "membersCount": 7,
    "memberIds": ["usr-owner-001"],
    "isCore": true,
    "coverImage": "/icons/church-seal-gold.png",
    "activities": [
      "Congregation Greeting & Seating Assistance",
      "Tithes & Offerings Collection",
      "Order of Service Bulletin Distribution",
      "Safety, Hospitality & Sanctuary Care"
    ]
  }
];

export const INITIAL_EVENTS: ChurchEvent[] = [
  {
    "id": "event-worship-sunday",
    "title": "Sunday Worship Service",
    "category": "Sunday Worship Service",
    "date": "Every Sunday",
    "startTime": "9:00 AM",
    "endTime": "11:00 AM",
    "location": "2nd Flr B1 L34 Holy Spirit St. Goodwill Homes 1 Brgy. Bagbag Novaliches Q.C.",
    "description": "Join us for corporate worship, fervent praise, and expository preaching of the Word of God as we behold the glory of Jesus Christ.",
    "coverImage": "/images/church-service-banner.png",
    "organizerName": "Pastoral Leadership",
    "requiresRegistration": false,
    "capacity": 150,
    "registeredUserIds": ["usr-owner-001"],
    "attendeesCount": 1
  },
  {
    "id": "event-youth-jesus-gen",
    "title": "Jesus Gen Youth Service",
    "category": "Youth Service",
    "date": "Every Sunday",
    "startTime": "1:00 PM",
    "endTime": "3:00 PM",
    "location": "2nd Flr B1 L34 Holy Spirit St. Goodwill Homes 1 Brgy. Bagbag Novaliches Q.C.",
    "description": "High-energy youth worship, real fellowship, and biblical truth equipping young disciples to stand unashamed for Jesus.",
    "coverImage": "/images/weekly-schedules-banner.png",
    "organizerName": "Jesus Gen Youth",
    "requiresRegistration": false,
    "capacity": 80,
    "registeredUserIds": ["usr-owner-001"],
    "attendeesCount": 1
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

export const INITIAL_PRAYER_REQUESTS: PrayerRequest[] = [];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-pastor-john-eric',
    name: 'John Eric Manjares',
    username: 'pastorjohneric',
    email: 'johneric.manjares@beholdingjesus.org',
    role: 'pastor',
    roleTitle: 'Senior Pastor',
    avatar: '/images/pastor-john-eric-manjares.png',
    ministryIds: ['ministry-pastoral', 'ministry-worship'],
    bio: 'Senior Pastor of Beholding Jesus Church. Passionate about expository preaching, Christ-centered discipleship, and beholding the glory of God in our generation.',
    joinedDate: '2023-01-01'
  },
  {
    id: 'usr-owner-001',
    name: 'John Miko Sarsalijo',
    username: 'johnmiko',
    email: 'johnmiko@beholdingjesus.org',
    role: 'super_admin',
    roleTitle: 'App Owner & Finance Manager',
    avatar: '/images/avatar-john-miko.png',
    ministryIds: ['ministry-worship', 'ministry-multimedia', 'ministry-usher'],
    bio: 'Finance Manager and administrator dedicated to serving the vision of Beholding Jesus Church.',
    joinedDate: '2024-01-15'
  },
  {
    id: 'user-1793738310185',
    name: 'Justin Dasco',
    username: 'justin2006',
    email: 'justin2006@beholdingjesus.org',
    role: 'regular_member',
    roleTitle: 'Church Member',
    avatar: '/icons/church-logo.png',
    ministryIds: [],
    bio: 'Faithful member of Beholding Jesus Church.',
    joinedDate: '2026-11-04'
  },
  {
    id: 'user-1793740233975',
    name: 'Justin Dasco',
    username: 'justin1',
    email: 'justin1@beholdingjesus.org',
    role: 'regular_member',
    roleTitle: 'Church Member',
    avatar: '/icons/church-logo.png',
    ministryIds: [],
    bio: 'Faithful member of Beholding Jesus Church.',
    joinedDate: '2026-11-04'
  },
  {
    id: 'user-1793740018746',
    name: 'Kennedy Lopez',
    username: 'kennedy1',
    email: 'kennedy1@beholdingjesus.org',
    role: 'regular_member',
    roleTitle: 'Church Member',
    avatar: '/icons/church-logo.png',
    ministryIds: [],
    bio: 'Faithful member of Beholding Jesus Church.',
    joinedDate: '2026-11-04'
  },
  {
    id: 'user-1793736691356',
    name: 'Quopiem Zenin',
    username: 'quopiem',
    email: 'quopiem@beholdingjesus.org',
    role: 'regular_member',
    roleTitle: 'Church Member',
    avatar: '/icons/church-logo.png',
    ministryIds: [],
    bio: 'Faithful member of Beholding Jesus Church.',
    joinedDate: '2026-11-04'
  },
  {
    id: 'user-1793736964820',
    name: 'John Miko',
    username: 'mokoy',
    email: 'mokoy@beholdingjesus.org',
    role: 'regular_member',
    roleTitle: 'Church Member',
    avatar: '/icons/church-logo.png',
    ministryIds: [],
    bio: 'Faithful member of Beholding Jesus Church.',
    joinedDate: '2026-11-04'
  },
  {
    id: 'user-1793738205980',
    name: 'MIKO SARSALIJO',
    username: 'okim',
    email: 'okim@beholdingjesus.org',
    role: 'regular_member',
    roleTitle: 'Church Member',
    avatar: '/icons/church-logo.png',
    ministryIds: [],
    bio: 'Faithful member of Beholding Jesus Church.',
    joinedDate: '2026-11-04'
  }
];

export const INITIAL_CHAT_ROOMS: ChatRoom[] = [];

export const INITIAL_POSTS: CommunityPost[] = [];
