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

-- Enable Row Level Security
alter table waitlist enable row level security;

-- Only the service role key (used by the API route) can insert/select
-- No public access needed since we go through the API route
create policy "service role only"
  on waitlist
  for all
  using (false)
  with check (false);
