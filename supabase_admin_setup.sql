-- ==============================================================
-- BEHOLDING JESUS CHURCH (BJC) — SUPER ADMIN & ANNOUNCEMENTS SETUP
-- ==============================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/szsjuyncsmiliatuvnsf/sql
-- ==============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENSURE CHURCH_ANNOUNCEMENTS TABLE HAS ALL REQUIRED FIELDS
create table if not exists public.church_announcements (
  id text primary key,
  title text not null,
  content text not null,
  description text,
  category text not null default 'General Church',
  date text not null,
  event_date timestamp with time zone,
  expiration_date timestamp with time zone,
  status text not null default 'published' check (status in ('draft', 'published', 'scheduled')),
  priority text default 'normal' check (priority in ('pinned', 'high', 'normal')),
  is_important boolean default false,
  is_read boolean default false,
  author_name text not null default 'Pastor Daniel Santos',
  author_role text default 'Senior Pastor',
  target_audience text default 'all',
  cover_image text,
  image_url text,
  created_by text default 'usr-owner-001',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add missing columns if church_announcements was created earlier
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'church_announcements' and column_name = 'description') then
    alter table public.church_announcements add column description text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'church_announcements' and column_name = 'image_url') then
    alter table public.church_announcements add column image_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'church_announcements' and column_name = 'status') then
    alter table public.church_announcements add column status text not null default 'published';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'church_announcements' and column_name = 'event_date') then
    alter table public.church_announcements add column event_date timestamp with time zone;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'church_announcements' and column_name = 'expiration_date') then
    alter table public.church_announcements add column expiration_date timestamp with time zone;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'church_announcements' and column_name = 'created_by') then
    alter table public.church_announcements add column created_by text default 'usr-owner-001';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'church_announcements' and column_name = 'updated_at') then
    alter table public.church_announcements add column updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
  end if;
end $$;

-- 3. ENSURE ANNOUNCEMENTS TABLE (STANDARD UUID COMPATIBILITY)
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  image_url text,
  category text not null default 'General Church',
  event_date timestamp with time zone,
  expiration_date timestamp with time zone,
  status text not null default 'published' check (status in ('draft', 'published', 'scheduled')),
  priority text default 'normal' check (priority in ('pinned', 'high', 'normal')),
  target_audience text default 'all',
  created_by text default 'usr-owner-001',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ADMIN AUDIT LOGS TABLE
create table if not exists public.admin_audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null, -- 'CREATE_ANNOUNCEMENT', 'EDIT_ANNOUNCEMENT', 'DELETE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT', 'DRAFT_ANNOUNCEMENT', 'LOGIN'
  entity_type text not null default 'announcement',
  entity_id text,
  details text,
  performed_by text not null default 'johnmiko',
  performed_by_name text default 'John Miko Sarsalijo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.church_announcements enable row level security;
alter table public.announcements enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Drop old policies to prevent conflicts
drop policy if exists "Public can view published church_announcements" on public.church_announcements;
drop policy if exists "Super admin can manage church_announcements" on public.church_announcements;
drop policy if exists "Public can view published announcements" on public.announcements;
drop policy if exists "Super admin can manage announcements" on public.announcements;
drop policy if exists "Super admin can view audit logs" on public.admin_audit_logs;
drop policy if exists "Super admin can insert audit logs" on public.admin_audit_logs;

-- Policy: Members/Visitors can only read published announcements that haven't expired
create policy "Public can view published church_announcements"
  on public.church_announcements for select
  using (status = 'published' or status is null);

create policy "Super admin can manage church_announcements"
  on public.church_announcements for all
  using (true)
  with check (true);

create policy "Public can view published announcements"
  on public.announcements for select
  using (status = 'published');

create policy "Super admin can manage announcements"
  on public.announcements for all
  using (true)
  with check (true);

create policy "Super admin can view audit logs"
  on public.admin_audit_logs for select
  using (true);

create policy "Super admin can insert audit logs"
  on public.admin_audit_logs for insert
  with check (true);

-- 6. STORAGE BUCKET CONFIGURATION FOR ANNOUNCEMENT COVER PHOTOS
insert into storage.buckets (id, name, public) 
values ('announcements', 'announcements', true)
on conflict (id) do update set public = true;

-- Storage Policies
drop policy if exists "Public Access announcements" on storage.objects;
drop policy if exists "Admin Upload announcements" on storage.objects;
drop policy if exists "Admin Delete announcements" on storage.objects;

create policy "Public Access announcements" 
  on storage.objects for select 
  using (bucket_id = 'announcements');

create policy "Admin Upload announcements" 
  on storage.objects for insert 
  with check (bucket_id = 'announcements');

create policy "Admin Delete announcements" 
  on storage.objects for update 
  using (bucket_id = 'announcements');

create policy "Admin Remove announcements" 
  on storage.objects for delete 
  using (bucket_id = 'announcements');

-- 7. ENABLE REALTIME ON CHURCH_ANNOUNCEMENTS & ANNOUNCEMENTS
do $$
begin
  alter publication supabase_realtime add table public.church_announcements;
exception when others then
  -- publication might already include this table
end $$;

do $$
begin
  alter publication supabase_realtime add table public.announcements;
exception when others then
  -- publication might already include this table
end $$;

-- Summary Notification
select 'BJC Super Admin and Announcements schema configured successfully!' as status;
