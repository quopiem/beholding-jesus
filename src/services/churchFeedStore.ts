import { 
  FeedPost, PostReaction, PostComment, PostReport, ModerationAuditLog,
  FeedReactionType, UserProfile, FEED_REACTIONS, FeedPostType, PrayerAudience 
} from '../types';
import { supabase } from '../lib/supabase';
import { ChurchDataStore } from './churchDataStore';

const KEY_FEED_POSTS = 'bjc_feed_posts_v11';
const KEY_REACTIONS = 'bjc_post_reactions_v11';
const KEY_COMMENTS = 'bjc_post_comments_v11';
const KEY_REPORTS = 'bjc_post_reports_v11';
const KEY_MODERATION_LOGS = 'bjc_moderation_logs_v11';
const KEY_DELETED_POST_IDS = 'bjc_deleted_feed_ids_v11';
const DEFAULT_DELETED_IDS: string[] = [];

// Helper to check if a user is an authorized Church Admin or Pastor
export const isChurchAdmin = (user?: UserProfile | null): boolean => {
  if (!user) return false;
  return (
    user.role === 'super_admin' || 
    user.role === 'church_admin' || 
    user.role === 'pastor' ||
    user.roleTitle?.toLowerCase().includes('pastor') ||
    user.roleTitle?.toLowerCase().includes('admin') ||
    user.roleTitle?.toLowerCase().includes('manager')
  );
};

// Feed is 100% clean and authentic — populated only by real church members
const INITIAL_FEED_POSTS: FeedPost[] = [];
const INITIAL_COMMENTS: PostComment[] = [];
const INITIAL_REACTIONS: PostReaction[] = [];

export class ChurchFeedStore {
  // In-memory cache holding full-fidelity cloud posts (including user-uploaded images)
  private static memoryPosts: FeedPost[] | null = null;
  private static feedHubChannel: any = null;
  private static _lastFeedFetchTime = 0;
  private static _cachedFeedResult: FeedPost[] = [];

  static getFeedHub() {
    if (!supabase) return null;
    if (!this.feedHubChannel) {
      this.feedHubChannel = supabase.channel('bjc-feed-realtime-hub', {
        config: { broadcast: { self: false } }
      });
      this.feedHubChannel.subscribe();
    }
    return this.feedHubChannel;
  }

  static broadcastFeedEvent(event: string, payload: any) {
    try {
      const hub = this.getFeedHub();
      if (hub) {
        hub.send({
          type: 'broadcast',
          event,
          payload
        });
      }
    } catch (e) {
      console.warn('broadcastFeedEvent error:', e);
    }
  }

  private static load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, data: T): void {
    if (key === KEY_FEED_POSTS && Array.isArray(data)) {
      this.memoryPosts = data as FeedPost[];
    }
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('bjc_feed_change'));
    } catch (e) {
      console.warn(`Failed to save to localStorage (${key}), keeping live data in memory:`, e);
      window.dispatchEvent(new CustomEvent('bjc_feed_change'));
    }
  }

  static getDeletedIds(): string[] {
    return this.load<string[]>(KEY_DELETED_POST_IDS, DEFAULT_DELETED_IDS);
  }

  static addDeletedId(id: string): void {
    const list = this.getDeletedIds();
    if (!list.includes(id)) {
      list.push(id);
      this.save(KEY_DELETED_POST_IDS, list);
    }
  }

  // --- RAW GETTERS ---
  private static getRawPosts(): FeedPost[] {
    const deleted = this.getDeletedIds();
    if (this.memoryPosts && this.memoryPosts.length > 0) {
      return this.memoryPosts.filter(p => !deleted.includes(p.id));
    }
    const posts = this.load<FeedPost[]>(KEY_FEED_POSTS, INITIAL_FEED_POSTS);
    const existingIds = new Set(posts.map(p => p.id));
    let hasNew = false;
    for (const initPost of INITIAL_FEED_POSTS) {
      if (!existingIds.has(initPost.id) && !deleted.includes(initPost.id)) {
        posts.push(initPost);
        hasNew = true;
      }
    }
    if (hasNew) {
      this.save(KEY_FEED_POSTS, posts);
    }
    return posts.filter(p => !deleted.includes(p.id));
  }

  private static getRawReactions(): PostReaction[] {
    return this.load<PostReaction[]>(KEY_REACTIONS, INITIAL_REACTIONS);
  }

  private static getRawComments(): PostComment[] {
    return this.load<PostComment[]>(KEY_COMMENTS, INITIAL_COMMENTS);
  }

  static getReports(): PostReport[] {
    return this.load<PostReport[]>(KEY_REPORTS, []);
  }

  static getAuditLogs(): ModerationAuditLog[] {
    return this.load<ModerationAuditLog[]>(KEY_MODERATION_LOGS, []);
  }

  // --- HIGH LEVEL FEED RETRIEVAL ---
  /**
   * Retrieves all feed posts, enriched with live reaction counts, user reaction status,
   * and threaded comments, sorted strictly by Pinned Announcements first, then newest createdAt.
   */
  static getFeedPosts(currentUser?: UserProfile | null): FeedPost[] {
    const rawPosts = this.getRawPosts();
    const allReactions = this.getRawReactions();
    const allComments = this.getRawComments();
    const currentUserId = currentUser?.id || ChurchDataStore.getCurrentUser()?.id;

    // Group reactions by postId
    const reactionsByPost = new Map<string, PostReaction[]>();
    for (const r of allReactions) {
      const list = reactionsByPost.get(r.postId) || [];
      list.push(r);
      reactionsByPost.set(r.postId, list);
    }

    // Group comments by postId
    const commentsByPost = new Map<string, PostComment[]>();
    for (const c of allComments) {
      const list = commentsByPost.get(c.postId) || [];
      list.push(c);
      commentsByPost.set(c.postId, list);
    }

    const enrichedPosts = rawPosts.map(post => {
      const postReactions = reactionsByPost.get(post.id) || [];
      const postComments = commentsByPost.get(post.id) || [];

      // Calculate reaction breakdown counts
      const counts: Record<FeedReactionType, number> = {
        like: 0,
        love: 0,
        care: 0,
        celebrate: 0,
        pray: 0
      };

      let userReaction: FeedReactionType | null = null;

      for (const r of postReactions) {
        if (counts[r.reactionType] !== undefined) {
          counts[r.reactionType]++;
        }
        if (currentUserId && r.userId === currentUserId) {
          userReaction = r.reactionType;
        }
      }

      // Add fallback counts if post has initial counts but empty reaction array
      if (post.reactionCounts && postReactions.length === 0) {
        Object.assign(counts, post.reactionCounts);
      }

      // Sort comments chronologically & enrich comment reactions
      postComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const enrichedComments = postComments.map(c => {
        const cReactions = c.reactions || {};
        const cCounts: Record<FeedReactionType, number> = {
          like: 0,
          love: 0,
          care: 0,
          celebrate: 0,
          pray: 0
        };
        for (const rType of Object.values(cReactions)) {
          if (cCounts[rType] !== undefined) cCounts[rType]++;
        }
        return {
          ...c,
          reactions: cReactions,
          reactionCounts: cCounts,
          userReaction: (currentUserId && cReactions[currentUserId]) ? cReactions[currentUserId] : null
        };
      });

      return {
        ...post,
        reactions: postReactions,
        reactionCounts: counts,
        userReaction,
        comments: enrichedComments,
        commentsCount: Math.max(postComments.length, post.commentsCount || 0)
      };
    });

    const user = currentUser || ChurchDataStore.getCurrentUser();
    const isAdmin = user ? isChurchAdmin(user) : false;

    // Strict Privacy Filtering (Community, Group, Private)
    const visiblePosts = enrichedPosts.filter(post => {
      if (post.postType === 'prayer_request') {
        const audience = post.prayerAudience || 'community';
        if (audience === 'private') {
          // Visible only to author or church admin/pastor
          return (user && post.authorId === user.id) || isAdmin;
        }
        if (audience === 'group') {
          // Visible to author, church admin, or group member
          if ((user && post.authorId === user.id) || isAdmin) return true;
          if (post.targetGroupId && user) {
            return user.groupRooms?.includes(post.targetGroupId) || false;
          }
          return true;
        }
      }
      return true;
    });

    // Sort order:
    // 1. Pinned announcements first (by pinnedAt or createdAt desc)
    // 2. All other posts by createdAt desc
    return visiblePosts.sort((a, b) => {
      const aIsPinned = !a.isHidden && a.postType === 'announcement' && a.isPinned === true && a.announcementPriority === 'pinned';
      const bIsPinned = !b.isHidden && b.postType === 'announcement' && b.isPinned === true && b.announcementPriority === 'pinned';

      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;

      // Both pinned or both regular: sort newest first
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  }

  // --- CLOUD SYNC WITH SUPABASE ---
  static async fetchFeedPostsFromCloud(currentUser?: UserProfile | null, force: boolean = false): Promise<FeedPost[]> {
    if (!supabase) return this.getFeedPosts(currentUser);

    const now = Date.now();
    // Cache guard: do not re-query cloud if queried within last 15 seconds unless forced
    if (!force && this._cachedFeedResult.length > 0 && (now - this._lastFeedFetchTime < 15000)) {
      return this._cachedFeedResult;
    }

    try {
      const deletedIds = this.getDeletedIds();
      const currentUserId = currentUser?.id || ChurchDataStore.getCurrentUser()?.id;

      // 1. Fetch live announcements and community posts independently with fast resilience
      const fetchFast = async (queryPromise: any, ms: number = 6000) => {
        try {
          return await Promise.race([
            queryPromise,
            new Promise<any>((resolve) => setTimeout(() => resolve({ data: null, error: 'timeout' }), ms))
          ]);
        } catch (err) {
          return { data: null, error: err };
        }
      };

      const [annRes, commRes, commMsgRes] = await Promise.all([
        fetchFast(
          supabase
            .from('church_announcements')
            .select('*')
            .order('created_at', { ascending: false }),
          5000
        ),
        fetchFast(
          supabase
            .from('church_community_posts')
            .select('*')
            .order('created_at', { ascending: false }),
          5000
        ),
        fetchFast(
          supabase
            .from('church_chat_messages')
            .select('id, room_id, sender_id, sender_name, sender_avatar, sender_role, content, created_at')
            .like('room_id', 'post_comments_%')
            .order('created_at', { ascending: true })
            .limit(200),
          3000
        )
      ]);

      const cloudAnnouncements = annRes?.data ?? null;
      const cloudCommPosts = commRes?.data ?? null;
      const cloudComments = commMsgRes?.data ?? null;

      // Map cloud comments into PostComment[]
      const commentsByPostId = new Map<string, PostComment[]>();
      if (cloudComments && Array.isArray(cloudComments)) {
        const existingComments = this.getRawComments();
        const existingCommentIds = new Set(existingComments.map(c => c.id));
        let hasNewComments = false;

        for (const m of cloudComments) {
          const postId = m.room_id.replace('post_comments_', '');
          let parentId: string | null = null;
          let cleanContent = m.content || '';
          if (cleanContent.startsWith('[PARENT:')) {
            const closingIdx = cleanContent.indexOf(']');
            if (closingIdx !== -1) {
              parentId = cleanContent.substring(8, closingIdx);
              cleanContent = cleanContent.substring(closingIdx + 1).trim();
            }
          }

          const commentObj: PostComment = {
            id: m.id,
            postId,
            userId: m.sender_id,
            userName: m.sender_name || 'Church Believer',
            userAvatar: m.sender_avatar || '/icons/church-logo.png',
            userRole: m.sender_role || 'Church Member',
            parentCommentId: parentId,
            content: cleanContent,
            createdAt: m.created_at || new Date().toISOString()
          };

          const list = commentsByPostId.get(postId) || [];
          list.push(commentObj);
          commentsByPostId.set(postId, list);

          if (!existingCommentIds.has(commentObj.id)) {
            existingComments.push(commentObj);
            hasNewComments = true;
          }
        }

        if (hasNewComments) {
          this.save(KEY_COMMENTS, existingComments);
        }
      }

      // Map cloud reactions from liked_user_ids
      const reactionsByPostId = new Map<string, PostReaction[]>();
      if (cloudCommPosts && Array.isArray(cloudCommPosts)) {
        const existingReactions = this.getRawReactions();
        const existingRxIds = new Set(existingReactions.map(r => r.id));
        let hasNewRx = false;

        for (const p of cloudCommPosts) {
          if (Array.isArray(p.liked_user_ids)) {
            const rxList: PostReaction[] = [];
            for (const item of p.liked_user_ids) {
              if (item && item.userId && item.reactionType) {
                const rx: PostReaction = {
                  id: item.id || `rx-${p.id}-${item.userId}`,
                  postId: p.id,
                  userId: item.userId,
                  userName: item.userName || 'Church Believer',
                  userAvatar: item.userAvatar || '/icons/church-logo.png',
                  reactionType: item.reactionType,
                  createdAt: item.createdAt || p.created_at || new Date().toISOString()
                };
                rxList.push(rx);
                if (!existingRxIds.has(rx.id)) {
                  existingReactions.push(rx);
                  hasNewRx = true;
                }
              }
            }
            if (rxList.length > 0) {
              reactionsByPostId.set(p.id, rxList);
            }
          }
        }

        if (hasNewRx) {
          this.save(KEY_REACTIONS, existingReactions);
        }
      }

      const mappedAnnouncements: FeedPost[] = [];
      if (cloudAnnouncements && Array.isArray(cloudAnnouncements)) {
        for (const a of cloudAnnouncements) {
          if (deletedIds.includes(a.id)) continue;
          if (a.status === 'draft' || a.priority === 'draft' || a.status === 'archived' || a.status === 'deleted' || a.priority === 'archived') continue;

          // CRITICAL: An announcement is pinned ONLY if priority is explicitly 'pinned'
          const isPinned = a.priority === 'pinned';
          const authorAvatar = (a.author_name && a.author_name.toLowerCase().includes('miko'))
            ? '/images/avatar-john-miko.png'
            : '/icons/church-logo.png';

          mappedAnnouncements.push({
            id: a.id,
            authorId: a.created_by || 'church-admin',
            authorName: a.author_name || 'Church Leadership',
            authorAvatar,
            authorRole: a.author_role || 'Church Administration',
            ministryLabel: a.category || 'Church Leadership',
            content: a.description || a.content || '',
            postType: 'announcement',
            category: a.category || 'Sunday Services',
            imageUrls: a.cover_image ? [a.cover_image] : (a.image_url ? [a.image_url] : []),
            createdAt: a.created_at || new Date().toISOString(),
            updatedAt: a.updated_at || a.created_at || new Date().toISOString(),
            isHidden: false,
            commentsEnabled: true,
            announcementTitle: a.title,
            announcementPriority: isPinned ? 'pinned' : (a.priority === 'high' ? 'high' : 'normal'),
            isPinned,
            pinnedAt: isPinned ? (a.updated_at || a.created_at) : undefined,
            eventDate: a.date || a.event_date,
            reactions: [],
            reactionCounts: { like: 0, love: 0, care: 0, celebrate: 0, pray: 0 },
            comments: [],
            commentsCount: 0
          });
        }
      }

      const mappedCommPosts: FeedPost[] = [];
      if (cloudCommPosts && Array.isArray(cloudCommPosts)) {
        for (const p of cloudCommPosts) {
          if (deletedIds.includes(p.id)) continue;
          if (p.content === '[deleted]' || p.status === 'deleted' || !p.content?.trim()) continue;

          const postRx = reactionsByPostId.get(p.id) || [];
          const postComments = commentsByPostId.get(p.id) || [];

          const counts: Record<FeedReactionType, number> = { like: 0, love: 0, care: 0, celebrate: 0, pray: 0 };
          let userReaction: FeedReactionType | null = null;
          for (const r of postRx) {
            if (counts[r.reactionType] !== undefined) counts[r.reactionType]++;
            if (currentUserId && r.userId === currentUserId) userReaction = r.reactionType;
          }
          if (counts.like === 0 && p.likes_count) {
            counts.like = p.likes_count;
          }

          let postType: FeedPostType = 'community';
          let category = 'Personal Update';
          let prayerAudience: PrayerAudience | undefined = undefined;
          let targetGroupId: string | undefined = undefined;
          let isAnswered = false;
          let praiseNote: string | undefined = undefined;
          let cleanContent = p.content || '';

          // Check answered tag
          const ansMatch = cleanContent.match(/\[ANSWERED:([^\]]*)\]/);
          if (ansMatch) {
            isAnswered = true;
            try {
              praiseNote = decodeURIComponent(ansMatch[1]);
            } catch {
              praiseNote = ansMatch[1];
            }
            cleanContent = cleanContent.replace(/\[ANSWERED:([^\]]*)\]\s*/, '');
          }

          // Check prayer tag
          const prayerMatch = cleanContent.match(/^\[PRAYER:([^:\]]+)(?::([^\]]+))?\]\s*(.*)$/s);
          if (prayerMatch) {
            postType = 'prayer_request';
            category = 'Prayer Request';
            prayerAudience = prayerMatch[1] as PrayerAudience;
            targetGroupId = prayerMatch[2];
            cleanContent = prayerMatch[3];
          }

          // Recover local cached prayer metadata
          const localMatch = this.getRawPosts().find(lp => lp.id === p.id);
          if (localMatch?.postType === 'prayer_request') {
            postType = 'prayer_request';
            category = 'Prayer Request';
            if (localMatch.prayerAudience) prayerAudience = localMatch.prayerAudience;
            if (localMatch.targetGroupId) targetGroupId = localMatch.targetGroupId;
          }
          const prayerCount = localMatch?.prayerCount || p.likes_count || 0;
          const prayedUserIds = localMatch?.prayedUserIds || [];
          if (localMatch?.isAnswered) isAnswered = true;
          if (localMatch?.praiseNote) praiseNote = localMatch.praiseNote;

          mappedCommPosts.push({
            id: p.id,
            authorId: p.user_id,
            authorName: p.author_name,
            authorAvatar: p.author_avatar || '/icons/church-logo.png',
            authorRole: p.author_role || 'Church Member',
            ministryLabel: 'Church Community',
            content: cleanContent,
            postType,
            category,
            prayerAudience,
            targetGroupId,
            prayerCount,
            prayedUserIds,
            isAnswered,
            praiseNote,
            imageUrls: p.image_url ? [p.image_url] : [],
            createdAt: p.created_at || new Date().toISOString(),
            updatedAt: p.created_at || new Date().toISOString(),
            isHidden: false,
            commentsEnabled: true,
            reactions: postRx,
            reactionCounts: counts,
            userReaction,
            comments: postComments,
            commentsCount: Math.max(postComments.length, p.comments_count || 0)
          });
        }
      }

      // Merge cloud announcements and community posts with local pending posts
      // Only keep local pending community posts if they are recent drafts from current user not yet in cloud.
      // NEVER resurrect deleted posts from other users that are no longer in the cloud!
      const localCommunity = (cloudCommPosts && Array.isArray(cloudCommPosts))
        ? this.getRawPosts().filter(p => {
            if ((p.postType !== 'community' && p.postType !== 'prayer_request') || deletedIds.includes(p.id)) return false;
            if (mappedCommPosts.some(cp => cp.id === p.id)) return false;
            const isSelf = currentUser && p.authorId === currentUser.id;
            const isRecent = (Date.now() - new Date(p.createdAt).getTime()) < 2 * 60 * 1000;
            return Boolean(isSelf && isRecent);
          })
        : this.getRawPosts().filter(p => (p.postType === 'community' || p.postType === 'prayer_request') && !deletedIds.includes(p.id));

      // Check local admin announcements cache for newly added or high-res cover photos
      const localAdminMap = new Map<string, any>();
      try {
        const rawLocalAnn = localStorage.getItem('bjc_admin_announcements_cache_v1');
        if (rawLocalAnn) {
          const parsed = JSON.parse(rawLocalAnn);
          if (Array.isArray(parsed)) {
            for (const a of parsed) {
              if (a.id) localAdminMap.set(a.id, a);
            }
          }
        }
      } catch {}

      // If cloud announcement has no cover image or local has a specific image, apply local image
      for (const ann of mappedAnnouncements) {
        const local = localAdminMap.get(ann.id);
        if (local) {
          if (local.cover_image || local.image_url) {
            const localImg = local.cover_image || local.image_url;
            if (ann.imageUrls.length === 0 || !ann.imageUrls[0]) {
              ann.imageUrls = [localImg];
            }
          }
          // If local admin cache was explicitly unpinned, ensure cloud sync respects it
          if (local.priority && local.priority !== 'pinned' && ann.isPinned) {
            ann.isPinned = false;
            ann.announcementPriority = local.priority === 'high' ? 'high' : 'normal';
          }
        }
      }

      const seenIds = new Set<string>();
      const combined: FeedPost[] = [];

      for (const p of [...mappedAnnouncements, ...mappedCommPosts, ...localCommunity]) {
        if (!seenIds.has(p.id) && !deletedIds.includes(p.id)) {
          seenIds.add(p.id);
          combined.push(p);
        }
      }

      this.save(KEY_FEED_POSTS, combined);
      this._lastFeedFetchTime = Date.now();
      const finalResult = this.getFeedPosts(currentUser);
      this._cachedFeedResult = finalResult;
      return finalResult;
    } catch (e) {
      console.warn('fetchFeedPostsFromCloud error, falling back to local storage:', e);
    }

    const fallbackResult = this.getFeedPosts(currentUser);
    this._cachedFeedResult = fallbackResult;
    return fallbackResult;
  }

  // --- REALTIME SYNC LISTENER (Broadcast + Postgres changes) ---
  static subscribeToFeedRealtime(onUpdate: (posts: FeedPost[]) => void): () => void {
    if (!supabase) return () => {};

    const channel = supabase.channel('bjc-feed-realtime-hub', {
      config: { broadcast: { self: false } }
    });

    this.feedHubChannel = channel;

    channel
      .on('broadcast', { event: 'new_feed_post' }, async ({ payload }: any) => {
        if (payload?.post) {
          const current = this.getRawPosts();
          if (!current.some(p => p.id === payload.post.id)) {
            current.unshift(payload.post);
            this.save(KEY_FEED_POSTS, current);
            onUpdate(this.getFeedPosts());
          }
        }
      })
      .on('broadcast', { event: 'feed_reaction' }, async ({ payload }: any) => {
        if (payload?.postId && payload?.reactions) {
          const allReactions = this.getRawReactions().filter(r => r.postId !== payload.postId);
          allReactions.push(...payload.reactions);
          this.save(KEY_REACTIONS, allReactions);
          onUpdate(this.getFeedPosts());
        }
      })
      .on('broadcast', { event: 'new_feed_comment' }, async ({ payload }: any) => {
        if (payload?.comment) {
          const allComments = this.getRawComments();
          if (!allComments.some(c => c.id === payload.comment.id)) {
            allComments.push(payload.comment);
            this.save(KEY_COMMENTS, allComments);
            const posts = this.getRawPosts();
            const target = posts.find(p => p.id === payload.postId);
            if (target) {
              target.commentsCount = (target.commentsCount || 0) + 1;
              this.save(KEY_FEED_POSTS, posts);
            }
            onUpdate(this.getFeedPosts());
          }
        }
      })
      .on('broadcast', { event: 'feed_comment_edit' }, async ({ payload }: any) => {
        if (payload?.commentId) {
          const allComments = this.getRawComments();
          const target = allComments.find(c => c.id === payload.commentId);
          if (target) {
            target.content = payload.content;
            target.updatedAt = payload.updatedAt;
            this.save(KEY_COMMENTS, allComments);
            onUpdate(this.getFeedPosts());
          }
        }
      })
      .on('broadcast', { event: 'feed_comment_delete' }, async ({ payload }: any) => {
        if (payload?.commentId) {
          const allComments = this.getRawComments().filter(c => c.id !== payload.commentId && c.parentCommentId !== payload.commentId);
          this.save(KEY_COMMENTS, allComments);
          const posts = this.getRawPosts();
          const target = posts.find(p => p.id === payload.postId);
          if (target && target.commentsCount && target.commentsCount > 0) {
            target.commentsCount -= 1;
            this.save(KEY_FEED_POSTS, posts);
          }
          onUpdate(this.getFeedPosts());
        }
      })
      .on('broadcast', { event: 'feed_delete_post' }, async ({ payload }: any) => {
        if (payload?.postId) {
          this.addDeletedId(payload.postId);
          const current = this.getRawPosts().filter(p => p.id !== payload.postId);
          this.save(KEY_FEED_POSTS, current);
          onUpdate(this.getFeedPosts());
        }
      })
      .on('broadcast', { event: 'feed_edit_post' }, async ({ payload }: any) => {
        if (payload?.post) {
          const current = this.getRawPosts();
          const idx = current.findIndex(p => p.id === payload.post.id);
          if (idx >= 0) {
            current[idx] = { ...current[idx], ...payload.post };
            this.save(KEY_FEED_POSTS, current);
            onUpdate(this.getFeedPosts());
          }
        }
      })
      .on('broadcast', { event: 'feed_pin_post' }, async () => {
        const fresh = await ChurchFeedStore.fetchFeedPostsFromCloud();
        onUpdate(fresh);
      })
      .on('broadcast', { event: 'feed_prayer_update' }, async ({ payload }: any) => {
        if (payload?.postId) {
          const current = this.getRawPosts();
          const target = current.find(p => p.id === payload.postId);
          if (target) {
            target.prayerCount = payload.prayerCount;
            target.prayedUserIds = payload.prayedUserIds;
            this.save(KEY_FEED_POSTS, current);
            onUpdate(this.getFeedPosts());
          }
        }
      })
      .on('broadcast', { event: 'feed_prayer_answered' }, async ({ payload }: any) => {
        if (payload?.postId) {
          const current = this.getRawPosts();
          const target = current.find(p => p.id === payload.postId);
          if (target) {
            target.isAnswered = true;
            target.answeredAt = payload.answeredAt;
            if (payload.praiseNote) target.praiseNote = payload.praiseNote;
            this.save(KEY_FEED_POSTS, current);
            onUpdate(this.getFeedPosts());
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'church_announcements' }, async () => {
        const fresh = await ChurchFeedStore.fetchFeedPostsFromCloud();
        onUpdate(fresh);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'church_community_posts' }, async () => {
        const fresh = await ChurchFeedStore.fetchFeedPostsFromCloud();
        onUpdate(fresh);
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }

  // --- POST CREATION ---
  static async createPost(params: {
    author: UserProfile;
    content: string;
    imageUrls?: string[];
    category?: string;
    postType?: FeedPostType;
    prayerAudience?: PrayerAudience;
    targetGroupId?: string;
    targetGroupName?: string;
    announcementTitle?: string;
    announcementPriority?: 'pinned' | 'high' | 'normal';
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    actionButtonLabel?: string;
    actionButtonUrl?: string;
  }): Promise<FeedPost> {
    const isAdmin = isChurchAdmin(params.author);
    const requestedPostType = params.postType || 'community';

    // SECURITY ACCESS CONTROL: Non-admins can NEVER post official announcements
    const effectivePostType: FeedPostType = (requestedPostType === 'announcement' && !isAdmin)
      ? 'community'
      : requestedPostType;

    const isPinned = isAdmin && effectivePostType === 'announcement' && params.announcementPriority === 'pinned';
    const nowIso = new Date().toISOString();
    const newId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const newPost: FeedPost = {
      id: newId,
      authorId: params.author.id,
      authorName: params.author.name,
      authorAvatar: params.author.avatar || '/icons/church-logo.png',
      authorRole: params.author.roleTitle || 'Church Member',
      ministryLabel: params.author.ministryLabel || (isAdmin ? 'Church Leadership' : undefined),
      content: params.content.trim(),
      postType: effectivePostType,
      category: params.category || (effectivePostType === 'announcement' ? 'Official Announcement' : effectivePostType === 'prayer_request' ? 'Prayer Request' : 'Personal Update'),
      imageUrls: params.imageUrls || [],
      createdAt: nowIso,
      updatedAt: nowIso,
      isHidden: false,
      commentsEnabled: true,
      announcementTitle: effectivePostType === 'announcement' ? params.announcementTitle?.trim() : undefined,
      announcementPriority: effectivePostType === 'announcement' ? (params.announcementPriority || 'normal') : undefined,
      isPinned: Boolean(isPinned),
      pinnedAt: isPinned ? nowIso : undefined,
      eventDate: params.eventDate,
      eventTime: params.eventTime,
      eventLocation: params.eventLocation,
      actionButtonLabel: params.actionButtonLabel,
      actionButtonUrl: params.actionButtonUrl,

      // Prayer Request Properties
      prayerAudience: effectivePostType === 'prayer_request' ? (params.prayerAudience || 'community') : undefined,
      targetGroupId: params.targetGroupId,
      targetGroupName: params.targetGroupName,
      prayerCount: 0,
      prayedUserIds: [],
      isAnswered: false,

      reactions: [],
      reactionCounts: { like: 0, love: 0, care: 0, celebrate: 0, pray: 0 },
      comments: [],
      commentsCount: 0
    };

    const currentPosts = this.getRawPosts();
    currentPosts.unshift(newPost);
    this.save(KEY_FEED_POSTS, currentPosts);

    // Sync to Supabase Live Database
    if (supabase) {
      try {
        if (effectivePostType === 'announcement') {
          await supabase.from('church_announcements').insert({
            id: newPost.id,
            title: newPost.announcementTitle || 'Church Announcement',
            content: newPost.content,
            description: newPost.content,
            category: newPost.category || 'General Church',
            date: newPost.eventDate || new Date().toISOString().split('T')[0],
            event_date: newPost.eventDate || null,
            status: 'published',
            priority: newPost.isPinned ? 'pinned' : 'normal',
            is_important: Boolean(newPost.isPinned),
            author_name: newPost.authorName,
            author_role: newPost.authorRole,
            cover_image: newPost.imageUrls[0] || null,
            image_url: newPost.imageUrls[0] || null,
            created_by: newPost.authorId,
            created_at: newPost.createdAt,
            updated_at: newPost.updatedAt
          });
        } else {
          const cloudContent = effectivePostType === 'prayer_request'
            ? `[PRAYER:${newPost.prayerAudience || 'community'}${newPost.targetGroupId ? `:${newPost.targetGroupId}` : ''}] ${newPost.content}`
            : newPost.content;

          await supabase.from('church_community_posts').insert({
            id: newPost.id,
            user_id: newPost.authorId,
            author_name: newPost.authorName,
            author_avatar: newPost.authorAvatar,
            author_role: newPost.authorRole,
            content: cloudContent,
            image_url: newPost.imageUrls[0] || null,
            likes_count: 0,
            comments_count: 0,
            created_at: newPost.createdAt
          });
        }
      } catch (e) {
        console.warn('createPost cloud sync error:', e);
      }
    }

    this.broadcastFeedEvent('new_feed_post', { post: newPost });

    if (newPost.postType === 'announcement') {
      ChurchDataStore.addNotification({
        id: `notif-announcement-${newPost.id}`,
        type: 'announcement',
        title: `Church Announcement: ${newPost.authorName}`,
        message: (newPost.content || '').slice(0, 80),
        linkRoute: 'feed',
        createdAt: newPost.createdAt
      });
    } else if (newPost.postType === 'prayer_request' && newPost.prayerAudience !== 'private') {
      ChurchDataStore.addNotification({
        id: `notif-prayer-${newPost.id}`,
        type: 'prayer',
        title: `Prayer Request from ${newPost.authorName}`,
        message: (newPost.content || '').slice(0, 80),
        linkRoute: 'feed',
        createdAt: newPost.createdAt
      });
    }

    return newPost;
  }

  // --- POST EDITING ---
  static async editPost(
    postId: string, 
    content: string, 
    imageUrls?: string[], 
    announcementTitle?: string,
    editor?: UserProfile
  ): Promise<FeedPost | null> {
    const currentPosts = this.getRawPosts();
    const target = currentPosts.find(p => p.id === postId);
    if (!target) return null;

    const isAdmin = isChurchAdmin(editor);
    const isAuthor = editor && editor.id === target.authorId;

    // Permissions check
    if (!isAdmin && !isAuthor) {
      throw new Error("You do not have permission to edit this post.");
    }

    target.content = content.trim();
    if (imageUrls !== undefined) target.imageUrls = imageUrls;
    if (target.postType === 'announcement' && announcementTitle !== undefined) {
      target.announcementTitle = announcementTitle.trim();
    }
    target.updatedAt = new Date().toISOString();

    this.save(KEY_FEED_POSTS, currentPosts);

    if (supabase) {
      try {
        if (target.postType === 'announcement') {
          await supabase.from('church_announcements').update({
            title: target.announcementTitle,
            description: target.content,
            content: target.content,
            cover_image: target.imageUrls[0] || null,
            image_url: target.imageUrls[0] || null,
            updated_at: target.updatedAt
          }).eq('id', postId);
        } else {
          await supabase.from('church_community_posts').update({
            content: target.content,
            image_url: target.imageUrls[0] || null
          }).eq('id', postId);
        }
      } catch (e) {
        console.warn('editPost cloud sync error:', e);
      }
    }

    this.broadcastFeedEvent('feed_edit_post', { post: target });

    return target;
  }

  // --- POST DELETION ---
  static async deletePost(postId: string, actor: UserProfile): Promise<boolean> {
    const currentPosts = this.getRawPosts();
    const target = currentPosts.find(p => p.id === postId);
    if (!target) return false;

    const isAdmin = isChurchAdmin(actor);
    const isAuthor = actor.id === target.authorId;

    if (!isAdmin && !isAuthor) {
      throw new Error("You do not have permission to delete this post.");
    }

    this.addDeletedId(postId);
    const filtered = currentPosts.filter(p => p.id !== postId);
    this.save(KEY_FEED_POSTS, filtered);

    // Clean up reactions and comments
    const allReactions = this.getRawReactions().filter(r => r.postId !== postId);
    this.save(KEY_REACTIONS, allReactions);

    const allComments = this.getRawComments().filter(c => c.postId !== postId);
    this.save(KEY_COMMENTS, allComments);

    // Audit Log for admin deletion
    if (isAdmin && !isAuthor) {
      this.recordAuditLog({
        adminId: actor.id,
        adminName: actor.name,
        action: 'delete_post',
        targetId: postId,
        targetType: 'post',
        reason: 'Post removed by church administrator'
      });
    }

    if (supabase) {
      try {
        // 1. Delete directly from Supabase
        await supabase.from('church_community_posts').delete().eq('id', postId);
        await supabase.from('church_announcements').delete().eq('id', postId);

        // 2. Also soft-delete / update status so that even if hard delete fails due to RLS or constraints,
        // it is marked archived/deleted in Supabase and filtered out by all other accounts
        await supabase.from('church_community_posts').update({ content: '[deleted]', status: 'deleted' }).eq('id', postId);
        await supabase.from('church_announcements').update({ status: 'archived', priority: 'archived' }).eq('id', postId);

        if (target.postType === 'announcement') {
          try {
            await supabase.from('announcements').delete().eq('id', postId);
          } catch {}
        }
      } catch (e) {
        console.warn('deletePost cloud sync error:', e);
      }
    }

    this.broadcastFeedEvent('feed_delete_post', { postId });

    return true;
  }

  // --- PIN / UNPIN ANNOUNCEMENT (ADMIN ONLY) ---
  static async togglePinAnnouncement(postId: string, isPinned: boolean, adminUser: UserProfile): Promise<boolean> {
    if (!isChurchAdmin(adminUser)) {
      throw new Error("Only church administrators can pin or unpin announcements.");
    }

    const currentPosts = this.getRawPosts();
    const post = currentPosts.find(p => p.id === postId);
    if (post) {
      post.isPinned = isPinned;
      post.announcementPriority = isPinned ? 'pinned' : 'normal';
      post.pinnedAt = isPinned ? new Date().toISOString() : undefined;
      post.updatedAt = new Date().toISOString();
      this.save(KEY_FEED_POSTS, currentPosts);
    }

    // Also update local admin announcements cache
    try {
      const rawAdmin = localStorage.getItem('bjc_admin_announcements_cache_v1');
      if (rawAdmin) {
        const adminList = JSON.parse(rawAdmin);
        if (Array.isArray(adminList)) {
          const adm = adminList.find(a => a.id === postId);
          if (adm) {
            adm.priority = isPinned ? 'pinned' : 'normal';
            adm.is_important = isPinned;
            localStorage.setItem('bjc_admin_announcements_cache_v1', JSON.stringify(adminList));
          }
        }
      }
    } catch {}

    this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: isPinned ? 'pin_announcement' : 'unpin_announcement',
      targetId: postId,
      targetType: 'post'
    });

    if (supabase) {
      try {
        await supabase.from('church_announcements').update({
          priority: isPinned ? 'pinned' : 'normal',
          is_important: isPinned,
          updated_at: new Date().toISOString()
        }).eq('id', postId);
      } catch (e) {
        console.warn('togglePin cloud sync error:', e);
      }
    }

    try {
      window.dispatchEvent(new CustomEvent('bjc_feed_change'));
      window.dispatchEvent(new CustomEvent('bjc_announcements_updated'));
    } catch {}

    this.broadcastFeedEvent('feed_pin_post', { postId, isPinned });

    return true;
  }

  // --- HIDE / RESTORE POST (ADMIN ONLY) ---
  static async setPostHidden(postId: string, isHidden: boolean, adminUser: UserProfile, reason?: string): Promise<boolean> {
    if (!isChurchAdmin(adminUser)) {
      throw new Error("Only church administrators can hide or restore posts.");
    }

    const currentPosts = this.getRawPosts();
    const post = currentPosts.find(p => p.id === postId);
    if (!post) return false;

    post.isHidden = isHidden;
    post.updatedAt = new Date().toISOString();
    this.save(KEY_FEED_POSTS, currentPosts);

    this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: isHidden ? 'hide_post' : 'restore_post',
      targetId: postId,
      targetType: 'post',
      reason
    });

    if (supabase) {
      try {
        await supabase.from('church_feed_posts').update({
          is_hidden: post.isHidden,
          updated_at: post.updatedAt
        }).eq('id', postId);
      } catch (e) {
        console.warn('setPostHidden cloud sync error:', e);
      }
    }

    return true;
  }

  // --- DISABLE / ENABLE COMMENTS (ADMIN ONLY) ---
  static async setPostCommentsEnabled(postId: string, enabled: boolean, adminUser: UserProfile): Promise<boolean> {
    if (!isChurchAdmin(adminUser)) {
      throw new Error("Only church administrators can modify comment settings on posts.");
    }

    const currentPosts = this.getRawPosts();
    const post = currentPosts.find(p => p.id === postId);
    if (!post) return false;

    post.commentsEnabled = enabled;
    post.updatedAt = new Date().toISOString();
    this.save(KEY_FEED_POSTS, currentPosts);

    this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: enabled ? 'enable_comments' : 'disable_comments',
      targetId: postId,
      targetType: 'post'
    });

    if (supabase) {
      try {
        await supabase.from('church_feed_posts').update({
          comments_enabled: post.commentsEnabled,
          updated_at: post.updatedAt
        }).eq('id', postId);
      } catch (e) {
        console.warn('setCommentsEnabled cloud sync error:', e);
      }
    }

    return true;
  }

  // --- REACTION SYSTEM ---
  /**
   * Toggles or updates a reaction for the current user on a post:
   * - If user already reacted with the exact same reaction -> removes it.
   * - If user reacted with a different reaction -> changes to the new reaction.
   * - If user hasn't reacted yet -> creates the reaction.
   */
  static reactToPost(postId: string, user: UserProfile, reactionType: FeedReactionType): boolean {
    const allReactions = this.getRawReactions();
    const existingIndex = allReactions.findIndex(r => r.postId === postId && r.userId === user.id);

    let changed = false;

    if (existingIndex >= 0) {
      const existing = allReactions[existingIndex];
      if (existing.reactionType === reactionType) {
        // Toggle OFF (remove reaction)
        allReactions.splice(existingIndex, 1);
        changed = true;
      } else {
        // CHANGE to new reaction
        allReactions[existingIndex].reactionType = reactionType;
        allReactions[existingIndex].createdAt = new Date().toISOString();
        changed = true;
      }
    } else {
      // NEW REACTION
      const newReaction: PostReaction = {
        id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        postId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || '/icons/church-logo.png',
        reactionType,
        createdAt: new Date().toISOString()
      };
      allReactions.push(newReaction);
      changed = true;
    }

    if (changed) {
      this.save(KEY_REACTIONS, allReactions);

      // Now sync to Supabase church_community_posts liked_user_ids
      const postReactions = allReactions.filter(r => r.postId === postId);
      if (supabase) {
        supabase.from('church_community_posts').update({
          likes_count: postReactions.length,
          liked_user_ids: postReactions
        }).eq('id', postId).then();
      }

      // Broadcast to all other accounts in real time
      this.broadcastFeedEvent('feed_reaction', {
        postId,
        reactions: postReactions,
        actorId: user.id
      });

      // Notify post author if another member added a new reaction
      if (existingIndex === -1) {
        const posts = this.getRawPosts();
        const post = posts.find(p => p.id === postId);
        if (post && post.authorId && post.authorId !== user.id) {
          ChurchDataStore.addNotification({
            id: `rx-notif-${postId}-${user.id}`,
            userId: post.authorId,
            type: 'reaction',
            title: `${user.name} reacted to your post`,
            message: `${user.name} reacted with ${reactionType} on: "${(post.content || '').slice(0, 45)}..."`,
            linkRoute: 'feed',
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    return changed;
  }

  /**
   * Toggles prayer support for a prayer request or post.
   */
  static togglePrayForPost(postId: string, user: UserProfile): { prayed: boolean; prayerCount: number } {
    const posts = this.getRawPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error("Post not found.");

    let prayedUserIds = Array.isArray(post.prayedUserIds) ? [...post.prayedUserIds] : [];
    const hasPrayed = prayedUserIds.includes(user.id);
    let prayed = false;

    if (hasPrayed) {
      // Toggle OFF
      prayedUserIds = prayedUserIds.filter(id => id !== user.id);
      prayed = false;
    } else {
      // Toggle ON
      prayedUserIds.push(user.id);
      prayed = true;
    }

    post.prayedUserIds = prayedUserIds;
    post.prayerCount = prayedUserIds.length;
    this.save(KEY_FEED_POSTS, posts);

    if (supabase) {
      supabase.from('church_community_posts').update({
        likes_count: post.prayerCount
      }).eq('id', postId).then();
    }

    this.broadcastFeedEvent('feed_prayer_update', {
      postId,
      prayerCount: post.prayerCount,
      prayedUserIds: post.prayedUserIds,
      actorId: user.id,
      prayed
    });

    // Notify author if another member is praying for them
    if (prayed && post.authorId && post.authorId !== user.id) {
      ChurchDataStore.addNotification({
        id: `pray-notif-${postId}-${user.id}`,
        userId: post.authorId,
        type: 'prayer',
        title: `${user.name} is praying for you`,
        message: `${user.name} lifted your prayer request up in prayer: "${(post.content || '').slice(0, 45)}..."`,
        linkRoute: 'feed',
        createdAt: new Date().toISOString()
      });
    }

    return { prayed, prayerCount: post.prayerCount };
  }

  /**
   * Marks a prayer request as answered with optional praise report note.
   */
  static markPrayerAnswered(postId: string, user: UserProfile, praiseNote?: string): boolean {
    const posts = this.getRawPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    if (post.authorId !== user.id && !isChurchAdmin(user)) {
      throw new Error("Only the author or pastor can mark this prayer request as answered.");
    }

    post.isAnswered = true;
    post.answeredAt = new Date().toISOString();
    if (praiseNote && praiseNote.trim()) {
      post.praiseNote = praiseNote.trim();
    }
    this.save(KEY_FEED_POSTS, posts);

    if (supabase) {
      const ansPrefix = `[PRAYER:${post.prayerAudience || 'community'}${post.targetGroupId ? `:${post.targetGroupId}` : ''}][ANSWERED:${encodeURIComponent(post.praiseNote || '')}] `;
      supabase.from('church_community_posts').update({
        content: ansPrefix + post.content
      }).eq('id', postId).then();
    }

    this.broadcastFeedEvent('feed_prayer_answered', {
      postId,
      isAnswered: true,
      answeredAt: post.answeredAt,
      praiseNote: post.praiseNote
    });

    // Notify believers who prayed for this request
    if (Array.isArray(post.prayedUserIds)) {
      post.prayedUserIds.forEach(prayingUserId => {
        if (prayingUserId !== user.id) {
          ChurchDataStore.addNotification({
            id: `answered-notif-${postId}-${prayingUserId}`,
            userId: prayingUserId,
            type: 'prayer',
            title: `✨ Answered Prayer! Praise God!`,
            message: `${post.authorName}'s prayer was answered: "${(post.praiseNote || post.content || '').slice(0, 50)}..."`,
            linkRoute: 'feed',
            createdAt: new Date().toISOString()
          });
        }
      });
    }

    return true;
  }

  // --- COMMENT SYSTEM ---
  static addComment(
    postId: string, 
    user: UserProfile, 
    content: string, 
    parentCommentId?: string | null
  ): PostComment {
    const posts = this.getRawPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error("Post not found.");
    if (post.commentsEnabled === false) {
      throw new Error("Comments have been disabled for this post.");
    }

    const allComments = this.getRawComments();
    const newComment: PostComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      postId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '/icons/church-logo.png',
      userRole: user.roleTitle || 'Church Member',
      parentCommentId: parentCommentId || null,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    allComments.push(newComment);
    this.save(KEY_COMMENTS, allComments);

    // Update post comments count in raw posts
    post.commentsCount = (post.commentsCount || 0) + 1;
    this.save(KEY_FEED_POSTS, posts);

    if (supabase) {
      const fullContent = (parentCommentId ? `[PARENT:${parentCommentId}] ` : '') + newComment.content;
      supabase.from('church_chat_messages').insert({
        id: newComment.id,
        room_id: 'post_comments_' + postId,
        sender_id: user.id,
        sender_name: user.name,
        sender_avatar: user.avatar || '/icons/church-logo.png',
        sender_role: user.roleTitle || 'Church Member',
        content: fullContent,
        created_at: newComment.createdAt,
        is_delivered: true
      }).then();

      supabase.from('church_community_posts').update({
        comments_count: post.commentsCount
      }).eq('id', postId).then();
    }

    // Broadcast to all other accounts in real time
    this.broadcastFeedEvent('new_feed_comment', {
      postId,
      comment: newComment
    });

    // Notify post author if another member commented
    if (post.authorId && post.authorId !== user.id) {
      ChurchDataStore.addNotification({
        id: `comm-notif-${newComment.id}`,
        userId: post.authorId,
        type: 'comment',
        title: `${user.name} commented on your post`,
        message: `${user.name}: "${newComment.content.slice(0, 50)}..."`,
        linkRoute: 'feed',
        createdAt: newComment.createdAt
      });
    }

    return newComment;
  }

  static editComment(commentId: string, newContent: string, user: UserProfile): boolean {
    const allComments = this.getRawComments();
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return false;

    if (comment.userId !== user.id && !isChurchAdmin(user)) {
      throw new Error("You do not have permission to edit this comment.");
    }

    comment.content = newContent.trim();
    comment.updatedAt = new Date().toISOString();
    this.save(KEY_COMMENTS, allComments);

    if (supabase) {
      const fullContent = (comment.parentCommentId ? `[PARENT:${comment.parentCommentId}] ` : '') + comment.content;
      supabase.from('church_chat_messages').update({
        content: fullContent
      }).eq('id', commentId).then();
    }

    this.broadcastFeedEvent('feed_comment_edit', {
      postId: comment.postId,
      commentId,
      content: comment.content,
      updatedAt: comment.updatedAt
    });

    return true;
  }

  static deleteComment(commentId: string, user: UserProfile): boolean {
    const allComments = this.getRawComments();
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return false;

    if (comment.userId !== user.id && !isChurchAdmin(user)) {
      throw new Error("You do not have permission to delete this comment.");
    }

    const postId = comment.postId;
    // Also remove any nested child replies
    const filtered = allComments.filter(c => c.id !== commentId && c.parentCommentId !== commentId);
    this.save(KEY_COMMENTS, filtered);

    const posts = this.getRawPosts();
    const post = posts.find(p => p.id === postId);
    if (post && post.commentsCount && post.commentsCount > 0) {
      post.commentsCount -= 1;
      this.save(KEY_FEED_POSTS, posts);
    }

    if (supabase) {
      supabase.from('church_chat_messages').delete().eq('id', commentId).then();
      if (post) {
        supabase.from('church_community_posts').update({
          comments_count: post.commentsCount || 0
        }).eq('id', postId).then();
      }
    }

    this.broadcastFeedEvent('feed_comment_delete', {
      postId,
      commentId
    });

    return true;
  }

  static toggleCommentReaction(
    commentId: string, 
    user: UserProfile, 
    reactionType: FeedReactionType = 'pray'
  ): boolean {
    const allComments = this.getRawComments();
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return false;

    if (!comment.reactions) {
      comment.reactions = {};
    }

    const currentReaction = comment.reactions[user.id];
    if (currentReaction === reactionType) {
      delete comment.reactions[user.id];
    } else {
      comment.reactions[user.id] = reactionType;
    }

    // Recalculate reactionCounts
    const counts: Record<FeedReactionType, number> = {
      like: 0,
      love: 0,
      care: 0,
      celebrate: 0,
      pray: 0
    };
    for (const r of Object.values(comment.reactions)) {
      if (counts[r] !== undefined) {
        counts[r]++;
      }
    }
    comment.reactionCounts = counts;
    comment.userReaction = comment.reactions[user.id] || null;

    this.save(KEY_COMMENTS, allComments);
    return true;
  }

  // --- REPORTING SYSTEM ---
  static reportPost(
    postId: string, 
    reporter: UserProfile, 
    reason: PostReport['reason'], 
    reasonText?: string, 
    commentId?: string | null
  ): PostReport {
    const reports = this.getReports();
    const newReport: PostReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      postId,
      commentId: commentId || null,
      reportedBy: reporter.id,
      reporterName: reporter.name,
      reason,
      reasonText: reasonText?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    reports.unshift(newReport);
    this.save(KEY_REPORTS, reports);

    if (supabase) {
      supabase.from('church_post_reports').insert({
        id: newReport.id,
        post_id: newReport.postId,
        comment_id: newReport.commentId,
        reported_by: newReport.reportedBy,
        reporter_name: newReport.reporterName,
        reason: newReport.reason,
        reason_text: newReport.reasonText,
        status: newReport.status,
        created_at: newReport.createdAt
      }).then();
    }

    return newReport;
  }

  static updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed', adminUser: UserProfile): boolean {
    if (!isChurchAdmin(adminUser)) return false;
    const reports = this.getReports();
    const target = reports.find(r => r.id === reportId);
    if (!target) return false;

    target.status = status;
    this.save(KEY_REPORTS, reports);

    if (supabase) {
      supabase.from('church_post_reports').update({ status }).eq('id', reportId).then();
    }

    return true;
  }

  // --- AUDIT LOGGING ---
  private static recordAuditLog(log: Omit<ModerationAuditLog, 'id' | 'createdAt'>): void {
    const logs = this.getAuditLogs();
    const newLog: ModerationAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ...log,
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.save(KEY_MODERATION_LOGS, logs);

    if (supabase) {
      supabase.from('church_moderation_audit_logs').insert({
        id: newLog.id,
        admin_id: newLog.adminId,
        admin_name: newLog.adminName,
        action: newLog.action,
        target_id: newLog.targetId,
        target_type: newLog.targetType,
        reason: newLog.reason,
        created_at: newLog.createdAt
      }).then();
    }
  }
}
