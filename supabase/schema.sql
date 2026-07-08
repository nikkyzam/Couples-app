-- Kindle — Supabase schema for cross-device sync.
-- Run this once in your Supabase project's SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: it drops and recreates policies/functions.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- A "couple" is the shared private space that two accounts join.
create table if not exists public.couples (
  id             uuid primary key default gen_random_uuid(),
  invite_code    text unique not null,
  comfort        int  not null default 2,
  safe_word      text not null default 'pineapple',
  unlocked_level int  not null default 1,
  play_count     int  not null default 0,
  owned_toys     text[] not null default '{}',  -- shared toy box, synced between partners
  wishlist       text[] not null default '{}',  -- toys the couple wants to buy
  cycle_last_start    date,  -- optional period tracking (null = off)
  cycle_length        int,
  cycle_period_length int,
  cycle_owner         text,  -- 'A' | 'B' — whose cycle it is
  created_at     timestamptz not null default now()
);

-- For projects created before these columns existed:
alter table public.couples add column if not exists owned_toys text[] not null default '{}';
alter table public.couples add column if not exists wishlist   text[] not null default '{}';
alter table public.couples add column if not exists cycle_last_start    date;
alter table public.couples add column if not exists cycle_length        int;
alter table public.couples add column if not exists cycle_period_length int;
alter table public.couples add column if not exists cycle_owner         text;

-- Each member is one authenticated user, tied to a slot ('A' or 'B').
create table if not exists public.members (
  couple_id    uuid not null references public.couples(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  display_name text not null default '',
  emoji        text not null default '💜',
  slot         text not null check (slot in ('A', 'B')),
  primary key (couple_id, user_id)
);

-- Private notes between the two partners.
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  from_user  uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  mood       text not null default '💌',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- Shared sex / date schedule — planned moments both partners can see.
create table if not exists public.plans (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  plan_date  date not null,
  plan_time  text,
  title      text not null,
  note       text,
  done       boolean not null default false,
  created_at timestamptz not null default now()
);

-- Yes / No / Maybe votes, one row per user per item.
create table if not exists public.desire_votes (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  item_id   text not null,
  vote      text check (vote in ('yes', 'maybe', 'no')),
  primary key (couple_id, user_id, item_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Membership helper (SECURITY DEFINER to avoid recursive RLS checks)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.is_member(c uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.members where couple_id = c and user_id = auth.uid()
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.couples      enable row level security;
alter table public.members      enable row level security;
alter table public.notes        enable row level security;
alter table public.plans        enable row level security;
alter table public.desire_votes enable row level security;

drop policy if exists couples_rw on public.couples;
create policy couples_rw on public.couples
  for all using (public.is_member(id)) with check (public.is_member(id));

drop policy if exists members_read on public.members;
create policy members_read on public.members
  for select using (public.is_member(couple_id));

drop policy if exists members_self on public.members;
create policy members_self on public.members
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notes_rw on public.notes;
create policy notes_rw on public.notes
  for all using (public.is_member(couple_id)) with check (public.is_member(couple_id));

drop policy if exists plans_rw on public.plans;
create policy plans_rw on public.plans
  for all using (public.is_member(couple_id)) with check (public.is_member(couple_id));

drop policy if exists votes_read on public.desire_votes;
create policy votes_read on public.desire_votes
  for select using (public.is_member(couple_id));

drop policy if exists votes_self on public.desire_votes;
create policy votes_self on public.desire_votes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- Create / join a couple (SECURITY DEFINER so the joiner can look up the code
-- before they are a member — RLS would otherwise hide the row).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.create_couple(p_name text, p_emoji text)
returns uuid language plpgsql security definer
set search_path = public as $$
declare cid uuid; code text;
begin
  code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  insert into public.couples (invite_code) values (code) returning id into cid;
  insert into public.members (couple_id, user_id, display_name, emoji, slot)
    values (cid, auth.uid(), coalesce(nullif(p_name, ''), 'Partner 1'), coalesce(p_emoji, '💜'), 'A');
  return cid;
end; $$;

create or replace function public.join_couple(p_code text, p_name text, p_emoji text)
returns uuid language plpgsql security definer
set search_path = public as $$
declare cid uuid; taken int;
begin
  select id into cid from public.couples where invite_code = upper(trim(p_code));
  if cid is null then
    raise exception 'That invite code doesn''t match any space.';
  end if;

  -- Already a member? Just update the profile and return.
  if exists (select 1 from public.members where couple_id = cid and user_id = auth.uid()) then
    update public.members set display_name = coalesce(nullif(p_name, ''), display_name),
                              emoji = coalesce(p_emoji, emoji)
      where couple_id = cid and user_id = auth.uid();
    return cid;
  end if;

  select count(*) into taken from public.members where couple_id = cid;
  if taken >= 2 then
    raise exception 'This space already has two partners.';
  end if;

  insert into public.members (couple_id, user_id, display_name, emoji, slot)
    values (cid, auth.uid(), coalesce(nullif(p_name, ''), 'Partner 2'), coalesce(p_emoji, '❤️'), 'B');
  return cid;
end; $$;

-- Leave your current space so you can create or join a different one. If you were
-- the last member, the space (and its notes/votes, via cascade) is removed too.
create or replace function public.leave_couple()
returns void language plpgsql security definer
set search_path = public as $$
declare cid uuid; remaining int;
begin
  select couple_id into cid from public.members where user_id = auth.uid() limit 1;
  if cid is null then
    return; -- not in a space; nothing to do
  end if;

  delete from public.members where couple_id = cid and user_id = auth.uid();

  select count(*) into remaining from public.members where couple_id = cid;
  if remaining = 0 then
    delete from public.couples where id = cid; -- cascades notes + desire_votes
  end if;
end; $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime: broadcast row changes so both phones update live.
-- Idempotent so this whole file is safe to re-run (e.g. on every app startup).
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['notes', 'plans', 'desire_votes', 'couples', 'members'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
