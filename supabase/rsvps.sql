-- Run this in the Supabase Dashboard → SQL Editor.
-- Creates the table the wedding RSVP form writes to.

create table if not exists public.rsvps (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text,
  attending    text not null,          -- 'yes' | 'no'
  other_guests text,
  message      text,
  checked_in    boolean not null default false,   -- day-of guest check-in
  checked_in_at timestamptz,                        -- when they were checked in
  created_at    timestamptz not null default now()
);

-- If your table already exists (created before check-in was added), run these once:
alter table public.rsvps add column if not exists checked_in boolean not null default false;
alter table public.rsvps add column if not exists checked_in_at timestamptz;

-- Enable Row Level Security. The app talks to Supabase with the
-- service_role key (server-side only), which bypasses RLS — so with
-- RLS on and NO public policies, the table is NOT readable/writable
-- by the public anon/publishable key. That keeps guest data private.
alter table public.rsvps enable row level security;
