import { 
  Song, Singer, WorshipSetlist, Ministry, ChurchEvent, Announcement, 
  PrayerRequest, UserProfile, UserRole, CommunityPost, ChatRoom, ChatMessage,
  NotificationItem, MinistryJoinRequest, MusicalKey
} from '../types';
import { 
  INITIAL_SONGS, INITIAL_SINGERS, INITIAL_SETLISTS, INITIAL_MINISTRIES, 
  INITIAL_EVENTS, INITIAL_ANNOUNCEMENTS, INITIAL_PRAYER_REQUESTS, INITIAL_USERS,
  INITIAL_CHAT_ROOMS, INITIAL_POSTS 
} from './initialData';
import { supabase } from '../lib/supabase';
import { MinistryStore, MinistryId } from './ministryStore';

// Local storage storage keys
const KEY_SONGS = 'bjc_songs_v2';
const KEY_SINGERS = 'bjc_singers_v2';
const KEY_SETLISTS = 'bjc_setlists_v2';
const KEY_MINISTRIES = 'bjc_ministries_v4';
const KEY_EVENTS = 'bjc_events_v2';
const KEY_ANNOUNCEMENTS = 'bjc_announcements_v2';
const KEY_PRAYERS = 'bjc_prayers_v2';
const KEY_POSTS = 'bjc_posts_v2';
const KEY_CHAT_ROOMS = 'bjc_chat_rooms_v2';
const KEY_CHAT_MESSAGES = 'bjc_chat_messages_v2';
const KEY_NOTIFICATIONS = 'bjc_notifications_v2';
const KEY_JOIN_REQUESTS = 'bjc_join_requests_v2';
const KEY_CURRENT_USER_ID = 'bjc_current_user_id_v2';
const KEY_USERS = 'bjc_users_v2';
const KEY_WORSHIP_PREFS = 'bjc_worship_prefs_v1';

export class ChurchDataStore {
  // Load helper with fallback
  private static load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, data: T) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  // --- USER & ROLE MANAGEMENT ---
  static getUsers(): UserProfile[] {
    const list = this.load<UserProfile[]>(KEY_USERS, INITIAL_USERS);
    // Ensure all users have a username
    return list.map(u => ({
      ...u,
      username: u.username || u.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    }));
  }

  static async fetchUsersFromCloud(): Promise<UserProfile[]> {
    if (!supabase) return this.getUsers();
    try {
      const { data, error } = await supabase
        .from('church_members_auth')
        .select('id, name, username, email, role, role_title, avatar, bio, created_at')
        .order('created_at', { ascending: true });

      if (data && !error && data.length > 0) {
        const localUsers = this.getUsers();
        const mapped: UserProfile[] = data.map(d => {
          const existing = localUsers.find(u => u.id === d.id || u.username?.toLowerCase() === d.username?.toLowerCase());
          const isPending = d.role === 'ministry_member' && (
            d.role_title?.includes('Pending') || 
            existing?.approvalStatus === 'pending' || 
            !d.role_title || 
            d.role_title.toLowerCase().includes('pending')
          );
          return {
            id: d.id,
            name: d.name,
            username: d.username,
            email: d.email,
            role: d.role as UserRole,
            roleTitle: d.role_title || (isPending ? 'Ministry Member (Pending)' : 'Church Member'),
            avatar: d.avatar || '/icons/church-logo.png',
            bio: d.bio || 'Faithful member of Beholding Jesus Church.',
            ministryIds: existing?.ministryIds || [],
            approvalStatus: isPending ? 'pending' : (existing?.approvalStatus || 'active'),
            targetMinistryId: existing?.targetMinistryId,
            ministryMessage: existing?.ministryMessage,
            joinedDate: d.created_at ? d.created_at.split('T')[0] : '2026-11-04'
          };
        });
        this.save(KEY_USERS, mapped);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('bjc_users_change'));
        }
        return mapped;
      }
    } catch (e) {
      console.warn('fetchUsersFromCloud error:', e);
    }
    return this.getUsers();
  }

  static addUser(user: UserProfile): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id || u.username?.toLowerCase() === user.username?.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    this.save(KEY_USERS, users);
  }

  static updateUser(user: Partial<UserProfile> & { id: string }): UserProfile {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
      this.save(KEY_USERS, users);
      return users[idx];
    }
    return user as UserProfile;
  }

  static async updateProfile(user: Partial<UserProfile> & { id: string }): Promise<UserProfile> {
    const updated = this.updateUser(user);

    // Also update active session if current user
    try {
      const sessRaw = localStorage.getItem('bjc_auth_session_v1');
      if (sessRaw) {
        const sess = JSON.parse(sessRaw);
        if (sess && (sess.userId === user.id || sess.username?.toLowerCase() === updated.username?.toLowerCase())) {
          sess.name = updated.name;
          sess.avatar = updated.avatar;
          localStorage.setItem('bjc_auth_session_v1', JSON.stringify(sess));
        }
      }
    } catch {
      // ignore
    }

    // Sync to Supabase church_members_auth
    if (supabase) {
      try {
        const updateData: any = {
          name: updated.name,
          avatar: updated.avatar,
          bio: updated.bio,
          role_title: updated.roleTitle,
          updated_at: new Date().toISOString()
        };
        await supabase
          .from('church_members_auth')
          .update(updateData)
          .eq('id', updated.id);
      } catch (e) {
        console.warn('updateProfile cloud sync error:', e);
      }
    }

    // Dispatch auth change event so UI across the app updates immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bjc_auth_change', { detail: updated }));
    }

    return updated;
  }

  static async deleteUser(userId: string): Promise<boolean> {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.save(KEY_USERS, users);

    // Remove from custom credentials if present
    try {
      const credsRaw = localStorage.getItem('bjc_custom_credentials');
      if (credsRaw) {
        const creds = JSON.parse(credsRaw);
        delete creds[userId];
        localStorage.setItem('bjc_custom_credentials', JSON.stringify(creds));
      }
    } catch {}

    // Delete from Supabase church_members_auth if configured
    if (supabase) {
      try {
        await supabase.from('church_members_auth').delete().eq('id', userId);
      } catch (e) {
        console.warn('deleteUser cloud error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_users_change'));
    }

    return true;
  }

  static getCurrentUser(): UserProfile | null {
    // Check if an active authenticated session exists
    try {
      const sessRaw = localStorage.getItem('bjc_auth_session_v1');
      if (sessRaw) {
        const sess = JSON.parse(sessRaw);
        if (sess && sess.userId && new Date(sess.expiresAt).getTime() > Date.now()) {
          const users = this.getUsers();
          const found = users.find(u => u.id === sess.userId || (sess.username && u.username?.toLowerCase() === sess.username.toLowerCase()));
          if (found) return found;
        }
      }
    } catch {
      // ignore
    }

    // Do NOT automatically authenticate visitors as the App Owner!
    // A visitor must log in through Supabase / AuthService before getting a user profile.
    return null;
  }

  // Safe non-privileged fallback for internal service calls if user session is absent
  static getRequiredCurrentUser(): UserProfile {
    const user = this.getCurrentUser();
    if (user) return user;
    return {
      id: 'guest-visitor',
      name: 'Church Visitor',
      username: 'visitor',
      email: 'visitor@beholdingjesus.org',
      role: 'regular_member',
      roleTitle: 'Church Guest',
      avatar: '/icons/church-logo.png',
      bio: 'Visitor of Beholding Jesus Church.',
      ministryIds: [],
      joinedDate: new Date().toISOString().split('T')[0]
    };
  }

  static setCurrentUser(userId: string): UserProfile {
    localStorage.setItem(KEY_CURRENT_USER_ID, userId);
    const u = this.getCurrentUser();
    return u || this.getRequiredCurrentUser();
  }

  static hasRole(allowedRoles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }

  // --- WORSHIP: SONGS, SINGERS & VOCAL KEYS ---
  static getSongs(): Song[] {
    return this.load<Song[]>(KEY_SONGS, INITIAL_SONGS);
  }

  static async fetchSongsFromCloud(): Promise<Song[]> {
    if (!supabase) return this.getSongs();
    try {
      const { data, error } = await supabase
        .from('church_songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const localSongs = this.getSongs();
        const mapped: Song[] = data.map(d => {
          const localMatch = localSongs.find(ls => ls.id === d.id);
          // Preserve local singer vocal key assignments if cloud is empty or outdated
          const mergedSingers = (Array.isArray(d.singers) && d.singers.length > 0)
            ? d.singers
            : (localMatch?.singers || []);

          return {
            id: d.id,
            title: d.title,
            artist: d.artist || '',
            composer: d.composer || '',
            genre: d.genre || 'Worship',
            tempo: d.tempo || '72',
            originalKey: (d.original_key as MusicalKey) || 'D',
            mood: d.mood || '',
            notes: d.notes || '',
            lyrics: d.lyrics || '',
            audioUrl: d.audio_url || '',
            createdAt: d.created_at,
            createdBy: d.created_by,
            singers: mergedSingers
          };
        });

        // Retain any local songs not yet returned by cloud query
        localSongs.forEach(ls => {
          if (!mapped.some(m => m.id === ls.id)) {
            mapped.push(ls);
          }
        });

        this.save(KEY_SONGS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('fetchSongsFromCloud error:', e);
    }
    return this.getSongs();
  }

  static saveSong(song: Partial<Song> & { title: string; originalKey: string }): Song {
    const songs = this.getSongs();
    const currentUser = this.getCurrentUser();
    let saved: Song;

    if (song.id) {
      const idx = songs.findIndex(s => s.id === song.id);
      if (idx >= 0) {
        songs[idx] = { ...songs[idx], ...song } as Song;
        saved = songs[idx];
      } else {
        saved = song as Song;
        songs.unshift(saved);
      }
    } else {
      saved = {
        id: `song-${Date.now()}`,
        title: song.title,
        artist: song.artist || '',
        composer: song.composer || '',
        genre: song.genre || 'Worship',
        tempo: song.tempo || '72',
        originalKey: (song.originalKey as MusicalKey) || 'D',
        mood: song.mood || '',
        notes: song.notes || '',
        lyrics: song.lyrics || '',
        audioUrl: song.audioUrl || '',
        createdAt: new Date().toISOString(),
        createdBy: currentUser ? currentUser.name : 'Worship Team',
        singers: song.singers || []
      };
      songs.unshift(saved);
    }

    this.save(KEY_SONGS, songs);

    if (supabase) {
      supabase.from('church_songs').upsert({
        id: saved.id,
        title: saved.title,
        artist: saved.artist,
        composer: saved.composer,
        genre: saved.genre,
        tempo: saved.tempo,
        original_key: saved.originalKey,
        mood: saved.mood,
        notes: saved.notes,
        lyrics: saved.lyrics,
        audio_url: saved.audioUrl,
        singers: saved.singers || [],
        created_by: saved.createdBy
      }).then();
    }

    return saved;
  }

  static deleteSong(songId: string): Song[] {
    const songs = this.getSongs().filter(s => s.id !== songId);
    this.save(KEY_SONGS, songs);

    if (supabase) {
      supabase.from('church_songs').delete().eq('id', songId).then();
    }

    return songs;
  }

  static getSingers(): Singer[] {
    return this.load<Singer[]>(KEY_SINGERS, INITIAL_SINGERS);
  }

  static async fetchSingersFromCloud(): Promise<Singer[]> {
    if (!supabase) return this.getSingers();
    try {
      const { data, error } = await supabase
        .from('church_singers')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const localSingers = this.getSingers();
        const mapped: Singer[] = data.map(d => ({
          id: d.id,
          name: d.name,
          profilePicture: d.profile_picture || '/icons/church-logo.png',
          defaultRole: d.default_role || 'Lead',
          vocalRange: d.vocal_range || '',
          notes: d.notes || '',
          assignedSongsCount: d.assigned_songs_count || 0
        }));

        // Preserve local singers that might not have synchronized yet
        localSingers.forEach(ls => {
          if (!mapped.some(m => m.id === ls.id)) {
            mapped.push(ls);
          }
        });

        this.save(KEY_SINGERS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('fetchSingersFromCloud error:', e);
    }
    return this.getSingers();
  }

  static saveSinger(singer: Partial<Singer> & { name: string }): Singer {
    const singers = this.getSingers();
    let saved: Singer;

    if (singer.id) {
      const idx = singers.findIndex(s => s.id === singer.id);
      if (idx >= 0) {
        singers[idx] = { ...singers[idx], ...singer };
        saved = singers[idx];
      } else {
        saved = singer as Singer;
      }
    } else {
      saved = {
        id: `singer-${Date.now()}`,
        name: singer.name,
        profilePicture: singer.profilePicture || '/icons/church-logo.png',
        defaultRole: singer.defaultRole || 'Lead / Soprano',
        vocalRange: singer.vocalRange || 'C3 – C5',
        notes: singer.notes || '',
        assignedSongsCount: 0
      };
      singers.push(saved);
    }

    this.save(KEY_SINGERS, singers);

    if (supabase) {
      supabase.from('church_singers').upsert({
        id: saved.id,
        name: saved.name,
        profile_picture: saved.profilePicture,
        default_role: saved.defaultRole,
        vocal_range: saved.vocalRange,
        notes: saved.notes,
        assigned_songs_count: saved.assignedSongsCount || 0
      }).then();
    }

    return saved;
  }

  static deleteSinger(singerId: string): Singer[] {
    const singers = this.getSingers().filter(s => s.id !== singerId);
    this.save(KEY_SINGERS, singers);

    if (supabase) {
      supabase.from('church_singers').delete().eq('id', singerId).then();
    }

    // Also remove singer from songs
    const songs = this.getSongs();
    songs.forEach(song => {
      song.singers = song.singers.filter(s => s.singerId !== singerId);
    });
    this.save(KEY_SONGS, songs);

    return singers;
  }

  // Add/Update Vocal Keys for Singer on a specific song (Flowchart Step 3)
  static addVocalKeysToSong(params: {
    songId: string;
    singerId: string;
    singerName: string;
    role: 'Lead' | 'Backup' | 'Duet' | 'Choir' | 'Acoustic Lead';
    keys: {
      key: MusicalKey;
      notation: string;
      range?: string;
      notes?: string;
    }[];
  }): Song | null {
    const songs = this.getSongs();
    const song = songs.find(s => s.id === params.songId);
    if (!song) return null;

    if (!song.singers) song.singers = [];
    const existingAssignment = song.singers.find(s => s.singerId === params.singerId);

    const formattedKeys = params.keys.map(k => ({
      id: `k-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      key: k.key,
      notation: k.notation,
      range: k.range || 'C3 – C5',
      notes: k.notes || ''
    }));

    if (existingAssignment) {
      existingAssignment.role = params.role;
      existingAssignment.keys = [...existingAssignment.keys, ...formattedKeys];
    } else {
      song.singers.push({
        id: `vocal-${Date.now()}`,
        singerId: params.singerId,
        singerName: params.singerName,
        role: params.role,
        keys: formattedKeys
      });
    }

    this.save(KEY_SONGS, songs);

    // Sync vocal key assignments to Supabase Cloud
    if (supabase) {
      supabase.from('church_songs').update({
        singers: song.singers
      }).eq('id', song.id).then();
    }

    return song;
  }

  static deleteSingerKey(songId: string, singerId: string, keyId: string): Song | null {
    const songs = this.getSongs();
    const song = songs.find(s => s.id === songId);
    if (!song) return null;

    const assignment = song.singers.find(s => s.singerId === singerId);
    if (assignment) {
      assignment.keys = assignment.keys.filter(k => k.id !== keyId);
      if (assignment.keys.length === 0) {
        // remove assignment if no keys remain
        song.singers = song.singers.filter(s => s.singerId !== singerId);
      }
    }

    this.save(KEY_SONGS, songs);

    // Sync updated assignments to Supabase Cloud
    if (supabase) {
      supabase.from('church_songs').update({
        singers: song.singers
      }).eq('id', song.id).then();
    }

    return song;
  }

  // --- WORSHIP SETLISTS ---
  static getSetlists(): WorshipSetlist[] {
    return this.load<WorshipSetlist[]>(KEY_SETLISTS, INITIAL_SETLISTS);
  }

  static saveSetlist(setlist: WorshipSetlist): WorshipSetlist {
    const list = this.getSetlists();
    const idx = list.findIndex(s => s.id === setlist.id);
    if (idx >= 0) {
      list[idx] = setlist;
    } else {
      list.unshift(setlist);
    }
    this.save(KEY_SETLISTS, list);
    return setlist;
  }

  // --- MINISTRIES (Only Multi Media, Worship Team, and Usher) ---
  static getMinistries(): Ministry[] {
    const list = this.load<Ministry[]>(KEY_MINISTRIES, INITIAL_MINISTRIES);
    const allowed = ['ministry-multimedia', 'ministry-worship', 'ministry-usher'];
    const filtered = list.filter(m => allowed.includes(m.id));
    if (filtered.length === 3) {
      return filtered;
    }
    this.save(KEY_MINISTRIES, INITIAL_MINISTRIES);
    return INITIAL_MINISTRIES;
  }

  static getJoinRequests(): MinistryJoinRequest[] {
    return this.load<MinistryJoinRequest[]>(KEY_JOIN_REQUESTS, []);
  }

  static async fetchJoinRequestsFromCloud(): Promise<MinistryJoinRequest[]> {
    if (!supabase) return this.getJoinRequests();
    try {
      const { data, error } = await supabase
        .from('church_prayer_requests')
        .select('*')
        .eq('category', 'sys_ministry_join_request')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const cloudRequests: MinistryJoinRequest[] = data.map(d => {
          let ministryId = d.target_ministry_id || 'ministry-worship';
          let ministryName = d.title || 'Ministry';
          if (d.title && d.title.includes(':::')) {
            const parts = d.title.split(':::');
            ministryId = parts[0];
            ministryName = parts[1];
          }
          return {
            id: d.id,
            ministryId,
            ministryName,
            userId: d.user_id,
            userName: d.author_name,
            userEmail: `${d.user_id}@beholdingjesus.org`,
            experience: d.description || '',
            status: (d.testimony_text as any) || (d.is_answered ? 'approved' : 'pending'),
            requestedAt: d.created_at
          };
        });

        // Merge with any local join requests to ensure complete coverage
        const localRequests = this.getJoinRequests();
        const mergedMap = new Map<string, MinistryJoinRequest>();
        
        cloudRequests.forEach(r => mergedMap.set(r.id, r));
        localRequests.forEach(r => {
          if (!mergedMap.has(r.id)) {
            mergedMap.set(r.id, r);
            // Upsert unsynced local request to cloud
            supabase?.from('church_prayer_requests').upsert({
              id: r.id,
              user_id: r.userId,
              author_name: r.userName,
              is_anonymous: false,
              category: 'sys_ministry_join_request',
              title: `${r.ministryId}:::${r.ministryName}`,
              description: r.experience || '',
              visibility: 'admin_only',
              target_ministry_id: r.ministryId,
              is_answered: r.status === 'approved',
              testimony_text: r.status,
              created_at: r.requestedAt
            }).then();
          }
        });

        const merged = Array.from(mergedMap.values());
        this.save(KEY_JOIN_REQUESTS, merged);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('bjc_join_requests_change'));
        }
        return merged;
      }
    } catch (e) {
      console.warn('fetchJoinRequestsFromCloud error:', e);
    }
    return this.getJoinRequests();
  }

  static subscribeToJoinRequests(onUpdate: (reqs: MinistryJoinRequest[]) => void) {
    if (!supabase) return () => {};
    const channel = supabase
      .channel('public:sys_ministry_join_requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'church_prayer_requests' },
        async (payload: any) => {
          if (payload.new?.category === 'sys_ministry_join_request' || payload.old?.category === 'sys_ministry_join_request') {
            const fresh = await ChurchDataStore.fetchJoinRequestsFromCloud();
            onUpdate(fresh);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  static submitJoinRequest(ministryId: string, experience: string): MinistryJoinRequest {
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();
    const ministries = this.getMinistries();
    const min = ministries.find(m => m.id === ministryId);
    const requests = this.getJoinRequests();

    const newReq: MinistryJoinRequest = {
      id: `req-${Date.now()}`,
      ministryId,
      ministryName: min ? min.name : 'Ministry',
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      experience,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    requests.unshift(newReq);
    this.save(KEY_JOIN_REQUESTS, requests);

    // Sync to Supabase Cloud immediately so Super Admin on any device sees it
    if (supabase) {
      supabase.from('church_prayer_requests').upsert({
        id: newReq.id,
        user_id: newReq.userId,
        author_name: newReq.userName,
        is_anonymous: false,
        category: 'sys_ministry_join_request',
        title: `${ministryId}:::${newReq.ministryName}`,
        description: experience || '',
        visibility: 'admin_only',
        target_ministry_id: ministryId,
        is_answered: false,
        testimony_text: 'pending',
        created_at: newReq.requestedAt
      }).then();
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_join_requests_change'));
      window.dispatchEvent(new Event('storage'));
    }

    return newReq;
  }

  static getPendingMinistryRegistrations(): UserProfile[] {
    const users = this.getUsers();
    return users.filter(u => u.role === 'ministry_member' && u.approvalStatus === 'pending');
  }

  static approveMinistryRegistration(userId: string, targetMinistryId?: string): UserProfile | null {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const assignedMinistryId = (targetMinistryId || user.targetMinistryId || 'ministry-worship') as MinistryId;
    user.approvalStatus = 'active';
    user.role = 'ministry_member';
    user.roleTitle = 'Ministry Member';
    if (!user.ministryIds) user.ministryIds = [];
    if (!user.ministryIds.includes(assignedMinistryId)) {
      user.ministryIds.push(assignedMinistryId);
    }
    this.save(KEY_USERS, users);

    // Sync approval to Supabase Cloud church_members_auth
    if (supabase) {
      supabase.from('church_members_auth').update({
        role: 'ministry_member',
        role_title: 'Ministry Member',
        updated_at: new Date().toISOString()
      }).eq('id', userId).then();
    }

    // Also add to MinistryStore members list
    try {
      MinistryStore.addMember({
        userId: user.id,
        name: user.name,
        role: 'volunteer',
        roleTitle: 'Ministry Member',
        avatar: user.avatar || '/icons/church-logo.png',
        ministryId: assignedMinistryId,
        joinedDate: new Date().toISOString().split('T')[0]
      });
    } catch (e) {
      console.warn('MinistryStore.addMember fallback:', e);
    }

    // Add to ministries in ChurchDataStore
    const ministries = this.getMinistries();
    const min = ministries.find(m => m.id === assignedMinistryId);
    if (min && !min.memberIds.includes(user.id)) {
      min.memberIds.push(user.id);
      min.membersCount = min.memberIds.length;
      this.save(KEY_MINISTRIES, ministries);
    }

    // Send welcome notification
    this.addNotification({
      userId: user.id,
      type: 'system',
      title: 'Ministry Account Confirmed & Approved!',
      message: `Praise God! Your registration as a Ministry Member for Beholding Jesus Church has been confirmed by the Super Admin. You now have full access to your ministry workspace.`,
      linkRoute: 'ministries'
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_users_change'));
      window.dispatchEvent(new Event('bjc_auth_change'));
    }

    return user;
  }

  static rejectMinistryRegistration(userId: string, reason?: string): UserProfile | null {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    user.approvalStatus = 'rejected';
    this.save(KEY_USERS, users);

    if (supabase) {
      supabase.from('church_members_auth').update({
        role_title: 'Registration Rejected',
        updated_at: new Date().toISOString()
      }).eq('id', userId).then();
    }

    this.addNotification({
      userId: user.id,
      type: 'system',
      title: 'Ministry Registration Notice',
      message: reason || `Your registration for ministry membership was not confirmed at this time. Please contact church leadership or worship directors.`,
      linkRoute: 'home'
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_users_change'));
      window.dispatchEvent(new Event('bjc_auth_change'));
    }

    return user;
  }

  static handleJoinRequest(requestId: string, status: 'approved' | 'declined'): MinistryJoinRequest[] {
    const requests = this.getJoinRequests();
    const req = requests.find(r => r.id === requestId);
    if (req) {
      req.status = status;

      // Sync status change to Supabase Cloud
      if (supabase) {
        supabase.from('church_prayer_requests').update({
          is_answered: status === 'approved',
          testimony_text: status
        }).eq('id', requestId).then();
      }

      if (status === 'approved') {
        const ministries = this.getMinistries();
        const min = ministries.find(m => m.id === req.ministryId);
        if (min && !min.memberIds.includes(req.userId)) {
          min.memberIds.push(req.userId);
          min.membersCount = min.memberIds.length;
          this.save(KEY_MINISTRIES, ministries);
        }

        // Upgrade requesting church member to active ministry member
        const users = this.getUsers();
        const user = users.find(u => u.id === req.userId);
        if (user) {
          user.role = 'ministry_member';
          user.roleTitle = 'Ministry Member';
          user.approvalStatus = 'active';
          if (!user.ministryIds) user.ministryIds = [];
          if (!user.ministryIds.includes(req.ministryId)) {
            user.ministryIds.push(req.ministryId);
          }
          this.save(KEY_USERS, users);

          // Update in Supabase Cloud
          if (supabase) {
            supabase.from('church_members_auth').update({
              role: 'ministry_member',
              role_title: 'Ministry Member',
              updated_at: new Date().toISOString()
            }).eq('id', req.userId).then();
          }

          // Add to MinistryStore member list
          try {
            MinistryStore.addMember({
              userId: user.id,
              name: user.name,
              role: 'volunteer',
              roleTitle: 'Ministry Member',
              avatar: user.avatar || '/icons/church-logo.png',
              ministryId: req.ministryId as MinistryId,
              joinedDate: new Date().toISOString().split('T')[0]
            });
          } catch (e) {
            console.warn('MinistryStore.addMember fallback:', e);
          }

          // Send approval notification to user
          this.addNotification({
            userId: user.id,
            type: 'system',
            title: 'Ministry Application Approved!',
            message: `Praise God! Your request to join the ${req.ministryName} has been approved by the Super Admin & pastoral team. You now have full access to your ministry workspace.`,
            linkRoute: 'ministries'
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('bjc_users_change'));
            window.dispatchEvent(new Event('bjc_auth_change'));
          }
        }
      } else {
        // Declined
        this.addNotification({
          userId: req.userId,
          type: 'system',
          title: 'Ministry Application Update',
          message: `Your request to join the ${req.ministryName} was reviewed. Thank you for your servant heart to serve at Beholding Jesus Church!`,
          linkRoute: 'ministries'
        });
      }
    }
    this.save(KEY_JOIN_REQUESTS, requests);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bjc_join_requests_change'));
    }
    return requests;
  }

  // --- ANNOUNCEMENTS ---
  static getAnnouncements(): Announcement[] {
    return this.load<Announcement[]>(KEY_ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  static async fetchAnnouncementsFromCloud(): Promise<Announcement[]> {
    if (!supabase) return this.getAnnouncements();
    try {
      const { data, error } = await supabase
        .from('church_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        // FILTER: Hide drafts and unpublished announcements from regular members
        const now = new Date();
        const publishedOnly = data.filter((d: any) => {
          if (d.status === 'draft' || d.priority === 'draft') return false;
          if (d.content && typeof d.content === 'string' && d.content.startsWith('[DRAFT]')) return false;
          if (d.status === 'scheduled' && d.event_date) {
            return new Date(d.event_date) <= now;
          }
          return true;
        });

        const mapped: Announcement[] = publishedOnly.map((d: any) => {
          const rawContent = d.content || d.description || '';
          const cleanContent = typeof rawContent === 'string' ? rawContent.replace(/^\[DRAFT\]\s*/, '') : rawContent;

          return {
            id: d.id,
            title: d.title,
            content: cleanContent,
            category: d.category || 'General Church',
            date: d.date || (d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            priority: d.priority === 'pinned' ? 'pinned' : (d.priority === 'high' ? 'high' : 'normal'),
            isImportant: d.priority === 'pinned' || d.priority === 'high',
            isRead: d.is_read || false,
            authorName: d.author_name || 'Pastor Daniel Santos',
            authorRole: d.author_role || 'Senior Pastor',
            targetAudience: d.target_audience || 'all',
            coverImage: d.cover_image || d.image_url || undefined
          };
        });
        this.save(KEY_ANNOUNCEMENTS, mapped);

        // Notify UI listeners in real-time
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bjc_announcements_updated', { detail: mapped }));
        }

        return mapped;
      }
    } catch (e) {
      console.warn('fetchAnnouncementsFromCloud error:', e);
    }
    return this.getAnnouncements();
  }

  static subscribeToAnnouncementsRealtime(onUpdate: (announcements: Announcement[]) => void): () => void {
    if (!supabase) return () => {};

    try {
      const channel = supabase
        .channel('public:church_announcements_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'church_announcements' },
          async () => {
            const fresh = await ChurchDataStore.fetchAnnouncementsFromCloud();
            onUpdate(fresh);
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  }

  static saveAnnouncement(ann: Omit<Announcement, 'id'> & { id?: string }): Announcement {
    const list = this.getAnnouncements();
    let saved: Announcement;
    if (ann.id) {
      const idx = list.findIndex(a => a.id === ann.id);
      list[idx] = { ...list[idx], ...ann };
      saved = list[idx];
    } else {
      saved = {
        ...ann,
        id: `ann-${Date.now()}`,
        isRead: false
      };
      list.unshift(saved);
    }
    this.save(KEY_ANNOUNCEMENTS, list);

    if (supabase) {
      supabase.from('church_announcements').upsert({
        id: saved.id,
        title: saved.title,
        content: saved.content,
        category: saved.category,
        date: saved.date,
        priority: saved.priority || 'normal',
        is_important: (saved as any).isImportant ?? (saved.priority === 'high' || saved.priority === 'pinned'),
        is_read: saved.isRead || false,
        author_name: saved.authorName,
        author_role: saved.authorRole,
        target_audience: saved.targetAudience || 'all',
        cover_image: saved.coverImage
      }).then();
    }

    return saved;
  }

  // --- EVENTS ---
  static getEvents(): ChurchEvent[] {
    return this.load<ChurchEvent[]>(KEY_EVENTS, INITIAL_EVENTS);
  }

  static async fetchEventsFromCloud(): Promise<ChurchEvent[]> {
    if (!supabase) return this.getEvents();
    try {
      const { data, error } = await supabase
        .from('church_events')
        .select('*')
        .order('date', { ascending: true });

      if (data && !error) {
        const mapped: ChurchEvent[] = data.map(d => ({
          id: d.id,
          title: d.title,
          description: d.description,
          date: d.date,
          startTime: d.start_time,
          endTime: d.end_time,
          location: d.location,
          category: d.category,
          coverImage: d.cover_image,
          organizerName: d.organizer_name,
          capacity: d.capacity,
          attendeesCount: d.attendees_count,
          registeredUserIds: Array.isArray(d.registered_user_ids) ? d.registered_user_ids : [],
          requiresRegistration: d.requires_registration
        }));
        this.save(KEY_EVENTS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('fetchEventsFromCloud error:', e);
    }
    return this.getEvents();
  }

  static saveEvent(ev: ChurchEvent): ChurchEvent {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.id === ev.id);
    if (idx >= 0) {
      events[idx] = ev;
    } else {
      events.unshift(ev);
    }
    this.save(KEY_EVENTS, events);

    if (supabase) {
      supabase.from('church_events').upsert({
        id: ev.id,
        title: ev.title,
        description: ev.description,
        date: ev.date,
        start_time: ev.startTime,
        end_time: ev.endTime,
        location: ev.location,
        category: ev.category,
        cover_image: ev.coverImage,
        organizer_name: ev.organizerName,
        capacity: ev.capacity,
        attendees_count: ev.attendeesCount,
        registered_user_ids: ev.registeredUserIds,
        requires_registration: ev.requiresRegistration
      }).then();
    }
    return ev;
  }

  static toggleEventRegistration(eventId: string): ChurchEvent | null {
    const events = this.getEvents();
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();
    const ev = events.find(e => e.id === eventId);
    if (!ev) return null;

    if (ev.registeredUserIds.includes(user.id)) {
      ev.registeredUserIds = ev.registeredUserIds.filter(id => id !== user.id);
    } else {
      ev.registeredUserIds.push(user.id);
    }
    ev.attendeesCount = ev.registeredUserIds.length;
    this.save(KEY_EVENTS, events);

    if (supabase) {
      supabase.from('church_events').update({
        attendees_count: ev.attendeesCount,
        registered_user_ids: ev.registeredUserIds
      }).eq('id', eventId).then();
    }

    return ev;
  }

  // --- PRAYER REQUESTS & TESTIMONIES ---
  static getPrayerRequests(): PrayerRequest[] {
    const list = this.load<PrayerRequest[]>(KEY_PRAYERS, INITIAL_PRAYER_REQUESTS);
    const user = this.getCurrentUser();
    // Filter private prayer requests: visible only to creator or pastoral leadership
    return list.filter(p => {
      if (p.visibility === 'public') return true;
      if (!user) return false;
      if (p.userId === user.id) return true;
      if (['super_admin', 'church_admin', 'pastor'].includes(user.role)) return true;
      return false;
    });
  }

  static async fetchPrayerRequestsFromCloud(): Promise<PrayerRequest[]> {
    if (!supabase) return this.getPrayerRequests();
    try {
      const { data, error } = await supabase
        .from('church_prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        // Exclude system administrative join requests & account recovery requests
        const prayersOnly = data.filter((d: any) => 
          d.category !== 'sys_ministry_join_request' && 
          d.category !== 'sys_account_recovery'
        );
        const mapped: PrayerRequest[] = prayersOnly.map(d => ({
          id: d.id,
          userId: d.user_id,
          authorName: d.author_name,
          isAnonymous: d.is_anonymous,
          category: d.category,
          title: d.title,
          description: d.description,
          visibility: d.visibility,
          targetMinistryId: d.target_ministry_id,
          prayingCount: d.praying_count,
          prayingUserIds: Array.isArray(d.praying_user_ids) ? d.praying_user_ids : [],
          isAnswered: d.is_answered,
          testimonyText: d.testimony_text,
          createdAt: d.created_at
        }));
        this.save(KEY_PRAYERS, mapped);
        return this.getPrayerRequests();
      }
    } catch (e) {
      console.warn('fetchPrayerRequestsFromCloud error:', e);
    }
    return this.getPrayerRequests();
  }

  static submitPrayerRequest(prayer: {
    title: string;
    description: string;
    category: string;
    visibility: PrayerRequest['visibility'];
    isAnonymous: boolean;
    targetMinistryId?: string;
  }): PrayerRequest {
    const list = this.load<PrayerRequest[]>(KEY_PRAYERS, INITIAL_PRAYER_REQUESTS);
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();

    const newPrayer: PrayerRequest = {
      id: `pray-${Date.now()}`,
      userId: user.id,
      authorName: prayer.isAnonymous ? 'Church Member (Anonymous)' : user.name,
      isAnonymous: prayer.isAnonymous,
      category: prayer.category || 'General',
      title: prayer.title,
      description: prayer.description,
      visibility: prayer.visibility,
      targetMinistryId: prayer.targetMinistryId,
      prayingCount: 1,
      prayingUserIds: [user.id],
      isAnswered: false,
      createdAt: new Date().toISOString()
    };

    list.unshift(newPrayer);
    this.save(KEY_PRAYERS, list);

    if (supabase) {
      supabase.from('church_prayer_requests').insert({
        id: newPrayer.id,
        user_id: newPrayer.userId,
        author_name: newPrayer.authorName,
        is_anonymous: newPrayer.isAnonymous,
        category: newPrayer.category,
        title: newPrayer.title,
        description: newPrayer.description,
        visibility: newPrayer.visibility,
        target_ministry_id: newPrayer.targetMinistryId,
        praying_count: newPrayer.prayingCount,
        praying_user_ids: newPrayer.prayingUserIds,
        is_answered: newPrayer.isAnswered,
        testimony_text: newPrayer.testimonyText,
        created_at: newPrayer.createdAt
      }).then();
    }

    return newPrayer;
  }

  static togglePraying(prayerId: string): PrayerRequest | null {
    const list = this.load<PrayerRequest[]>(KEY_PRAYERS, INITIAL_PRAYER_REQUESTS);
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();
    const item = list.find(p => p.id === prayerId);
    if (!item) return null;

    if (!item.prayingUserIds) item.prayingUserIds = [];

    if (item.prayingUserIds.includes(user.id)) {
      item.prayingUserIds = item.prayingUserIds.filter(id => id !== user.id);
    } else {
      item.prayingUserIds.push(user.id);
    }
    item.prayingCount = item.prayingUserIds.length;
    this.save(KEY_PRAYERS, list);

    if (supabase) {
      supabase.from('church_prayer_requests').update({
        praying_count: item.prayingCount,
        praying_user_ids: item.prayingUserIds
      }).eq('id', prayerId).then();
    }

    return item;
  }

  static markPrayerAnswered(prayerId: string, testimonyText: string): PrayerRequest | null {
    const list = this.load<PrayerRequest[]>(KEY_PRAYERS, INITIAL_PRAYER_REQUESTS);
    const item = list.find(p => p.id === prayerId);
    if (!item) return null;

    item.isAnswered = true;
    item.testimonyText = testimonyText;
    this.save(KEY_PRAYERS, list);

    if (supabase) {
      supabase.from('church_prayer_requests').update({
        is_answered: true,
        testimony_text: testimonyText
      }).eq('id', prayerId).then();
    }

    return item;
  }

  // --- COMMUNITY POSTS ---
  static getPosts(): CommunityPost[] {
    return this.load<CommunityPost[]>(KEY_POSTS, INITIAL_POSTS);
  }

  static async fetchPostsFromCloud(): Promise<CommunityPost[]> {
    if (!supabase) return this.getPosts();
    try {
      const { data, error } = await supabase
        .from('church_community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        const mapped: CommunityPost[] = data.map(d => ({
          id: d.id,
          userId: d.user_id,
          authorName: d.author_name,
          authorAvatar: d.author_avatar,
          authorRole: d.author_role,
          content: d.content,
          imageUrl: d.image_url,
          likesCount: d.likes_count,
          likedUserIds: Array.isArray(d.liked_user_ids) ? d.liked_user_ids : [],
          commentsCount: d.comments_count,
          createdAt: d.created_at
        }));
        this.save(KEY_POSTS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('fetchPostsFromCloud error:', e);
    }
    return this.getPosts();
  }

  static createPost(content: string, imageUrl?: string): CommunityPost {
    const posts = this.getPosts();
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.roleTitle,
      content,
      imageUrl,
      likesCount: 0,
      likedUserIds: [],
      commentsCount: 0,
      createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    this.save(KEY_POSTS, posts);

    if (supabase) {
      supabase.from('church_community_posts').insert({
        id: newPost.id,
        user_id: newPost.userId,
        author_name: newPost.authorName,
        author_avatar: newPost.authorAvatar,
        author_role: newPost.authorRole,
        content: newPost.content,
        image_url: newPost.imageUrl,
        likes_count: 0,
        liked_user_ids: [],
        comments_count: 0,
        created_at: newPost.createdAt
      }).then();
    }

    return newPost;
  }

  static togglePostLike(postId: string): CommunityPost | null {
    const posts = this.getPosts();
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    if (!post.likedUserIds) post.likedUserIds = [];

    if (post.likedUserIds.includes(user.id)) {
      post.likedUserIds = post.likedUserIds.filter(id => id !== user.id);
    } else {
      post.likedUserIds.push(user.id);
    }
    post.likesCount = post.likedUserIds.length;
    this.save(KEY_POSTS, posts);

    if (supabase) {
      supabase.from('church_community_posts').update({
        likes_count: post.likesCount,
        liked_user_ids: post.likedUserIds
      }).eq('id', postId).then();
    }

    return post;
  }

  // --- COMMUNITY CHAT ROOMS & MESSAGES CLOUD SYNC ---
  static getChatRooms(): ChatRoom[] {
    return this.load<ChatRoom[]>(KEY_CHAT_ROOMS, INITIAL_CHAT_ROOMS);
  }

  static async fetchChatRoomsFromCloud(): Promise<any[]> {
    if (!supabase) return this.getChatRooms();
    try {
      const { data, error } = await supabase
        .from('church_chat_rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (data && !error) {
        return data;
      }
    } catch (e) {
      console.warn('fetchChatRoomsFromCloud error:', e);
    }
    return this.getChatRooms();
  }

  static async createChatRoomInCloud(room: {
    id: string;
    title: string;
    type?: string;
    symbol?: string;
    avatar?: string;
    createdBy?: string;
  }): Promise<void> {
    const list = this.getChatRooms();
    const newRoom: ChatRoom = {
      id: room.id,
      name: room.title,
      type: (room.type as any) || 'group',
      avatar: room.avatar || '/icons/church-logo.png',
      memberIds: room.createdBy ? [room.createdBy] : [],
      unreadCount: 0
    };
    list.unshift(newRoom);
    this.save(KEY_CHAT_ROOMS, list);

    if (supabase) {
      try {
        await supabase.from('church_chat_rooms').upsert({
          id: room.id,
          title: room.title,
          type: room.type || 'group',
          symbol: room.symbol || '💬',
          avatar: room.avatar || '/icons/church-logo.png',
          created_by: room.createdBy
        });
      } catch (e) {
        console.warn('createChatRoomInCloud error:', e);
      }
    }
  }

  static async deleteChatRoom(roomId: string): Promise<boolean> {
    const list = this.getChatRooms().filter(r => r.id !== roomId);
    this.save(KEY_CHAT_ROOMS, list);

    // Also remove local messages for this room
    const all = this.load<Record<string, any>>(KEY_CHAT_MESSAGES, {});
    delete all[roomId];
    this.save(KEY_CHAT_MESSAGES, all);

    if (supabase) {
      try {
        await supabase.from('church_chat_messages').delete().eq('room_id', roomId);
        await supabase.from('church_chat_rooms').delete().eq('id', roomId);
      } catch (e) {
        console.warn('deleteChatRoom cloud error:', e);
      }
    }

    return true;
  }

  static async fetchChatMessagesFromCloud(roomId: string): Promise<any[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('church_chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (data && !error) {
        return data;
      }
    } catch (e) {
      console.warn('fetchChatMessagesFromCloud error:', e);
    }
    return [];
  }

  static async fetchRecentChatActivity(limit: number = 300): Promise<any[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('church_chat_messages')
        .select('id, room_id, sender_id, sender_name, sender_avatar, sender_role, content, reactions, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (data && !error) {
        return data;
      }
    } catch (e) {
      console.warn('fetchRecentChatActivity error:', e);
    }
    return [];
  }

  static async sendChatMessageToCloud(params: {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    senderRole?: string;
    content: string;
    reactions?: any[];
  }): Promise<void> {
    // 1. Update local cached rooms for instant lobby ordering
    try {
      const rooms = this.getChatRooms();
      const nowIso = new Date().toISOString();
      const updatedRooms = rooms.map(r => {
        if (r.id === params.roomId) {
          return {
            ...r,
            lastMessage: params.content,
            lastMessageTime: nowIso
          };
        }
        return r;
      });
      this.save(KEY_CHAT_ROOMS, updatedRooms);
    } catch (_) {}

    if (!supabase) return;
    try {
      await supabase.from('church_chat_messages').insert({
        id: params.id,
        room_id: params.roomId,
        sender_id: params.senderId,
        sender_name: params.senderName,
        sender_avatar: params.senderAvatar || '/icons/church-logo.png',
        sender_role: params.senderRole || 'Church Member',
        content: params.content,
        reactions: params.reactions || [],
        is_delivered: true
      });

      // Update room last activity in Supabase if supported
      try {
        await supabase.from('church_chat_rooms').update({
          last_message: params.content,
          last_message_time: new Date().toISOString()
        }).eq('id', params.roomId);
      } catch (_) {}
    } catch (e) {
      console.warn('sendChatMessageToCloud error:', e);
    }
  }

  static async updateChatReactionsInCloud(messageId: string, reactions: any[]): Promise<void> {
    if (!supabase) return;
    try {
      await supabase.from('church_chat_messages').update({
        reactions
      }).eq('id', messageId);
    } catch (e) {
      console.warn('updateChatReactionsInCloud error:', e);
    }
  }

  static async deleteChatMessageFromCloud(messageId: string): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { error } = await supabase.from('church_chat_messages').delete().eq('id', messageId);
      return !error;
    } catch (e) {
      console.warn('deleteChatMessageFromCloud error:', e);
      return false;
    }
  }

  // --- COMMUNITY CHAT ---
  static getMessages(roomId: string): ChatMessage[] {
    const all = this.load<Record<string, ChatMessage[]>>(KEY_CHAT_MESSAGES, {});
    return all[roomId] || [];
  }

  static sendMessage(roomId: string, content: string, replyTo?: { id: string; text: string; sender: string }): ChatMessage {
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();
    const all = this.load<Record<string, ChatMessage[]>>(KEY_CHAT_MESSAGES, {});
    if (!all[roomId]) all[roomId] = [];

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderRole: user.roleTitle,
      content,
      replyToId: replyTo?.id,
      replyToText: replyTo?.text,
      replyToSender: replyTo?.sender,
      reactions: {},
      isReadBy: [user.id],
      createdAt: new Date().toISOString()
    };

    all[roomId].push(newMsg);
    this.save(KEY_CHAT_MESSAGES, all);

    // Update room last message
    const rooms = this.getChatRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.lastMessage = {
        text: content,
        senderName: user.name,
        timestamp: 'Just now'
      };
      this.save(KEY_CHAT_ROOMS, rooms);
    }

    return newMsg;
  }

  static toggleReaction(roomId: string, messageId: string, emoji: string): ChatMessage | null {
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();
    const all = this.load<Record<string, ChatMessage[]>>(KEY_CHAT_MESSAGES, {});
    const roomMsgs = all[roomId] || [];
    const msg = roomMsgs.find(m => m.id === messageId);
    if (!msg) return null;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    if (msg.reactions[emoji].includes(user.id)) {
      msg.reactions[emoji] = msg.reactions[emoji].filter(id => id !== user.id);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji].push(user.id);
    }

    this.save(KEY_CHAT_MESSAGES, all);
    return msg;
  }

  static deleteMessage(roomId: string, messageId: string): void {
    const all = this.load<Record<string, ChatMessage[]>>(KEY_CHAT_MESSAGES, {});
    if (all[roomId]) {
      all[roomId] = all[roomId].filter(m => m.id !== messageId);
      this.save(KEY_CHAT_MESSAGES, all);
    }
  }

  // --- NOTIFICATIONS ---
  static getNotifications(): NotificationItem[] {
    const list = this.load<NotificationItem[]>(KEY_NOTIFICATIONS, []);
    // Filter out old mock notifications
    return list.filter(n => !['notif-1', 'notif-2', 'notif-3'].includes(n.id));
  }

  static markAllNotificationsRead(): NotificationItem[] {
    const list = this.getNotifications();
    list.forEach(n => n.isRead = true);
    this.save(KEY_NOTIFICATIONS, list);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bjc_notifications_change'));
    }
    return list;
  }

  static clearNotifications(): void {
    this.save(KEY_NOTIFICATIONS, []);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bjc_notifications_change'));
    }
  }

  static addNotification(notif: Partial<NotificationItem>): NotificationItem {
    const list = this.getNotifications();
    const user = this.getCurrentUser() || this.getRequiredCurrentUser();
    const newNotif: NotificationItem = {
      id: notif.id || `notif-${Date.now()}`,
      userId: notif.userId || user.id,
      type: notif.type || 'system',
      title: notif.title || 'Notification',
      message: notif.message || '',
      linkRoute: notif.linkRoute || 'home',
      isRead: false,
      createdAt: notif.createdAt || new Date().toISOString()
    };
    list.unshift(newNotif);
    this.save(KEY_NOTIFICATIONS, list);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bjc_notifications_change'));
    }
    return newNotif;
  }

  // --- WORSHIP HUB PREFERENCES SCOPED TO USER ---
  static getUserWorshipPreferences(userId?: string): { favoriteSongIds: string[]; preferredKey?: string } {
    const uid = userId || (this.getCurrentUser() ? this.getCurrentUser()!.id : this.getRequiredCurrentUser().id);
    const all = this.load<Record<string, { favoriteSongIds: string[]; preferredKey?: string }>>(KEY_WORSHIP_PREFS, {});
    return all[uid] || { favoriteSongIds: ['song-1', 'song-2'] };
  }

  static toggleFavoriteSong(songId: string, userId?: string): string[] {
    const uid = userId || (this.getCurrentUser() ? this.getCurrentUser()!.id : this.getRequiredCurrentUser().id);
    const all = this.load<Record<string, { favoriteSongIds: string[]; preferredKey?: string }>>(KEY_WORSHIP_PREFS, {});
    const current = all[uid] || { favoriteSongIds: ['song-1', 'song-2'] };
    
    if (current.favoriteSongIds.includes(songId)) {
      current.favoriteSongIds = current.favoriteSongIds.filter(id => id !== songId);
    } else {
      current.favoriteSongIds.push(songId);
    }
    all[uid] = current;
    this.save(KEY_WORSHIP_PREFS, all);
    return current.favoriteSongIds;
  }

  static setUserPreferredKey(preferredKey: string, userId?: string): void {
    const uid = userId || (this.getCurrentUser() ? this.getCurrentUser()!.id : this.getRequiredCurrentUser().id);
    const all = this.load<Record<string, { favoriteSongIds: string[]; preferredKey?: string }>>(KEY_WORSHIP_PREFS, {});
    const current = all[uid] || { favoriteSongIds: [] };
    current.preferredKey = preferredKey;
    all[uid] = current;
    this.save(KEY_WORSHIP_PREFS, all);
  }
}
