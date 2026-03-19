-- CompoundIQ database schema
-- Run this in your Supabase project's SQL editor

-- Waitlist table for email capture
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  language text default 'no' check (language in ('no', 'en')),
  created_at timestamptz default now()
);

create index if not exists waitlist_email_idx on public.waitlist (email);

-- Profiles extend auth.users with app-specific metadata
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  language text default 'no' check (language in ('no', 'en')),
  plan text default 'free' check (plan in ('free', 'pro', 'teams')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Per-user calculator defaults and account preferences
create table if not exists public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  monthly_contribution numeric(12, 2) not null default 3000,
  expected_return numeric(6, 2) not null default 8,
  inflation numeric(6, 2) not null default 2.5,
  weekly_digest boolean not null default true,
  tax_reminders boolean not null default true,
  product_updates boolean not null default false,
  security_alerts boolean not null default true,
  compact_numbers boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Manual portfolio positions stored per authenticated user
create table if not exists public.portfolio_holdings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  ticker text not null default '',
  shares numeric(18, 6) not null check (shares > 0),
  average_price numeric(18, 2) not null check (average_price >= 0),
  current_price numeric(18, 2) not null check (current_price >= 0),
  account_type text not null check (account_type in ('ASK', 'Aksjer/fond', 'BSU')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_holdings_user_id_idx
  on public.portfolio_holdings (user_id, created_at desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists user_settings_updated_at on public.user_settings;
create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.handle_updated_at();

drop trigger if exists portfolio_holdings_updated_at on public.portfolio_holdings;
create trigger portfolio_holdings_updated_at
  before update on public.portfolio_holdings
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.waitlist enable row level security;
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.portfolio_holdings enable row level security;

drop policy if exists "service role only" on public.waitlist;
create policy "service role only"
  on public.waitlist
  for all
  using (false)
  with check (false);

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

drop policy if exists "Users can view own settings" on public.user_settings;
create policy "Users can view own settings"
  on public.user_settings
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
  on public.user_settings
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
  on public.user_settings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can view own holdings" on public.portfolio_holdings;
create policy "Users can view own holdings"
  on public.portfolio_holdings
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own holdings" on public.portfolio_holdings;
create policy "Users can insert own holdings"
  on public.portfolio_holdings
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own holdings" on public.portfolio_holdings;
create policy "Users can update own holdings"
  on public.portfolio_holdings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own holdings" on public.portfolio_holdings;
create policy "Users can delete own holdings"
  on public.portfolio_holdings
  for delete
  using (auth.uid() = user_id);
