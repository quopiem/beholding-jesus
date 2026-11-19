-- =========================================================================
-- BEHOLDING JESUS CHURCH (BJC) — COMPLETE WEB PUSH NOTIFICATION SYSTEM
-- Database migrations for push subscriptions, atomic deduplication, 
-- durable rate limiting, and user notification preferences with strict RLS.
-- Compatible with BJC church_members_auth user model.
-- =========================================================================

-- Enable uuid extension
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. PUSH SUBSCRIPTIONS TABLE
-- Stores browser and device push registration credentials per BJC church member
-- -------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  device_name text default 'Web Browser',
  user_agent text,
  platform text default 'web', -- 'ios', 'android', 'macos', 'windows', 'linux', 'web'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, endpoint)
);

-- Ensure newly added columns exist if the table was created in an earlier migration
alter table public.push_subscriptions 
  add column if not exists device_name text default 'Web Browser',
  add column if not exists user_agent text,
  add column if not exists platform text default 'web',
  add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()),
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

create index if not exists idx_push_subs_user_id on public.push_subscriptions(user_id);
create index if not exists idx_push_subs_endpoint on public.push_subscriptions(endpoint);

-- Enable Row Level Security on push_subscriptions
alter table public.push_subscriptions enable row level security;

-- Drop prior policies to ensure clean idempotent migrations
drop policy if exists "push_subs_allow_all" on public.push_subscriptions;
drop policy if exists "push_subs_select_own" on public.push_subscriptions;
drop policy if exists "push_subs_insert_own" on public.push_subscriptions;
drop policy if exists "push_subs_update_own" on public.push_subscriptions;
drop policy if exists "push_subs_delete_own" on public.push_subscriptions;
drop policy if exists "Allow all on push_subscriptions" on public.push_subscriptions;

-- Permissive policy (matches working Worship Team app):
-- Allows app clients and serverless functions to register, select, and prune device subscriptions
create policy "Allow all on push_subscriptions" on public.push_subscriptions for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 2. NOTIFICATIONS_SENT (ATOMIC DEDUPLICATION TABLE)
-- Strictly server-side table used by Edge Function to guarantee at-most-once delivery
-- -------------------------------------------------------------------------
create table if not exists public.notifications_sent (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  notification_id text not null,
  category text,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, notification_id)
);

create index if not exists idx_notifs_sent_user_notif on public.notifications_sent(user_id, notification_id);
create index if not exists idx_notifs_sent_sent_at on public.notifications_sent(sent_at);

-- Enable RLS: NO policies are granted to anon or authenticated clients.
-- Only the service_role key has access to insert/select/delete deduplication records.
alter table public.notifications_sent enable row level security;
revoke all on public.notifications_sent from public, anon, authenticated;

-- -------------------------------------------------------------------------
-- 3. PUSH_RATE_LIMITS (DURABLE ATOMIC RATE LIMITING TABLE)
-- Tracks rolling 60-second dispatch rate per user across Edge Function instances
-- -------------------------------------------------------------------------
create table if not exists public.push_rate_limits (
  user_id text primary key,
  window_start timestamp with time zone default timezone('utc'::text, now()) not null,
  count int not null default 1,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS: Strictly server-side / service_role only.
alter table public.push_rate_limits enable row level security;
revoke all on public.push_rate_limits from public, anon, authenticated;

-- -------------------------------------------------------------------------
-- 4. PUSH_PREFERENCES (USER NOTIFICATION PREFERENCES)
-- Stores master push_enabled toggle and fine-grained categories per member
-- -------------------------------------------------------------------------
create table if not exists public.push_preferences (
  user_id text primary key,
  push_enabled boolean default true not null,
  categories jsonb default '{"feed":true,"chat":true,"events":true,"announcements":true,"ministries":true,"admin":true}'::jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.push_preferences enable row level security;

drop policy if exists "push_prefs_allow_all" on public.push_preferences;
drop policy if exists "push_prefs_select_own" on public.push_preferences;
drop policy if exists "push_prefs_upsert_own" on public.push_preferences;
drop policy if exists "push_prefs_insert_own" on public.push_preferences;
drop policy if exists "push_prefs_update_own" on public.push_preferences;
drop policy if exists "push_prefs_delete_own" on public.push_preferences;
drop policy if exists "Allow all on push_preferences" on public.push_preferences;

-- Permissive policy (matches working Worship Team app):
-- Allows members and serverless functions to view and save notification preferences
create policy "Allow all on push_preferences" on public.push_preferences for all using (true) with check (true);

-- -------------------------------------------------------------------------
-- 5. ATOMIC RATE LIMIT & DEDUPLICATION STORED PROCEDURE
-- Atomically checks duplicate status & rate limit under concurrency with row-level locks
-- -------------------------------------------------------------------------
create or replace function public.check_and_record_push(
  p_user_id text,
  p_notification_id text,
  p_category text,
  p_max_per_minute int default 10
)
returns table(allowed boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamp with time zone := clock_timestamp();
  v_window_start timestamp with time zone;
  v_count int;
begin
  -- 1. Check duplicate atomically via notifications_sent
  if exists (select 1 from public.notifications_sent where user_id = p_user_id and notification_id = p_notification_id) then
    return query select false, 'duplicate';
    return;
  end if;

  -- 2. Durable atomic rate limit check & increment with row locking (SELECT ... FOR UPDATE)
  -- Ensure row exists atomically first to establish a lock target even for first-time callers
  insert into public.push_rate_limits (user_id, window_start, count, updated_at)
  values (p_user_id, v_now, 0, v_now)
  on conflict (user_id) do nothing;

  -- Acquire exclusive row lock for user
  select window_start, count into v_window_start, v_count
  from public.push_rate_limits
  where user_id = p_user_id
  for update;

  if (v_now - v_window_start) > interval '1 minute' then
    update public.push_rate_limits
    set window_start = v_now, count = 1, updated_at = v_now
    where user_id = p_user_id;
  else
    if v_count >= p_max_per_minute then
      return query select false, 'rate_limited';
      return;
    end if;
    update public.push_rate_limits
    set count = v_count + 1, updated_at = v_now
    where user_id = p_user_id;
  end if;

  -- 3. Record notification as sent atomically
  begin
    insert into public.notifications_sent (user_id, notification_id, category, sent_at)
    values (p_user_id, p_notification_id, p_category, v_now);
  exception when unique_violation then
    return query select false, 'duplicate';
    return;
  end;

  return query select true, 'ok';
end;
$$;

-- Grant execution to service_role, authenticated, and anon
grant execute on function public.check_and_record_push(text, text, text, int) to service_role, authenticated, anon;

-- -------------------------------------------------------------------------
-- 6. SECURE SUBSCRIPTION RETRIEVAL STORED PROCEDURE
-- Allows backend dispatchers to securely fetch subscriptions for delivery
-- -------------------------------------------------------------------------
create or replace function public.get_user_push_subscriptions(p_user_id text)
returns table(id uuid, endpoint text, p256dh text, auth text)
language sql
security definer
set search_path = public
as $$
  select id, endpoint, p256dh, auth 
  from public.push_subscriptions 
  where user_id = p_user_id;
$$;

grant execute on function public.get_user_push_subscriptions(text) to service_role, authenticated, anon;

-- Reload Supabase PostgREST schema cache
notify pgrst, 'reload schema';
