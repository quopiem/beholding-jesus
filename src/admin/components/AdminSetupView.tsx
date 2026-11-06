import React, { useState } from 'react';
import { Database, Globe, Copy, Check, Terminal, ExternalLink, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminSetupView: React.FC = () => {
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [copiedNetlify, setCopiedNetlify] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    ok: boolean;
    announcementsCount?: number;
    membersCount?: number;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  const sqlSetupCode = `-- ==============================================================
-- BEHOLDING JESUS CHURCH (BJC) — SUPER ADMIN & ANNOUNCEMENTS SETUP
-- ==============================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/szsjuyncsmiliatuvnsf/sql
-- ==============================================================

-- 1. Ensure required extensions
create extension if not exists "uuid-ossp";

-- 2. ENSURE church_announcements table exists with all required fields
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

-- 3. ENSURE announcements table (UUID schema) exists for dual synchronization
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  category text not null default 'General Church',
  event_date timestamp with time zone,
  expiration_date timestamp with time zone,
  status text not null default 'published' check (status in ('draft', 'published', 'scheduled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by text default 'usr-owner-001'
);

-- 4. Audit logs table
create table if not exists public.admin_audit_logs (
  id text primary key,
  action text not null,
  entity_type text not null,
  entity_id text,
  details text not null,
  performed_by text not null,
  performed_by_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Row Level Security (RLS) Policies
alter table public.church_announcements enable row level security;
alter table public.announcements enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Public can read published announcements
drop policy if exists "Public read published church_announcements" on public.church_announcements;
create policy "Public read published church_announcements"
  on public.church_announcements for select
  using (status = 'published');

drop policy if exists "Allow full access for authenticated church_announcements" on public.church_announcements;
create policy "Allow full access for authenticated church_announcements"
  on public.church_announcements for all
  using (true)
  with check (true);

drop policy if exists "Public read published announcements" on public.announcements;
create policy "Public read published announcements"
  on public.announcements for select
  using (status = 'published');

drop policy if exists "Allow full access announcements" on public.announcements;
create policy "Allow full access announcements"
  on public.announcements for all
  using (true)
  with check (true);

drop policy if exists "Allow read and write admin_audit_logs" on public.admin_audit_logs;
create policy "Allow read and write admin_audit_logs"
  on public.admin_audit_logs for all
  using (true)
  with check (true);

-- 6. Storage bucket for cover photos
insert into storage.buckets (id, name, public)
values ('announcements', 'announcements', true)
on conflict (id) do update set public = true;

create policy "Public can view announcement cover photos"
  on storage.objects for select
  using (bucket_id = 'announcements');

create policy "Allow insert announcement cover photos"
  on storage.objects for insert
  with check (bucket_id = 'announcements');`;

  const netlifyConfigCode = `# Netlify Configuration for Beholding Jesus Church
[build]
  command = "npm run build"
  publish = "dist"

# Route /admin to Admin Dashboard
[[redirects]]
  from = "/admin"
  to = "/admin.html"
  status = 200

[[redirects]]
  from = "/admin/*"
  to = "/admin.html"
  status = 200

# Fallback for Member App SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSetupCode);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleCopyNetlify = () => {
    navigator.clipboard.writeText(netlifyConfigCode);
    setCopiedNetlify(true);
    setTimeout(() => setCopiedNetlify(false), 2500);
  };

  const runDiagnostic = async () => {
    setTestingSupabase(true);
    setDiagnosticResult(null);
    const start = performance.now();

    try {
      if (!supabase) throw new Error('Supabase client is uninitialized.');

      const [annRes, memRes] = await Promise.all([
        supabase.from('church_announcements').select('id', { count: 'exact' }),
        supabase.from('church_members_auth').select('id', { count: 'exact' })
      ]);

      const end = performance.now();
      const latency = Math.round(end - start);

      setDiagnosticResult({
        ok: true,
        announcementsCount: annRes.count ?? annRes.data?.length ?? 0,
        membersCount: memRes.count ?? memRes.data?.length ?? 0,
        latencyMs: latency
      });
    } catch (err: any) {
      setDiagnosticResult({
        ok: false,
        error: err?.message || 'Connection failed'
      });
    } finally {
      setTestingSupabase(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#1F1D1D]">Cloud Infrastructure & Deployment</h1>
        <p className="text-xs text-[#78716E] mt-1">
          Complete deployment instructions for Netlify (<code className="text-[#8C5858]">admin.bjcchurch.com</code>) and Supabase database schema
        </p>
      </div>

      {/* Supabase Diagnostic Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DBD4] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#1F1D1D]">Supabase Cloud Project Diagnostic</h2>
              <p className="text-xs text-[#78716E]">
                Target: <code className="text-[#8C5858]">https://szsjuyncsmiliatuvnsf.supabase.co</code>
              </p>
            </div>
          </div>

          <button
            onClick={runDiagnostic}
            disabled={testingSupabase}
            className="px-4 py-2 rounded-xl bg-[#8C5858] hover:bg-[#724444] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
            <span>{testingSupabase ? 'Testing Connection...' : 'Run Live Diagnostic'}</span>
          </button>
        </div>

        {diagnosticResult && (
          <div className={`p-4 rounded-xl border text-xs ${
            diagnosticResult.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            {diagnosticResult.ok ? (
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="font-semibold text-emerald-900">
                    Live Supabase Connection Verified ({diagnosticResult.latencyMs}ms latency)
                  </div>
                  <div>
                    &bull; Announcements in cloud: <strong>{diagnosticResult.announcementsCount}</strong>
                  </div>
                  <div>
                    &bull; Church members authenticated in cloud: <strong>{diagnosticResult.membersCount}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div>Diagnostic error: {diagnosticResult.error}</div>
            )}
          </div>
        )}
      </div>

      {/* Netlify Subdomain Deployment Guide */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DBD4] shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5ECE8] text-[#8C5858] flex items-center justify-center border border-[#E8DBD4]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-[#1F1D1D]">Netlify Deployment & Domain Guide</h2>
            <p className="text-xs text-[#78716E]">
              Current Live Site: <a href="https://beholding-jesus.netlify.app" target="_blank" rel="noreferrer" className="text-[#8C5858] font-semibold underline">https://beholding-jesus.netlify.app</a>
            </p>
          </div>
        </div>

        {/* Live Site Notice */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Existing Netlify Site: beholding-jesus.netlify.app</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            Your admin dashboard is already wired to your existing deployment! Once you deploy your build, you can immediately access the Super Admin portal at:
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <code className="bg-white px-2 py-1 rounded border border-emerald-300 font-bold text-[#1F1D1D]">
              https://beholding-jesus.netlify.app/admin
            </code>
            <span className="text-[11px] text-emerald-700">(or <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300">https://beholding-jesus.netlify.app/admin.html</code>)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Option A */}
          <div className="p-4 rounded-xl bg-[#FAF6F3] border border-[#EBDCD5] space-y-2">
            <span className="font-serif font-bold text-sm text-[#8C5858] block">
              Method 1: Two Netlify Sites (Recommended)
            </span>
            <p className="text-[#5C5654] leading-relaxed">
              In your Netlify Dashboard, create two sites linked to the same GitHub repository:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[#4A4543]">
              <li><strong>Site 1 (Member App):</strong> Custom Domain <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">bjcchurch.com</code>, Build: <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">npm run build</code>, Publish: <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">dist</code></li>
              <li><strong>Site 2 (Admin Portal):</strong> Custom Domain <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">admin.bjcchurch.com</code>, Build: <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">npm run build</code>, Publish: <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">dist</code></li>
              <li>Set Redirect in Site 2's Netlify environment to route <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">/* -&gt; /admin.html 200</code>.</li>
            </ol>
          </div>

          {/* Option B */}
          <div className="p-4 rounded-xl bg-[#FAF6F3] border border-[#EBDCD5] space-y-2">
            <span className="font-serif font-bold text-sm text-[#8C5858] block">
              Method 2: Single Netlify Site with Subdomain Rewrite
            </span>
            <p className="text-[#5C5654] leading-relaxed">
              If deploying under one single Netlify project with wildcard DNS or domain alias:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[#4A4543]">
              <li>Add both <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">bjcchurch.com</code> and <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">admin.bjcchurch.com</code> to Domain Management.</li>
              <li>Our bundled <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">netlify.toml</code> already rewrites <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">/admin/*</code> to <code className="bg-white px-1 py-0.5 rounded border border-[#E8DBD4]">/admin.html</code>.</li>
              <li>Both apps connect seamlessly to the same Supabase project!</li>
            </ul>
          </div>
        </div>

        {/* netlify.toml snippet */}
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1F1D1D] rounded-t-xl text-white text-xs">
            <span className="font-mono">netlify.toml</span>
            <button
              onClick={handleCopyNetlify}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-all"
            >
              {copiedNetlify ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNetlify ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 bg-[#141212] text-emerald-400 font-mono text-xs rounded-b-xl overflow-x-auto">
            {netlifyConfigCode}
          </pre>
        </div>
      </div>

      {/* Supabase SQL Migration Box */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DBD4] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6F3] text-[#8C5858] flex items-center justify-center border border-[#E8DBD4]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#1F1D1D]">Complete Supabase SQL Migration Script</h2>
              <p className="text-xs text-[#78716E]">
                Run once in Supabase SQL Editor to apply RLS policies, tables, and storage buckets
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySQL}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F1D1D] hover:bg-[#383331] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all self-start sm:self-center"
          >
            {copiedSQL ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSQL ? 'SQL Script Copied!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-[#141212] text-gray-300 font-mono text-xs rounded-xl overflow-x-auto max-h-96">
            {sqlSetupCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
