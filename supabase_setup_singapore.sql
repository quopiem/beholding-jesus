-- =========================================================================
-- BEHOLDING JESUS CHURCH (BJC) — COMPLETE NEW SUPABASE CLOUD SETUP (SINGAPORE)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rpeevqhwwbqixuaxhsot/sql/new
-- =========================================================================

-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. AUTHENTICATION & CHURCH MEMBERS (church_members_auth)
-- -------------------------------------------------------------------------
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

alter table public.church_members_auth enable row level security;
drop policy if exists "Allow all on church_members_auth" on public.church_members_auth;
create policy "Allow all on church_members_auth" on public.church_members_auth for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 2. COMMUNITY FEED POSTS (church_community_posts)
-- -------------------------------------------------------------------------
create table if not exists public.church_community_posts (
  id text primary key,
  user_id text not null,
  author_name text not null,
  author_avatar text default '/icons/church-logo.png',
  author_role text default 'Church Member',
  content text not null,
  image_url text,
  likes_count int default 0,
  liked_user_ids jsonb default '[]'::jsonb,
  comments_count int default 0,
  status text default 'published',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_community_posts enable row level security;
drop policy if exists "Allow all on church_community_posts" on public.church_community_posts;
create policy "Allow all on church_community_posts" on public.church_community_posts for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 3. CHURCH ANNOUNCEMENTS (church_announcements)
-- -------------------------------------------------------------------------
create table if not exists public.church_announcements (
  id text primary key,
  title text not null,
  content text not null,
  description text,
  category text not null default 'General Church',
  date text not null default to_char(now(), 'Mon DD, YYYY'),
  event_date timestamp with time zone,
  expiration_date timestamp with time zone,
  status text not null default 'published',
  priority text default 'normal' check (priority in ('pinned', 'high', 'normal', 'archived', 'draft')),
  is_important boolean default false,
  is_read boolean default false,
  author_name text not null default 'Senior Pastor',
  author_role text default 'Senior Pastor',
  target_audience text default 'all',
  cover_image text,
  image_url text,
  created_by text default 'usr-owner-001',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_announcements enable row level security;
drop policy if exists "Allow all on church_announcements" on public.church_announcements;
create policy "Allow all on church_announcements" on public.church_announcements for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 4. CHAT ROOMS & DIRECT MESSAGES (church_chat_rooms)
-- -------------------------------------------------------------------------
create table if not exists public.church_chat_rooms (
  id text primary key,
  title text not null,
  type text default 'group',
  symbol text default '💬',
  avatar text default '/icons/church-logo.png',
  last_message text default '',
  last_message_time text default '',
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_chat_rooms enable row level security;
drop policy if exists "Allow all on church_chat_rooms" on public.church_chat_rooms;
create policy "Allow all on church_chat_rooms" on public.church_chat_rooms for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 5. CHAT MESSAGES & POST COMMENTS (church_chat_messages)
-- -------------------------------------------------------------------------
create table if not exists public.church_chat_messages (
  id text primary key,
  room_id text not null default 'fellowship',
  sender_id text not null,
  sender_name text not null,
  sender_avatar text default '/icons/church-logo.png',
  sender_role text default 'Church Member',
  content text not null,
  reactions jsonb default '[]'::jsonb,
  is_delivered boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_chat_messages enable row level security;
drop policy if exists "Allow all on church_chat_messages" on public.church_chat_messages;
create policy "Allow all on church_chat_messages" on public.church_chat_messages for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 6. PRAYER REQUESTS & INTERCESSION (church_prayer_requests)
-- -------------------------------------------------------------------------
create table if not exists public.church_prayer_requests (
  id text primary key,
  user_id text not null,
  author_name text not null,
  is_anonymous boolean default false,
  category text default 'General',
  title text not null,
  description text not null,
  visibility text default 'public',
  target_ministry_id text,
  praying_count int default 1,
  praying_user_ids jsonb default '[]'::jsonb,
  is_answered boolean default false,
  testimony_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_prayer_requests enable row level security;
drop policy if exists "Allow all on church_prayer_requests" on public.church_prayer_requests;
create policy "Allow all on church_prayer_requests" on public.church_prayer_requests for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 7. WORSHIP SONGS & CHORDS (church_songs)
-- -------------------------------------------------------------------------
create table if not exists public.church_songs (
  id text primary key,
  title text not null,
  artist text default '',
  composer text default '',
  genre text default 'Worship',
  tempo text default '',
  original_key text default 'D',
  mood text default '',
  notes text default '',
  lyrics text default '',
  audio_url text default '',
  singers jsonb default '[]'::jsonb,
  created_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_songs enable row level security;
drop policy if exists "Allow all on church_songs" on public.church_songs;
create policy "Allow all on church_songs" on public.church_songs for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 8. WORSHIP SINGERS (church_singers)
-- -------------------------------------------------------------------------
create table if not exists public.church_singers (
  id text primary key,
  name text not null,
  profile_picture text default '/icons/church-logo.png',
  default_role text default 'Lead',
  vocal_range text default '',
  notes text default '',
  assigned_songs_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_singers enable row level security;
drop policy if exists "Allow all on church_singers" on public.church_singers;
create policy "Allow all on church_singers" on public.church_singers for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 9. CHURCH EVENTS (church_events)
-- -------------------------------------------------------------------------
create table if not exists public.church_events (
  id text primary key,
  title text not null,
  description text not null,
  date text not null,
  start_time text default '09:00 AM',
  end_time text default '11:00 AM',
  location text not null,
  category text not null,
  cover_image text,
  organizer_name text default 'Beholding Jesus Church',
  capacity int default 100,
  attendees_count int default 0,
  registered_user_ids jsonb default '[]'::jsonb,
  requires_registration boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_events enable row level security;
drop policy if exists "Allow all on church_events" on public.church_events;
create policy "Allow all on church_events" on public.church_events for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 10. ADMIN AUDIT LOGS (admin_audit_logs)
-- -------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  entity_type text not null default 'general',
  entity_id text,
  details text,
  performed_by text not null default 'johnmiko',
  performed_by_name text default 'John Miko Sarsalijo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_audit_logs enable row level security;
drop policy if exists "Allow all on admin_audit_logs" on public.admin_audit_logs;
create policy "Allow all on admin_audit_logs" on public.admin_audit_logs for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 11. ENABLE REALTIME BROADCASTING ON CHAT & FEED
-- -------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_chat_messages') then
    alter publication supabase_realtime add table church_chat_messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_chat_rooms') then
    alter publication supabase_realtime add table church_chat_rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_community_posts') then
    alter publication supabase_realtime add table church_community_posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_announcements') then
    alter publication supabase_realtime add table church_announcements;
  end if;
end $$;

-- -------------------------------------------------------------------------
-- 12. SEED DEFAULT FELLOWSHIP CHAT ROOM
-- -------------------------------------------------------------------------
insert into public.church_chat_rooms (id, title, type, symbol, avatar, last_message, last_message_time)
values ('fellowship', 'Sanctuary Fellowship', 'group', '⛪', '/icons/church-logo.png', 'Welcome to Beholding Jesus Church fellowship!', 'Just now')
on conflict (id) do nothing;
