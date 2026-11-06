import { 
  FeedPost, PostReaction, PostComment, PostReport, ModerationAuditLog,
  FeedReactionType, UserProfile, FEED_REACTIONS, FeedPostType 
} from '../types';
import { supabase } from '../lib/supabase';
import { ChurchDataStore } from './churchDataStore';

const KEY_FEED_POSTS = 'bjc_feed_posts_v4';
const KEY_REACTIONS = 'bjc_post_reactions_v4';
const KEY_COMMENTS = 'bjc_post_comments_v4';
const KEY_REPORTS = 'bjc_post_reports_v4';
const KEY_MODERATION_LOGS = 'bjc_moderation_logs_v4';

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

// Initial realistic, inspiring church seed posts
const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: 'post-ann-colossians',
    authorId: 'usr-pastor-john-eric',
    authorName: 'John Eric Manjares',
    authorAvatar: '/images/pastor-john-eric-manjares.png',
    authorRole: 'Senior Pastor',
    ministryLabel: 'Pastoral Leadership',
    content: `Grace and peace to our beloved Beholding Jesus Church family!\n\nThis coming Sunday, we commence our new expositional sermon series entitled "Walking in Colossians: Christ Supreme & Sufficient". In a world full of distractions and human philosophies, Paul reminds us that in Christ "all the fullness of God was pleased to dwell."\n\nJoin us at 9:00 AM as we worship, break bread, and behold Jesus together in His word. Bring your Bibles, invite your families, and prepare your hearts for a mighty encounter with the Lord!`,
    postType: 'announcement',
    category: 'Sunday Services',
    imageUrls: ['/images/worship-service-poster.jpg'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isHidden: false,
    commentsEnabled: true,
    announcementTitle: 'Upcoming Expository Series: Walking in Colossians — Christ Preeminent in All Things',
    announcementPriority: 'pinned',
    isPinned: true,
    pinnedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    eventDate: 'Every Sunday Morning',
    eventTime: '9:00 AM – 11:30 AM',
    eventLocation: '2nd Flr. MV Villar Ave. Ph2 Central Camella Springville Molino 3, Bacoor, Cavite',
    actionButtonLabel: 'View Service Details',
    actionButtonUrl: '#worship-details',
    reactions: [],
    reactionCounts: { like: 2, love: 5, care: 1, celebrate: 4, pray: 8 },
    comments: [],
    commentsCount: 3
  },
  {
    id: 'post-ann-youth-ignite',
    authorId: 'usr-pastor-john-eric',
    authorName: 'John Eric Manjares',
    authorAvatar: '/images/pastor-john-eric-manjares.png',
    authorRole: 'Senior Pastor',
    ministryLabel: 'Youth & NextGen Ministry',
    content: `Calling all young people, students, and young professionals! 🔥\n\nJoin our BJC NextGen Gathering this Saturday at 4:00 PM for an afternoon of acoustic worship, deep biblical discussions on navigating modern culture with Christian purity, and warm fellowship over snacks.\n\n"Don't let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity." — 1 Timothy 4:12`,
    postType: 'announcement',
    category: 'Youth Ministry',
    imageUrls: ['/images/bible-hero.jpg'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    isHidden: false,
    commentsEnabled: true,
    announcementTitle: 'NextGen Youth Fellowship: Igniting Hearts for King Jesus',
    announcementPriority: 'pinned',
    isPinned: true,
    pinnedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    eventDate: 'Saturday Afternoon',
    eventTime: '4:00 PM – 6:30 PM',
    eventLocation: 'BJC Youth Hall, Main Sanctuary',
    actionButtonLabel: 'RSVP / Join Fellowship',
    actionButtonUrl: '#youth-registration',
    reactions: [],
    reactionCounts: { like: 4, love: 6, care: 0, celebrate: 7, pray: 3 },
    comments: [],
    commentsCount: 2
  },
  {
    id: 'post-comm-testimony-1',
    authorId: 'usr-owner-001',
    authorName: 'John Miko Sarsalijo',
    authorAvatar: '/images/avatar-john-miko.png',
    authorRole: 'App Owner & Finance Manager',
    ministryLabel: 'Worship & Media',
    content: `Praise God for His unfailing grace and faithfulness! 🙏\n\nThis week, our software team and ministry volunteers witnessed how God answers earnest prayer. When faced with tight deadlines and complex challenges, the Lord provided wisdom and peace that surpasses all understanding.\n\n"He who began a good work in you will carry it on to completion until the day of Christ Jesus." (Philippians 1:6). Whatever trial you are facing today, stay steadfast. Jesus is on the throne!`,
    postType: 'community',
    category: 'Testimony',
    imageUrls: ['/images/fellowship-bible-study.jpg'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    isHidden: false,
    commentsEnabled: true,
    reactions: [],
    reactionCounts: { like: 3, love: 7, care: 2, celebrate: 3, pray: 9 },
    comments: [],
    commentsCount: 4
  },
  {
    id: 'post-comm-reflection-2',
    authorId: 'user-1793740018746',
    authorName: 'Kennedy Lopez',
    authorAvatar: '/icons/church-logo.png',
    authorRole: 'Church Member',
    ministryLabel: 'Intercessory Prayer',
    content: `Scripture Reflection for Today:\n\n"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." — Philippians 4:6-7\n\nLet us take our burdens to Jesus this morning in quiet prayer. He hears every whispered plea of His saints. ❤️`,
    postType: 'community',
    category: 'Scripture Reflection',
    imageUrls: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    isHidden: false,
    commentsEnabled: true,
    reactions: [],
    reactionCounts: { like: 5, love: 8, care: 3, celebrate: 1, pray: 12 },
    comments: [],
    commentsCount: 2
  },
  {
    id: 'post-comm-worship-3',
    authorId: 'user-1793740233975',
    authorName: 'Justin Dasco',
    authorAvatar: '/icons/church-logo.png',
    authorRole: 'Church Member',
    ministryLabel: 'Music Ministry',
    content: `Rehearsing for Sunday's service with our vocalists and musicians! So blessed by Psalm 100:4: "Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name."\n\nCan't wait to lift up the name of Jesus with the entire congregation this Sunday! Who is excited for Sunday worship? 🎶🙌`,
    postType: 'community',
    category: 'Ministry Activity',
    imageUrls: ['/images/worship-service-poster.jpg'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    isHidden: false,
    commentsEnabled: true,
    reactions: [],
    reactionCounts: { like: 6, love: 9, care: 1, celebrate: 5, pray: 6 },
    comments: [],
    commentsCount: 3
  }
];

// Initial seed comments
const INITIAL_COMMENTS: PostComment[] = [
  {
    id: 'comm-1',
    postId: 'post-ann-colossians',
    userId: 'usr-owner-001',
    userName: 'John Miko Sarsalijo',
    userAvatar: '/images/avatar-john-miko.png',
    userRole: 'App Owner & Finance Manager',
    parentCommentId: null,
    content: 'Amen Pastor! Excited to lead the worship team in lifting up high praises to King Jesus this Sunday.',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 'comm-1-reply-1',
    postId: 'post-ann-colossians',
    userId: 'usr-pastor-john-eric',
    userName: 'John Eric Manjares',
    userAvatar: '/images/pastor-john-eric-manjares.png',
    userRole: 'Senior Pastor',
    parentCommentId: 'comm-1',
    content: 'Praise the Lord, Bro Miko! May the Holy Spirit fill our praises with power and conviction.',
    createdAt: new Date(Date.now() - 1000 * 60 * 160).toISOString()
  },
  {
    id: 'comm-2',
    postId: 'post-ann-colossians',
    userId: 'user-1793740018746',
    userName: 'Kennedy Lopez',
    userAvatar: '/icons/church-logo.png',
    userRole: 'Church Member',
    parentCommentId: null,
    content: 'Bringing my entire family and neighbors this Sunday! Praise God for this series.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'comm-3',
    postId: 'post-comm-testimony-1',
    userId: 'usr-pastor-john-eric',
    userName: 'John Eric Manjares',
    userAvatar: '/images/pastor-john-eric-manjares.png',
    userRole: 'Senior Pastor',
    parentCommentId: null,
    content: 'Glory to God! God will always crown the faithful labor of His servants. Proud of you brother.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  }
];

// Initial seed reactions
const INITIAL_REACTIONS: PostReaction[] = [
  {
    id: 'rx-1',
    postId: 'post-ann-colossians',
    userId: 'usr-owner-001',
    userName: 'John Miko Sarsalijo',
    userAvatar: '/images/avatar-john-miko.png',
    reactionType: 'pray',
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString()
  },
  {
    id: 'rx-2',
    postId: 'post-ann-colossians',
    userId: 'user-1793740018746',
    userName: 'Kennedy Lopez',
    userAvatar: '/icons/church-logo.png',
    reactionType: 'love',
    createdAt: new Date(Date.now() - 1000 * 60 * 190).toISOString()
  },
  {
    id: 'rx-3',
    postId: 'post-comm-testimony-1',
    userId: 'usr-pastor-john-eric',
    userName: 'John Eric Manjares',
    userAvatar: '/images/pastor-john-eric-manjares.png',
    reactionType: 'pray',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
  }
];

export class ChurchFeedStore {
  private static load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private static save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('bjc_feed_change'));
    } catch (e) {
      console.warn(`Failed to save to localStorage (${key}):`, e);
    }
  }

  // --- RAW GETTERS ---
  private static getRawPosts(): FeedPost[] {
    return this.load<FeedPost[]>(KEY_FEED_POSTS, INITIAL_FEED_POSTS);
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

      // Sort comments chronologically
      postComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return {
        ...post,
        reactions: postReactions,
        reactionCounts: counts,
        userReaction,
        comments: postComments,
        commentsCount: Math.max(postComments.length, post.commentsCount || 0)
      };
    });

    // Sort order:
    // 1. Pinned announcements first (by pinnedAt or createdAt desc)
    // 2. All other posts by createdAt desc
    return enrichedPosts.sort((a, b) => {
      const aIsPinned = !a.isHidden && a.postType === 'announcement' && (a.isPinned || a.announcementPriority === 'pinned');
      const bIsPinned = !b.isHidden && b.postType === 'announcement' && (b.isPinned || b.announcementPriority === 'pinned');

      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;

      // Both pinned or both regular: sort newest first
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
  }

  // --- CLOUD SYNC WITH SUPABASE ---
  static async fetchFeedPostsFromCloud(currentUser?: UserProfile | null): Promise<FeedPost[]> {
    if (!supabase) return this.getFeedPosts(currentUser);

    try {
      // 1. Fetch posts
      const { data: cloudPosts, error: postErr } = await supabase
        .from('church_feed_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (cloudPosts && !postErr && cloudPosts.length > 0) {
        const mapped: FeedPost[] = cloudPosts.map((d: any) => ({
          id: d.id,
          authorId: d.author_id,
          authorName: d.author_name,
          authorAvatar: d.author_avatar || '/icons/church-logo.png',
          authorRole: d.author_role || 'Church Member',
          ministryLabel: d.ministry_label,
          content: d.content,
          postType: (d.post_type as FeedPostType) || 'community',
          category: d.category || 'General',
          imageUrls: Array.isArray(d.image_urls) ? d.image_urls : (d.image_url ? [d.image_url] : []),
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          isHidden: Boolean(d.is_hidden),
          commentsEnabled: d.comments_enabled !== false,
          announcementTitle: d.announcement_title || d.title,
          announcementPriority: d.announcement_priority || (d.is_pinned ? 'pinned' : 'normal'),
          isPinned: Boolean(d.is_pinned),
          pinnedAt: d.pinned_at,
          eventDate: d.event_date,
          eventTime: d.event_time,
          eventLocation: d.event_location,
          actionButtonLabel: d.action_button_label,
          actionButtonUrl: d.action_button_url,
          reactions: [],
          reactionCounts: { like: 0, love: 0, care: 0, celebrate: 0, pray: 0 },
          comments: [],
          commentsCount: 0
        }));

        this.save(KEY_FEED_POSTS, mapped);
      }

      // 2. Fetch reactions
      const { data: cloudReactions } = await supabase
        .from('church_post_reactions')
        .select('*');

      if (cloudReactions && cloudReactions.length > 0) {
        const mappedReactions: PostReaction[] = cloudReactions.map((r: any) => ({
          id: r.id,
          postId: r.post_id,
          userId: r.user_id,
          userName: r.user_name || 'Member',
          userAvatar: r.user_avatar || '/icons/church-logo.png',
          reactionType: r.reaction_type as FeedReactionType,
          createdAt: r.created_at
        }));
        this.save(KEY_REACTIONS, mappedReactions);
      }

      // 3. Fetch comments
      const { data: cloudComments } = await supabase
        .from('church_post_comments')
        .select('*')
        .order('created_at', { ascending: true });

      if (cloudComments && cloudComments.length > 0) {
        const mappedComments: PostComment[] = cloudComments.map((c: any) => ({
          id: c.id,
          postId: c.post_id,
          userId: c.user_id,
          userName: c.user_name,
          userAvatar: c.user_avatar || '/icons/church-logo.png',
          userRole: c.user_role || 'Church Member',
          parentCommentId: c.parent_comment_id || null,
          content: c.content,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
        this.save(KEY_COMMENTS, mappedComments);
      }
    } catch (e) {
      console.warn('fetchFeedPostsFromCloud error, falling back to local storage:', e);
    }

    return this.getFeedPosts(currentUser);
  }

  // --- POST CREATION ---
  static async createPost(params: {
    author: UserProfile;
    content: string;
    imageUrls?: string[];
    category?: string;
    postType?: FeedPostType;
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
      category: params.category || (effectivePostType === 'announcement' ? 'Official Announcement' : 'Personal Update'),
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
      reactions: [],
      reactionCounts: { like: 0, love: 0, care: 0, celebrate: 0, pray: 0 },
      comments: [],
      commentsCount: 0
    };

    const currentPosts = this.getRawPosts();
    currentPosts.unshift(newPost);
    this.save(KEY_FEED_POSTS, currentPosts);

    // Sync to Supabase
    if (supabase) {
      try {
        await supabase.from('church_feed_posts').insert({
          id: newPost.id,
          author_id: newPost.authorId,
          author_name: newPost.authorName,
          author_avatar: newPost.authorAvatar,
          author_role: newPost.authorRole,
          ministry_label: newPost.ministryLabel,
          content: newPost.content,
          post_type: newPost.postType,
          category: newPost.category,
          image_urls: newPost.imageUrls,
          is_hidden: newPost.isHidden,
          comments_enabled: newPost.commentsEnabled,
          announcement_title: newPost.announcementTitle,
          announcement_priority: newPost.announcementPriority,
          is_pinned: newPost.isPinned,
          pinned_at: newPost.pinnedAt,
          event_date: newPost.eventDate,
          event_time: newPost.eventTime,
          event_location: newPost.eventLocation,
          action_button_label: newPost.actionButtonLabel,
          action_button_url: newPost.actionButtonUrl,
          created_at: newPost.createdAt,
          updated_at: newPost.updatedAt
        });
      } catch (e) {
        console.warn('createPost cloud sync error:', e);
      }
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
        await supabase.from('church_feed_posts').update({
          content: target.content,
          image_urls: target.imageUrls,
          announcement_title: target.announcementTitle,
          updated_at: target.updatedAt
        }).eq('id', postId);
      } catch (e) {
        console.warn('editPost cloud sync error:', e);
      }
    }

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
        await supabase.from('church_post_reactions').delete().eq('post_id', postId);
        await supabase.from('church_post_comments').delete().eq('post_id', postId);
        await supabase.from('church_feed_posts').delete().eq('id', postId);
      } catch (e) {
        console.warn('deletePost cloud sync error:', e);
      }
    }

    return true;
  }

  // --- PIN / UNPIN ANNOUNCEMENT (ADMIN ONLY) ---
  static async togglePinAnnouncement(postId: string, isPinned: boolean, adminUser: UserProfile): Promise<boolean> {
    if (!isChurchAdmin(adminUser)) {
      throw new Error("Only church administrators can pin or unpin announcements.");
    }

    const currentPosts = this.getRawPosts();
    const post = currentPosts.find(p => p.id === postId);
    if (!post) return false;

    post.isPinned = isPinned;
    post.announcementPriority = isPinned ? 'pinned' : 'normal';
    post.pinnedAt = isPinned ? new Date().toISOString() : undefined;
    post.updatedAt = new Date().toISOString();

    this.save(KEY_FEED_POSTS, currentPosts);

    this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: isPinned ? 'pin_announcement' : 'unpin_announcement',
      targetId: postId,
      targetType: 'post'
    });

    if (supabase) {
      try {
        await supabase.from('church_feed_posts').update({
          is_pinned: post.isPinned,
          announcement_priority: post.announcementPriority,
          pinned_at: post.pinnedAt,
          updated_at: post.updatedAt
        }).eq('id', postId);
      } catch (e) {
        console.warn('togglePin cloud sync error:', e);
      }
    }

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

        if (supabase) {
          supabase.from('church_post_reactions').delete().eq('id', existing.id).then();
        }
      } else {
        // CHANGE to new reaction
        allReactions[existingIndex].reactionType = reactionType;
        allReactions[existingIndex].createdAt = new Date().toISOString();
        changed = true;

        if (supabase) {
          supabase.from('church_post_reactions').update({
            reaction_type: reactionType,
            created_at: allReactions[existingIndex].createdAt
          }).eq('id', existing.id).then();
        }
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

      if (supabase) {
        supabase.from('church_post_reactions').insert({
          id: newReaction.id,
          post_id: newReaction.postId,
          user_id: newReaction.userId,
          user_name: newReaction.userName,
          user_avatar: newReaction.userAvatar,
          reaction_type: newReaction.reactionType,
          created_at: newReaction.createdAt
        }).then();
      }
    }

    if (changed) {
      this.save(KEY_REACTIONS, allReactions);
    }

    return changed;
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
      supabase.from('church_post_comments').insert({
        id: newComment.id,
        post_id: newComment.postId,
        user_id: newComment.userId,
        user_name: newComment.userName,
        user_avatar: newComment.userAvatar,
        user_role: newComment.userRole,
        parent_comment_id: newComment.parentCommentId,
        content: newComment.content,
        created_at: newComment.createdAt
      }).then();
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
      supabase.from('church_post_comments').update({
        content: comment.content,
        updated_at: comment.updatedAt
      }).eq('id', commentId).then();
    }

    return true;
  }

  static deleteComment(commentId: string, user: UserProfile): boolean {
    const allComments = this.getRawComments();
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return false;

    if (comment.userId !== user.id && !isChurchAdmin(user)) {
      throw new Error("You do not have permission to delete this comment.");
    }

    // Also remove any nested child replies
    const filtered = allComments.filter(c => c.id !== commentId && c.parentCommentId !== commentId);
    this.save(KEY_COMMENTS, filtered);

    if (supabase) {
      supabase.from('church_post_comments').delete().or(`id.eq.${commentId},parent_comment_id.eq.${commentId}`).then();
    }

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
