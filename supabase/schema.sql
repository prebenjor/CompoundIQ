-- CompoundIQ — Database Schema
-- Run this in your Supabase project's SQL editor

-- Waitlist table for email capture
create table if not exists waitlist (
  id          uuid        default gen_random_uuid() primary key,
  email       text        unique not null,
  language    text        default 'no' check (language in ('no', 'en')),
  created_at  timestamptz default now()
);

-- Index for fast email lookups
create index if not exists waitlist_email_idx on waitlist (email);

-- ────────────────────────────────────────────────────────────
-- User profiles (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────

create table if not exists profiles (
  id          uuid        references auth.users(id) on delete cascade primary key,
  display_name text,
  language    text        default 'no' check (language in ('no', 'en')),
  plan        text        default 'free' check (plan in ('free', 'pro', 'teams')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;

-- Users can only read/update their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Row Level Security
alter table waitlist enable row level security;

-- Only the service role key (used by the API route) can insert/select
-- No public access needed since we go through the API route
create policy "service role only"
  on waitlist
  for all
  using (false)
  with check (false);
