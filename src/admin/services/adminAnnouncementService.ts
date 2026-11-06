import { supabase } from '../../lib/supabase';
import { AdminAnnouncement, AdminAuditLog, AdminDashboardStats } from '../types';
import { AdminAuthService } from './adminAuthService';

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
              is_important: d.is_important ?? (d.priority === 'pinned' || d.priority === 'high'),
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
    const desc = data.description || data.content || '';
    const img = data.image_url || data.cover_image || '';

    const announcement: AdminAnnouncement = {
      id,
      title: data.title?.trim() || 'Untitled Announcement',
      description: desc,
      content: desc,
      category: data.category || 'General Church',
      date: data.date || now.split('T')[0],
      event_date: data.event_date || undefined,
      expiration_date: data.expiration_date || undefined,
      status: data.status || 'published',
      priority: data.priority || 'normal',
      is_important: data.priority === 'pinned' || data.priority === 'high',
      is_read: false,
      author_name: data.author_name || admin?.name || 'Pastor Daniel Santos',
      author_role: data.author_role || admin?.role_title || 'Super Admin',
      target_audience: data.target_audience || 'all',
      cover_image: img || undefined,
      image_url: img || undefined,
      created_by: data.created_by || admin?.id || 'usr-owner-001',
      created_at: data.created_at || now,
      updated_at: now
    };

    // Update local list safely
    const existingIndex = list.findIndex(a => a.id === id);
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

    // Sync to Supabase Cloud
    if (supabase) {
      try {
        const fullPayload = {
          id: announcement.id,
          title: announcement.title,
          content: announcement.description || announcement.content,
          category: announcement.category,
          date: announcement.date,
          status: announcement.status,
          priority: announcement.status === 'draft' ? 'draft' : announcement.priority,
          is_important: announcement.is_important,
          is_read: false,
          author_name: announcement.author_name,
          author_role: announcement.author_role,
          target_audience: announcement.target_audience,
          cover_image: announcement.cover_image || announcement.image_url || null
        };

        const { error: fullErr } = await supabase.from('church_announcements').upsert(fullPayload);
        if (fullErr) {
          console.warn('Supabase church_announcements upsert error:', fullErr.message);
        }
      } catch (err: any) {
        console.warn('Supabase announcement upsert error:', err);
      }
    }

    // Immediately trigger feed sync event so Home feed & Pinned hero update instantly
    try {
      window.dispatchEvent(new CustomEvent('bjc_feed_change'));
    } catch {}

    // Log Activity
    try {
      await this.logActivity(
        isNew ? 'CREATE_ANNOUNCEMENT' : 'EDIT_ANNOUNCEMENT',
        `${isNew ? 'Created' : 'Updated'} announcement: "${announcement.title}" (${announcement.status})`,
        announcement.id
      );
    } catch {}

    return announcement;
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
      window.dispatchEvent(new CustomEvent('bjc_feed_change'));
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
   * Retrieves dashboard analytics & KPI metrics
   */
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    const announcements = await this.getAllAnnouncements();
    let membersCount = 5;
    let eventsCount = 3;

    if (supabase) {
      try {
        const [membersRes, eventsRes] = await Promise.all([
          supabase.from('church_members_auth').select('id', { count: 'exact', head: true }),
          supabase.from('church_events').select('id', { count: 'exact', head: true })
        ]);

        if (typeof membersRes.count === 'number') membersCount = membersRes.count;
        if (typeof eventsRes.count === 'number') eventsCount = eventsRes.count;
      } catch (err) {
        console.warn('Dashboard stats count error:', err);
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

    // Save locally
    try {
      const raw = localStorage.getItem(KEY_LOCAL_AUDIT_LOGS);
      const existing: AdminAuditLog[] = raw ? JSON.parse(raw) : [];
      existing.unshift(log);
      localStorage.setItem(KEY_LOCAL_AUDIT_LOGS, JSON.stringify(existing.slice(0, 50)));
    } catch {
      // ignore
    }

    // Save to Supabase Cloud if available
    if (supabase) {
      try {
        await supabase.from('admin_audit_logs').insert({
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          details: log.details,
          performed_by: log.performed_by,
          performed_by_name: log.performed_by_name
        });
      } catch {
        // ignore if table not yet created
      }
    }
  }

  /**
   * Retrieves audit logs
   */
  static async getAuditLogs(): Promise<AdminAuditLog[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (data && !error && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            action: d.action,
            entity_type: d.entity_type,
            entity_id: d.entity_id,
            details: d.details,
            performed_by: d.performed_by,
            performed_by_name: d.performed_by_name || 'Super Admin',
            created_at: d.created_at
          }));
        }
      } catch {
        // ignore
      }
    }

    try {
      const raw = localStorage.getItem(KEY_LOCAL_AUDIT_LOGS);
      if (raw) return JSON.parse(raw);
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
