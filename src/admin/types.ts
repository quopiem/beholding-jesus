export type AnnouncementStatus = 'draft' | 'published' | 'scheduled';
export type AnnouncementPriority = 'pinned' | 'high' | 'normal';

export interface AdminAnnouncement {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string;
  cover_image?: string;
  category: string;
  date?: string;
  event_date?: string;
  expiration_date?: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  is_important?: boolean;
  is_read?: boolean;
  author_name: string;
  author_role: string;
  target_audience: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  action: 'CREATE_ANNOUNCEMENT' | 'EDIT_ANNOUNCEMENT' | 'DELETE_ANNOUNCEMENT' | 'PUBLISH_ANNOUNCEMENT' | 'DRAFT_ANNOUNCEMENT' | 'LOGIN' | 'IMAGE_UPLOAD';
  entity_type: string;
  entity_id?: string;
  details: string;
  performed_by: string;
  performed_by_name: string;
  created_at: string;
}

export interface AdminDashboardStats {
  totalMembers: number;
  totalAnnouncements: number;
  publishedCount: number;
  draftCount: number;
  scheduledCount: number;
  upcomingEventsCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'super_admin';
  role_title: string;
  avatar?: string;
}
