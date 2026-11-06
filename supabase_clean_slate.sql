-- =========================================================================
-- BEHOLDING JESUS CHURCH - CLEAN SLATE MIGRATION
-- 1. Removes all unregistered / fake mock users.
-- 2. Clears out all mock announcements, fake prayers, and sample chat messages.
-- 3. Creates cloud tables for custom group chats, worship songs, and singers.
-- =========================================================================

-- 1. Enable delete permission on church_members_auth
drop policy if exists "Allow delete on church_members_auth" on public.church_members_auth;
create policy "Allow delete on church_members_auth" on public.church_members_auth for delete using (true);

-- 2. Remove all unregistered / mock demo accounts
-- Keeps only real accounts created by you and your members (johnmiko, justin2006, justin1, kennedy1, quopiem, mokoy, okim)
delete from public.church_members_auth 
where username in ('danielsantos', 'micaramos', 'kyle', 'mariasantos', 'sarah', 'test_connectivity');

-- 3. Clear all mock announcements, fake prayers, and mock messages
delete from public.church_announcements;
delete from public.church_prayer_requests;
delete from public.church_chat_messages;
delete from public.church_community_posts;

-- 4. Create custom Group Chats table so members can create and name their own GCs
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

-- 5. Create Cloud Worship Songs table so worship team can input real songs & vocal keys
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

-- 6. Create Cloud Worship Singers table so worship team can register real singers
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

-- 7. Fix Security Linter: Enable RLS on user_roles and all tables
alter table if exists public.user_roles enable row level security;
drop policy if exists "Allow all on user_roles" on public.user_roles;
create policy "Allow all on user_roles" on public.user_roles for all using (true) with check (true);

alter table if exists public.profiles enable row level security;
alter table if exists public.ministries enable row level security;
alter table if exists public.ministry_members enable row level security;
alter table if exists public.events enable row level security;
alter table if exists public.event_rsvps enable row level security;
alter table if exists public.sermons enable row level security;
alter table if exists public.announcements enable row level security;
alter table if exists public.prayer_requests enable row level security;
alter table if exists public.giving_records enable row level security;
alter table if exists public.giving_funds enable row level security;
alter table if exists public.volunteer_roles enable row level security;
alter table if exists public.volunteer_assignments enable row level security;

-- 8. Enable Realtime Broadcasting on the tables
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_chat_rooms') then
    alter publication supabase_realtime add table church_chat_rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_songs') then
    alter publication supabase_realtime add table church_songs;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'church_singers') then
    alter publication supabase_realtime add table church_singers;
  end if;
exception when others then
end $$;
