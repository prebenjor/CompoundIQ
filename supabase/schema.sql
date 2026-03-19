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
  bsu_enabled boolean not null default true,
  buffer_allocation_pct numeric(5, 2) not null default 20,
  bsu_allocation_pct numeric(5, 2) not null default 30,
  investment_allocation_pct numeric(5, 2) not null default 50,
  weekly_digest boolean not null default true,
  tax_reminders boolean not null default true,
  product_updates boolean not null default false,
  security_alerts boolean not null default true,
  compact_numbers boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.user_settings
  add column if not exists bsu_enabled boolean not null default true;

alter table if exists public.user_settings
  add column if not exists buffer_allocation_pct numeric(5, 2) not null default 20;

alter table if exists public.user_settings
  add column if not exists bsu_allocation_pct numeric(5, 2) not null default 30;

alter table if exists public.user_settings
  add column if not exists investment_allocation_pct numeric(5, 2) not null default 50;

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

-- Budget workspaces let users separate personal, household and project budgets
create table if not exists public.budget_workspaces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'NOK',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists budget_workspaces_primary_idx
  on public.budget_workspaces (user_id)
  where is_primary = true;

create index if not exists budget_workspaces_user_id_idx
  on public.budget_workspaces (user_id, created_at desc);

create table if not exists public.budget_periods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.budget_workspaces(id) on delete cascade,
  label text not null,
  month_start date not null,
  month_end date not null,
  status text not null default 'active' check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, month_start)
);

create index if not exists budget_periods_workspace_idx
  on public.budget_periods (workspace_id, month_start desc);

create table if not exists public.budget_categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.budget_workspaces(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income', 'expense', 'savings')),
  budgeted_amount numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create index if not exists budget_categories_workspace_idx
  on public.budget_categories (workspace_id, kind, sort_order);

create table if not exists public.budget_rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.budget_workspaces(id) on delete cascade,
  category_id uuid references public.budget_categories(id) on delete set null,
  match_type text not null default 'merchant_exact' check (match_type in ('merchant_exact', 'merchant_contains')),
  pattern text not null,
  priority integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budget_rules_workspace_idx
  on public.budget_rules (workspace_id, priority asc, created_at asc);

create table if not exists public.budget_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.budget_workspaces(id) on delete cascade,
  period_id uuid references public.budget_periods(id) on delete set null,
  category_id uuid references public.budget_categories(id) on delete set null,
  transaction_date date not null,
  merchant text not null,
  note text not null default '',
  amount numeric(12, 2) not null check (amount >= 0),
  kind text not null check (kind in ('income', 'expense', 'savings')),
  source text not null default 'manual' check (source in ('manual', 'csv_import', 'smart_rule')),
  import_batch_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budget_transactions_period_idx
  on public.budget_transactions (workspace_id, period_id, transaction_date desc);

create index if not exists budget_transactions_category_idx
  on public.budget_transactions (category_id, transaction_date desc);

create table if not exists public.user_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null check (goal_type in ('emergency_fund', 'bsu_annual')),
  title text not null,
  target_amount numeric(12, 2) not null default 0,
  current_amount numeric(12, 2) not null default 0,
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  priority integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, goal_type)
);

create index if not exists user_goals_user_id_idx
  on public.user_goals (user_id, priority asc, created_at asc);

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

drop trigger if exists budget_workspaces_updated_at on public.budget_workspaces;
create trigger budget_workspaces_updated_at
  before update on public.budget_workspaces
  for each row execute procedure public.handle_updated_at();

drop trigger if exists budget_periods_updated_at on public.budget_periods;
create trigger budget_periods_updated_at
  before update on public.budget_periods
  for each row execute procedure public.handle_updated_at();

drop trigger if exists budget_categories_updated_at on public.budget_categories;
create trigger budget_categories_updated_at
  before update on public.budget_categories
  for each row execute procedure public.handle_updated_at();

drop trigger if exists budget_rules_updated_at on public.budget_rules;
create trigger budget_rules_updated_at
  before update on public.budget_rules
  for each row execute procedure public.handle_updated_at();

drop trigger if exists budget_transactions_updated_at on public.budget_transactions;
create trigger budget_transactions_updated_at
  before update on public.budget_transactions
  for each row execute procedure public.handle_updated_at();

drop trigger if exists user_goals_updated_at on public.user_goals;
create trigger user_goals_updated_at
  before update on public.user_goals
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
alter table public.budget_workspaces enable row level security;
alter table public.budget_periods enable row level security;
alter table public.budget_categories enable row level security;
alter table public.budget_rules enable row level security;
alter table public.budget_transactions enable row level security;
alter table public.user_goals enable row level security;

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

drop policy if exists "Users can view own budget workspaces" on public.budget_workspaces;
create policy "Users can view own budget workspaces"
  on public.budget_workspaces
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own budget workspaces" on public.budget_workspaces;
create policy "Users can insert own budget workspaces"
  on public.budget_workspaces
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own budget workspaces" on public.budget_workspaces;
create policy "Users can update own budget workspaces"
  on public.budget_workspaces
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own budget workspaces" on public.budget_workspaces;
create policy "Users can delete own budget workspaces"
  on public.budget_workspaces
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own budget periods" on public.budget_periods;
create policy "Users can view own budget periods"
  on public.budget_periods
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own budget periods" on public.budget_periods;
create policy "Users can insert own budget periods"
  on public.budget_periods
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own budget periods" on public.budget_periods;
create policy "Users can update own budget periods"
  on public.budget_periods
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own budget periods" on public.budget_periods;
create policy "Users can delete own budget periods"
  on public.budget_periods
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own budget categories" on public.budget_categories;
create policy "Users can view own budget categories"
  on public.budget_categories
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own budget categories" on public.budget_categories;
create policy "Users can insert own budget categories"
  on public.budget_categories
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own budget categories" on public.budget_categories;
create policy "Users can update own budget categories"
  on public.budget_categories
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own budget categories" on public.budget_categories;
create policy "Users can delete own budget categories"
  on public.budget_categories
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own budget rules" on public.budget_rules;
create policy "Users can view own budget rules"
  on public.budget_rules
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own budget rules" on public.budget_rules;
create policy "Users can insert own budget rules"
  on public.budget_rules
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own budget rules" on public.budget_rules;
create policy "Users can update own budget rules"
  on public.budget_rules
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own budget rules" on public.budget_rules;
create policy "Users can delete own budget rules"
  on public.budget_rules
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own budget transactions" on public.budget_transactions;
create policy "Users can view own budget transactions"
  on public.budget_transactions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own budget transactions" on public.budget_transactions;
create policy "Users can insert own budget transactions"
  on public.budget_transactions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own budget transactions" on public.budget_transactions;
create policy "Users can update own budget transactions"
  on public.budget_transactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own budget transactions" on public.budget_transactions;
create policy "Users can delete own budget transactions"
  on public.budget_transactions
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own goals" on public.user_goals;
create policy "Users can view own goals"
  on public.user_goals
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own goals" on public.user_goals;
create policy "Users can insert own goals"
  on public.user_goals
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own goals" on public.user_goals;
create policy "Users can update own goals"
  on public.user_goals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own goals" on public.user_goals;
create policy "Users can delete own goals"
  on public.user_goals
  for delete
  using (auth.uid() = user_id);
