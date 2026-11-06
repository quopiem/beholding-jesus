import { supabase } from '../../lib/supabase';
import { AdminAnnouncement, AdminAuditLog, AdminDashboardStats } from '../types';
import { AdminAuthService } from './adminAuthService';
import { ChurchDataStore } from '../../services/churchDataStore';

const KEY_LOCAL_ANNOUNCEMENTS = 'bjc_admin_announcements_cache_v1';
const KEY_LOCAL_AUDIT_LOGS = 'bjc_admin_audit_logs_v1';

export class AdminAnnouncementService {
  /**
   * Loads local announcements cache
   */
  private static getLocalAnnouncements(): AdminAnnouncement[] {
    try {
      const raw = localStorage.getItem(KEY_LOCAL_ANNOUNCEMENTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [
      {
        id: 'ann-1',
        title: 'Upcoming Expository Series: Walking in Colossians',
        description: 'Starting this Sunday, Pastor Daniel Santos will lead the church through a verse-by-verse journey in Colossians, beholding the preeminence and sufficiency of Jesus Christ.',
        content: 'Starting this Sunday, Pastor Daniel Santos will lead the church through a verse-by-verse journey in Colossians, beholding the preeminence and sufficiency of Jesus Christ.',
        category: 'Sunday Services',
        date: '2026-11-04',
        event_date: '2026-11-08T09:00:00Z',
        status: 'published',
        priority: 'pinned',
        is_important: true,
        author_name: 'Pastor Daniel Santos',
        author_role: 'Senior Pastor',
        target_audience: 'all',
        cover_image: '/images/church-service-banner.png',
        image_url: '/images/church-service-banner.png',
        created_by: 'usr-owner-001',
        created_at: '2026-11-03T22:00:21Z',
        updated_at: '2026-11-03T22:00:21Z'
      }
    ];
  }

  private static saveLocalAnnouncements(list: AdminAnnouncement[]): void {
    try {
      localStorage.setItem(KEY_LOCAL_ANNOUNCEMENTS, JSON.stringify(list));
    } catch (err) {
      console.warn('Local storage quota warning while caching announcements, applying lightweight quota fallback:', err);
      try {
        // Keep newest 15 announcements, preserve top 3 with images, lightweight for older
        const lightweight = list.slice(0, 15).map((a, idx) => ({
          ...a,
          cover_image: (idx > 2 && a.cover_image && a.cover_image.startsWith('data:')) ? undefined : a.cover_image,
          image_url: (idx > 2 && a.image_url && a.image_url.startsWith('data:')) ? undefined : a.image_url
        }));
        localStorage.setItem(KEY_LOCAL_ANNOUNCEMENTS, JSON.stringify(lightweight));
      } catch (innerErr) {
        console.warn('Could not save lightweight announcements to localStorage:', innerErr);
      }
    }
  }

  /**
   * Retrieves all announcements from Supabase Cloud (with local fallback)
   */
  static async getAllAnnouncements(): Promise<AdminAnnouncement[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('church_announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          const mapped: AdminAnnouncement[] = data.map((d: any) => {
            const rawContent = d.content || d.description || '';
            const isDraft = d.status === 'draft' || d.priority === 'draft' || rawContent.startsWith('[DRAFT]');
            const cleanContent = rawContent.replace(/^\[DRAFT\]\s*/, '');

            return {
              id: d.id,
              title: d.title || 'Untitled Announcement',
              description: d.description || cleanContent,
              content: cleanContent,
              category: d.category || 'General Church',
              date: d.date || new Date().toISOString().split('T')[0],
              event_date: d.event_date || undefined,
              expiration_date: d.expiration_date || undefined,
              status: isDraft ? 'draft' : ((d.status as any) || 'published'),
              priority: d.priority === 'draft' ? 'normal' : ((d.priority as any) || 'normal'),
              is_important: d.priority === 'pinned' || d.priority === 'high',
              is_read: d.is_read ?? false,
              author_name: d.author_name || 'Pastor Daniel Santos',
              author_role: d.author_role || 'Senior Pastor',
              target_audience: d.target_audience || 'all',
              cover_image: d.cover_image || d.image_url || undefined,
              image_url: d.image_url || d.cover_image || undefined,
              created_by: d.created_by || 'usr-owner-001',
              created_at: d.created_at || new Date().toISOString(),
              updated_at: d.updated_at || new Date().toISOString()
            };
          });

          this.saveLocalAnnouncements(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Error fetching announcements from Supabase:', err);
      }
    }

    return this.getLocalAnnouncements();
  }

  /**
   * Creates or updates an announcement in Supabase Cloud
   */
  static async saveAnnouncement(data: Partial<AdminAnnouncement>): Promise<AdminAnnouncement> {
    const list = await this.getAllAnnouncements();
    const admin = AdminAuthService.getCurrentAdmin();
    const now = new Date().toISOString();
    const isNew = !data.id;

    const id = data.id || `ann-${Date.now()}`;
    const existingIndex = list.findIndex(a => a.id === id);
    const existing = existingIndex >= 0 ? list[existingIndex] : null;

    const title = data.title !== undefined ? data.title.trim() : (existing?.title || 'Untitled Announcement');
    const desc = data.description !== undefined ? data.description : (data.content !== undefined ? data.content : (existing?.description || existing?.content || ''));
    const category = data.category !== undefined ? data.category : (existing?.category || 'General Church');
    const status = data.status !== undefined ? data.status : (existing?.status || 'published');
    const priority = data.priority !== undefined ? data.priority : (existing?.priority || 'normal');
    const isPinned = priority === 'pinned';
    const isImportant = isPinned || priority === 'high';
    const img = data.cover_image || data.image_url || existing?.cover_image || existing?.image_url || '';
    const eventDate = data.event_date !== undefined ? data.event_date : existing?.event_date;
    const expirationDate = data.expiration_date !== undefined ? data.expiration_date : existing?.expiration_date;
    const authorName = data.author_name || existing?.author_name || admin?.name || 'Pastor Daniel Santos';
    const authorRole = data.author_role || existing?.author_role || admin?.role_title || 'Super Admin';
    const targetAudience = data.target_audience || existing?.target_audience || 'all';

    const announcement: AdminAnnouncement = {
      id,
      title,
      description: desc,
      content: desc,
      category,
      date: data.date || existing?.date || now.split('T')[0],
      event_date: eventDate,
      expiration_date: expirationDate,
      status,
      priority,
      is_important: isImportant,
      is_read: false,
      author_name: authorName,
      author_role: authorRole,
      target_audience: targetAudience,
      cover_image: img || undefined,
      image_url: img || undefined,
      created_by: data.created_by || existing?.created_by || admin?.id || 'usr-owner-001',
      created_at: existing?.created_at || data.created_at || now,
      updated_at: now
    };

    // Update local admin cache safely
    if (existingIndex >= 0) {
      list[existingIndex] = announcement;
    } else {
      list.unshift(announcement);
    }
    try {
      this.saveLocalAnnouncements(list);
    } catch (e) {
      console.warn('saveLocalAnnouncements error suppressed:', e);
    }

    // DIRECT FEED POSTS SYNC: update bjc_feed_posts_v2 so member hero & feed update instantly
    try {
      const feedKey = 'bjc_feed_posts_v2';
      const rawFeed = localStorage.getItem(feedKey);
      if (rawFeed) {
        const feedPosts = JSON.parse(rawFeed);
        if (Array.isArray(feedPosts)) {
          const matchIdx = feedPosts.findIndex(p => p.id === announcement.id);
          if (matchIdx >= 0) {
            feedPosts[matchIdx].announcementTitle = announcement.title;
            feedPosts[matchIdx].content = announcement.content || announcement.description || feedPosts[matchIdx].content;
            feedPosts[matchIdx].category = announcement.category;
            feedPosts[matchIdx].isPinned = isPinned;
            feedPosts[matchIdx].announcementPriority = isPinned ? 'pinned' : (priority === 'high' ? 'high' : 'normal');
            feedPosts[matchIdx].pinnedAt = isPinned ? (feedPosts[matchIdx].pinnedAt || now) : undefined;
            feedPosts[matchIdx].updatedAt = now;
            if (announcement.cover_image || announcement.image_url) {
              feedPosts[matchIdx].imageUrls = [announcement.cover_image || announcement.image_url!];
            }
          } else if (announcement.status === 'published') {
            feedPosts.unshift({
              id: announcement.id,
              authorId: announcement.created_by,
              authorName: announcement.author_name,
              authorAvatar: '/icons/church-logo.png',
              authorRole: announcement.author_role,
              ministryLabel: 'Pastoral Leadership',
              content: announcement.description || announcement.content,
              postType: 'announcement',
              category: announcement.category,
              imageUrls: announcement.cover_image ? [announcement.cover_image] : (announcement.image_url ? [announcement.image_url] : []),
              createdAt: announcement.created_at,
              updatedAt: now,
              isHidden: false,
              commentsEnabled: true,
              announcementTitle: announcement.title,
              announcementPriority: isPinned ? 'pinned' : (priority === 'high' ? 'high' : 'normal'),
              isPinned: isPinned,
              pinnedAt: isPinned ? now : undefined,
              eventDate: announcement.event_date || announcement.date,
              reactions: [],
              reactionCounts: { like: 0, love: 0, care: 0, celebrate: 0, pray: 0 },
              comments: [],
              commentsCount: 0
            });
          }
          localStorage.setItem(feedKey, JSON.stringify(feedPosts));
        }
      }
    } catch (feedSyncErr) {
      console.warn('Feed sync error in saveAnnouncement:', feedSyncErr);
    }

    // Sync to Supabase Cloud
    if (supabase) {
      try {
        const fullPayload: any = {
          id: announcement.id,
          title: announcement.title,
          content: announcement.description || announcement.content,
          category: announcement.category,
          date: announcement.date,
          status: announcement.status,
          priority: isPinned ? 'pinned' : (announcement.priority || 'normal'),
          is_important: isPinned,
          is_read: false,
          author_name: announcement.author_name,
          author_role: announcement.author_role,
          target_audience: announcement.target_audience,
          cover_image: announcement.cover_image || announcement.image_url || null
        };

        const { error: fullErr } = await supabase.from('church_announcements').upsert(fullPayload);
        if (fullErr) {
          console.warn('Supabase church_announcements upsert error, trying fallback without status column:', fullErr.message);
          delete fullPayload.status;
          await supabase.from('church_announcements').upsert(fullPayload);
        }

        // Direct explicit update of priority & is_important to guarantee immediate unpin in Supabase
        await supabase.from('church_announcements').update({
          priority: isPinned ? 'pinned' : 'normal',
          is_important: isPinned
        }).eq('id', announcement.id);

      } catch (err: any) {
        console.warn('Supabase announcement upsert error:', err);
      }
    }

    // Immediately trigger feed sync event so Home feed & Pinned hero update instantly
    try {
      window.dispatchEvent(new CustomEvent('bjc_feed_change'));
      window.dispatchEvent(new CustomEvent('bjc_announcements_updated'));
    } catch {}

    // Log Activity
    try {
      await this.logActivity(
        isNew ? 'CREATE_ANNOUNCEMENT' : 'EDIT_ANNOUNCEMENT',
        `${isNew ? 'Created' : 'Updated'} announcement: "${announcement.title}" (${announcement.status}, ${isPinned ? 'pinned' : 'unpinned'})`,
        announcement.id
      );
    } catch {}

    return announcement;
  }

  /**
   * Dedicated 1-click Pin / Unpin announcement method
   */
  static async togglePin(id: string, isPinned: boolean): Promise<boolean> {
    const list = await this.getAllAnnouncements();
    const item = list.find(a => a.id === id);
    if (!item) return false;

    await this.saveAnnouncement({
      id: item.id,
      priority: isPinned ? 'pinned' : 'normal',
      is_important: isPinned
    });

    return true;
  }

  /**
   * Deletes an announcement from Supabase Cloud
   */
  static async deleteAnnouncement(id: string): Promise<boolean> {
    const list = await this.getAllAnnouncements();
    const target = list.find(a => a.id === id);
    const updated = list.filter(a => a.id !== id);
    this.saveLocalAnnouncements(updated);

    try {
      const deletedKey = 'bjc_deleted_feed_ids_v2';
      const existingDeleted = JSON.parse(localStorage.getItem(deletedKey) || '["post-ann-colossians", "post-ann-youth-ignite"]');
      if (!existingDeleted.includes(id)) {
        existingDeleted.push(id);
        localStorage.setItem(deletedKey, JSON.stringify(existingDeleted));
      }
      // Also remove from bjc_feed_posts_v2 directly
      const rawFeed = localStorage.getItem('bjc_feed_posts_v2');
      if (rawFeed) {
        const feedPosts = JSON.parse(rawFeed);
        if (Array.isArray(feedPosts)) {
          const filtered = feedPosts.filter(p => p.id !== id);
          localStorage.setItem('bjc_feed_posts_v2', JSON.stringify(filtered));
        }
      }
      window.dispatchEvent(new CustomEvent('bjc_feed_change'));
      window.dispatchEvent(new CustomEvent('bjc_announcements_updated'));
    } catch {}

    if (supabase) {
      try {
        await supabase.from('church_announcements').delete().eq('id', id);
        try {
          await supabase.from('announcements').delete().eq('id', id);
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn('Supabase delete announcement error:', err);
      }
    }

    if (target) {
      await this.logActivity(
        'DELETE_ANNOUNCEMENT',
        `Deleted announcement: "${target.title}"`,
        id
      );
    }

    return true;
  }

  /**
   * Toggles status: published, draft, or scheduled
   */
  static async setStatus(id: string, newStatus: 'draft' | 'published' | 'scheduled'): Promise<AdminAnnouncement | null> {
    const list = await this.getAllAnnouncements();
    const item = list.find(a => a.id === id);
    if (!item) return null;

    item.status = newStatus;
    item.updated_at = new Date().toISOString();
    return this.saveAnnouncement(item);
  }

  /**
   * Uploads cover photo to Supabase Storage bucket 'announcements'
   * Falls back gracefully to base64 Data URL if storage bucket is not yet provisioned.
   */
  static async uploadCoverPhoto(file: File): Promise<string> {
    const cleanFileName = `cover-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('announcements')
          .upload(cleanFileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (data && !error) {
          const { data: urlData } = supabase.storage
            .from('announcements')
            .getPublicUrl(cleanFileName);

          if (urlData?.publicUrl) {
            await this.logActivity('IMAGE_UPLOAD', `Uploaded cover photo: ${file.name}`);
            return urlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Supabase storage upload error, falling back to Data URL:', err);
      }
    }

    // Graceful fallback to lightweight compressed Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        if (!raw) {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          const maxDim = 850;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve(raw);
          }
        };
        img.onerror = () => resolve(raw);
        img.src = raw;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  /**
   * Retrieves dashboard analytics & KPI metrics (Fast & Non-blocking)
   */
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    const announcements = await this.getAllAnnouncements();
    let membersCount = 8;
    let eventsCount = 4;

    try {
      // Use instant local data as immediate baseline
      const localUsers = ChurchDataStore.getUsers();
      if (localUsers && localUsers.length > 0) {
        membersCount = localUsers.length;
      }
      const localEvents = ChurchDataStore.getEvents();
      if (localEvents && localEvents.length > 0) {
        eventsCount = localEvents.length;
      }
    } catch {
      // fallback
    }

    // Quick background check for member count with 2s timeout
    if (supabase) {
      try {
        const countPromise = supabase.from('church_members_auth').select('id', { count: 'exact', head: true });
        const timeoutPromise = new Promise<{ count: null }>((resolve) => setTimeout(() => resolve({ count: null }), 2000));
        const res = await Promise.race([countPromise, timeoutPromise]);
        if (res && typeof res.count === 'number') {
          membersCount = res.count;
        }
      } catch {
        // use local
      }
    }

    const publishedCount = announcements.filter(a => a.status === 'published').length;
    const draftCount = announcements.filter(a => a.status === 'draft').length;
    const scheduledCount = announcements.filter(a => a.status === 'scheduled').length;

    return {
      totalMembers: membersCount,
      totalAnnouncements: announcements.length,
      publishedCount,
      draftCount,
      scheduledCount,
      upcomingEventsCount: eventsCount
    };
  }

  /**
   * Records an admin action in the audit logs
   */
  static async logActivity(action: AdminAuditLog['action'], details: string, entityId?: string): Promise<void> {
    const admin = AdminAuthService.getCurrentAdmin();
    const log: AdminAuditLog = {
      id: `log-${Date.now()}`,
      action,
      entity_type: 'announcement',
      entity_id: entityId,
      details,
      performed_by: admin?.username || 'johnmiko',
      performed_by_name: admin?.name || 'John Miko Sarsalijo',
      created_at: new Date().toISOString()
    };

    // Save locally (instant)
    try {
      const raw = localStorage.getItem(KEY_LOCAL_AUDIT_LOGS);
      const existing: AdminAuditLog[] = raw ? JSON.parse(raw) : [];
      existing.unshift(log);
      localStorage.setItem(KEY_LOCAL_AUDIT_LOGS, JSON.stringify(existing.slice(0, 50)));
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves audit logs (Instant local-first)
   */
  static async getAuditLogs(): Promise<AdminAuditLog[]> {
    try {
      const raw = localStorage.getItem(KEY_LOCAL_AUDIT_LOGS);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch {
      // fallback
    }

    return [
      {
        id: 'log-1',
        action: 'LOGIN',
        entity_type: 'auth',
        details: 'Super Admin logged into BJC Admin Portal',
        performed_by: 'johnmiko',
        performed_by_name: 'John Miko Sarsalijo',
        created_at: new Date().toISOString()
      }
    ];
  }
}
