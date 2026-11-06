-- ====================================================================
-- BEHOLDING JESUS CHURCH — SUPABASE POSTGRESQL COMPLETE SCHEMA & POLICIES
-- Platform: React + TypeScript + Supabase + Tailwind PWA
-- ====================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES & ROLES & CLOUD AUTHENTICATION
-- --------------------------------------------------------------------
create table if not exists public.church_members_auth (
  id text primary key,
  username text unique not null,
  name text not null,
  email text not null,
  role text not null default 'regular_member' check (role in ('super_admin', 'church_admin', 'pastor', 'ministry_leader', 'ministry_member', 'regular_member')),
  role_title text default 'Church Member',
  avatar text default '/icons/church-logo.png',
  bio text default 'Faithful member of Beholding Jesus Church.',
  salt text not null,
  password_hash text not null,
  failed_attempts int default 0,
  lockout_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  username text unique not null,
  email text not null,
  role text not null default 'regular_member' check (role in ('super_admin', 'church_admin', 'pastor', 'ministry_leader', 'ministry_member', 'regular_member')),
  role_title text default 'Church Member',
  avatar_url text,
  bio text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null,
  assigned_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 2. MINISTRIES
-- --------------------------------------------------------------------
create table if not exists public.ministries (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  category text,
  description text,
  leader_id uuid references public.profiles(id) on delete set null,
  cover_image text,
  meeting_schedule text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.ministry_members (
  id uuid default uuid_generate_v4() primary key,
  ministry_id uuid references public.ministries(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('leader', 'co_leader', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(ministry_id, user_id)
);

create table if not exists public.ministry_join_requests (
  id uuid default uuid_generate_v4() primary key,
  ministry_id uuid references public.ministries(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  experience text,
  status text default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 3. BIBLE MODULE
-- --------------------------------------------------------------------
create table if not exists public.bible_translations (
  id text primary key, -- e.g. 'KJV', 'WEB', 'NIV', 'FSV'
  name text not null,
  language text default 'en',
  copyright text,
  is_public_domain boolean default false,
  is_default boolean default false
);

create table if not exists public.bible_books (
  id text primary key, -- e.g. 'JHN', 'GEN', 'ROM'
  name text not null,
  testament text check (testament in ('OT', 'NT')),
  order_number int not null,
  chapters_count int not null,
  category text
);

create table if not exists public.bible_chapters (
  id uuid default uuid_generate_v4() primary key,
  book_id text references public.bible_books(id) on delete cascade not null,
  chapter_number int not null,
  unique(book_id, chapter_number)
);

create table if not exists public.bible_verses (
  id uuid default uuid_generate_v4() primary key,
  translation_id text references public.bible_translations(id) on delete cascade not null,
  book_id text references public.bible_books(id) on delete cascade not null,
  chapter_number int not null,
  verse_number int not null,
  verse_text text not null,
  unique(translation_id, book_id, chapter_number, verse_number)
);

create table if not exists public.bible_bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id text not null,
  chapter_number int not null,
  verse_number int not null,
  label text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.bible_highlights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id text not null,
  chapter_number int not null,
  verse_number int not null,
  color text default 'gold' check (color in ('gold', 'sage', 'lavender', 'amber', 'rose', 'sky')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, book_id, chapter_number, verse_number)
);

create table if not exists public.bible_notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id text not null,
  chapter_number int not null,
  verse_number int not null,
  verse_text text,
  title text not null,
  content text not null,
  topic text,
  is_private boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.reading_plans (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  duration_days int not null,
  cover_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.reading_plan_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_id uuid references public.reading_plans(id) on delete cascade not null,
  completed_days int[] default array[]::int[],
  last_read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, plan_id)
);

-- --------------------------------------------------------------------
-- 4. COMMUNITY CHAT (Supabase Realtime)
-- --------------------------------------------------------------------
create table if not exists public.chat_rooms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null default 'group' check (type in ('direct', 'group', 'ministry', 'bible_study')),
  description text,
  avatar_url text,
  ministry_id uuid references public.ministries(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.chat_members (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  is_admin boolean default false,
  last_read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.chat_rooms(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  content text not null,
  media_url text,
  reply_to_id uuid references public.chat_messages(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.chat_message_reactions (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.chat_messages(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(message_id, user_id, emoji)
);

create table if not exists public.chat_message_reads (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.chat_messages(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(message_id, user_id)
);

-- --------------------------------------------------------------------
-- 5. CHURCH ANNOUNCEMENTS
-- --------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  cover_image text,
  priority text default 'normal' check (priority in ('pinned', 'high', 'normal')),
  category text not null,
  target_audience text default 'all', -- 'all' or ministry_id
  author_id uuid references public.profiles(id) on delete set null,
  is_archived boolean default false,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.announcement_reads (
  id uuid default uuid_generate_v4() primary key,
  announcement_id uuid references public.announcements(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  read_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(announcement_id, user_id)
);

-- --------------------------------------------------------------------
-- 6. CHURCH EVENTS & SCHEDULES
-- --------------------------------------------------------------------
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  date date not null,
  start_time time not null,
  end_time time,
  location text not null,
  category text not null,
  ministry_id uuid references public.ministries(id) on delete set null,
  cover_image text,
  organizer_id uuid references public.profiles(id) on delete set null,
  requires_registration boolean default false,
  capacity int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.event_registrations (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'registered' check (status in ('registered', 'cancelled', 'attended')),
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- --------------------------------------------------------------------
-- 7. PRAYER REQUESTS & TESTIMONIES
-- --------------------------------------------------------------------
create table if not exists public.prayer_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text default 'General',
  visibility text default 'public' check (visibility in ('private', 'ministry', 'group', 'public')),
  target_ministry_id uuid references public.ministries(id) on delete set null,
  is_anonymous boolean default false,
  is_answered boolean default false,
  testimony_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.prayer_request_participants (
  id uuid default uuid_generate_v4() primary key,
  prayer_request_id uuid references public.prayer_requests(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prayed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(prayer_request_id, user_id)
);

create table if not exists public.testimonies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  image_url text,
  is_approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 8. WORSHIP MINISTRY: SONGS, SINGERS & VOCAL KEYS (Flowchart Engine)
-- --------------------------------------------------------------------
create table if not exists public.songs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  artist text,
  composer text,
  genre text,
  tempo text, -- BPM
  original_key text not null check (original_key in ('C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B')),
  mood text,
  notes text,
  lyrics text,
  audio_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.singers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  profile_picture text,
  default_role text default 'Lead / Soprano',
  vocal_range text, -- e.g. "C3 – C5"
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.singer_song_keys (
  id uuid default uuid_generate_v4() primary key,
  song_id uuid references public.songs(id) on delete cascade not null,
  singer_id uuid references public.singers(id) on delete cascade not null,
  singer_role text default 'Lead' check (singer_role in ('Lead', 'Backup', 'Duet', 'Choir', 'Acoustic Lead')),
  vocal_key text not null check (vocal_key in ('C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B')),
  notation text not null,
  vocal_range text, -- e.g. "D4 – D5"
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.worship_setlists (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  service_date date not null,
  rehearsal_date date,
  worship_leader text not null,
  musicians text,
  multimedia_operator text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.worship_setlist_songs (
  id uuid default uuid_generate_v4() primary key,
  setlist_id uuid references public.worship_setlists(id) on delete cascade not null,
  song_id uuid references public.songs(id) on delete cascade not null,
  order_index int not null,
  segment text not null,
  lead_singer text,
  backups text,
  chosen_key text not null,
  tempo text,
  notes text
);

-- --------------------------------------------------------------------
-- 9. NOTIFICATIONS
-- --------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  link_route text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.notification_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  email_announcements boolean default true,
  push_chat_messages boolean default true,
  push_prayer_updates boolean default true,
  push_worship_schedules boolean default true,
  push_events boolean default true
);

-- --------------------------------------------------------------------
-- 10. ADMINISTRATOR-ASSISTED ACCOUNT RECOVERY
-- --------------------------------------------------------------------
create table if not exists public.password_recovery_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  username text not null,
  full_name text not null,
  request_reason text,
  status text default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  temporary_password text,
  resolved_by text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.church_members_auth enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.bible_notes enable row level security;
alter table public.bible_highlights enable row level security;
alter table public.bible_bookmarks enable row level security;
alter table public.password_recovery_requests enable row level security;

-- Cloud Authentication: Allow reading, registration, and update
create policy "Allow read for cloud auth"
  on public.church_members_auth for select
  using (true);

create policy "Allow registration into cloud auth"
  on public.church_members_auth for insert
  with check (true);

create policy "Allow update for cloud auth"
  on public.church_members_auth for update
  using (true);

-- Password Recovery: Authenticated members can submit, only church leadership can view and resolve
create policy "Anyone can submit password recovery request"
  on public.password_recovery_requests for insert with check (true);

create policy "Church leadership can view password recovery requests"
  on public.password_recovery_requests for select using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('super_admin', 'church_admin', 'pastor')
    )
  );

create policy "Church leadership can resolve password recovery requests"
  on public.password_recovery_requests for update using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() 
      and profiles.role in ('super_admin', 'church_admin', 'pastor')
    )
  );

-- Profiles: Public read, user can update own profile
create policy "Public profiles are viewable by authenticated users" 
  on public.profiles for select using (true);
create policy "Users can update own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Prayer Requests: Private requests only viewable by creator or church leaders
create policy "Prayer request visibility policy"
  on public.prayer_requests for select using (
    visibility = 'public'
    or (visibility = 'private' and auth.uid() = user_id)
    or (exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin', 'church_admin', 'pastor')))
  );

create policy "Users can insert own prayer requests"
  on public.prayer_requests for insert with check (auth.uid() = user_id);

-- Bible Notes: Strictly private to user
create policy "Users can only read own bible notes"
  on public.bible_notes for select using (auth.uid() = user_id);

create policy "Users can create own bible notes"
  on public.bible_notes for insert with check (auth.uid() = user_id);

create policy "Users can update own bible notes"
  on public.bible_notes for update using (auth.uid() = user_id);

create policy "Users can delete own bible notes"
  on public.bible_notes for delete using (auth.uid() = user_id);

-- Chat Messages: Viewable by room members
create policy "Chat messages viewable by room members"
  on public.chat_messages for select using (
    exists (
      select 1 from public.chat_members
      where chat_members.room_id = chat_messages.room_id
      and chat_members.user_id = auth.uid()
    )
  );

-- Enable Supabase Realtime for instant messaging & notifications
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_message_reactions;
alter publication supabase_realtime add table public.prayer_requests;
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.notifications;
