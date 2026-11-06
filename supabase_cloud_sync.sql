-- =========================================================================
-- BEHOLDING JESUS CHURCH - CROSS-DEVICE REALTIME CLOUD TABLES
-- This script creates the 5 shared cloud tables so chat, announcements,
-- prayer requests, events, and community posts sync instantly across PC & Mobile.
-- =========================================================================

-- 1. Community Chat Messages
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

-- 2. Prayer Requests & Intercession Chain
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

-- 3. Church Announcements
create table if not exists public.church_announcements (
  id text primary key,
  title text not null,
  content text not null,
  category text not null default 'General',
  date text not null,
  priority text default 'normal',
  is_important boolean default false,
  is_read boolean default false,
  author_name text not null default 'Pastoral Team',
  author_role text default 'Senior Pastor',
  target_audience text default 'all',
  cover_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_announcements enable row level security;
drop policy if exists "Allow all on church_announcements" on public.church_announcements;
create policy "Allow all on church_announcements" on public.church_announcements for all using (true) with check (true);

-- 4. Church Events & Calendar
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

-- 5. Community Posts & Testimonies
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.church_community_posts enable row level security;
drop policy if exists "Allow all on church_community_posts" on public.church_community_posts;
create policy "Allow all on church_community_posts" on public.church_community_posts for all using (true) with check (true);

-- 6. Enable Realtime Broadcasting for live updates
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_chat_messages') then
    alter publication supabase_realtime add table church_chat_messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_prayer_requests') then
    alter publication supabase_realtime add table church_prayer_requests;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_announcements') then
    alter publication supabase_realtime add table church_announcements;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_events') then
    alter publication supabase_realtime add table church_events;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_community_posts') then
    alter publication supabase_realtime add table church_community_posts;
  end if;
exception when others then
  -- publication configuration fallback
end $$;
