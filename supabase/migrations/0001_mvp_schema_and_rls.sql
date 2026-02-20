-- TrainSlot MVP schema + RLS (Step B)

create extension if not exists pgcrypto;

-- =========================
-- ENUMS
-- =========================
create type booking_status as enum ('CONFIRMED', 'CANCELLED', 'LATE_CANCEL');
create type payment_status as enum ('UNPAID', 'PAID');
create type exception_type as enum ('BLOCK', 'EXTRA');
create type audit_actor as enum ('CLIENT', 'COACH', 'SYSTEM');

-- =========================
-- UTILITIES
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_coach_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- =========================
-- CORE TABLES
-- =========================
create table if not exists public.coaches (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  display_name text not null,
  contact_email text not null,
  description text,
  location text,
  accent_color text,
  logo_url text,
  timezone text not null default 'Europe/Amsterdam',
  min_notice_hours int not null default 6 check (min_notice_hours >= 0 and min_notice_hours <= 168),
  cancellation_window_hours int not null default 12 check (cancellation_window_hours >= 0 and cancellation_window_hours <= 168),
  max_future_days int not null default 30 check (max_future_days >= 1 and max_future_days <= 365),
  default_buffer_minutes int not null default 0 check (default_buffer_minutes >= 0 and default_buffer_minutes <= 120),
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_coaches_updated_at
before update on public.coaches
for each row execute function public.set_updated_at();

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  name text not null,
  duration_minutes int not null check (duration_minutes between 15 and 240),
  price_cents int,
  credits_cost int not null default 1 check (credits_cost >= 0 and credits_cost <= 20),
  buffer_before_minutes int not null default 0 check (buffer_before_minutes between 0 and 120),
  buffer_after_minutes int not null default 0 check (buffer_after_minutes between 0 and 120),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_services_coach_active on public.services (coach_id, is_active);
create trigger trg_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  unique (coach_id, email)
);

create index if not exists idx_clients_coach on public.clients (coach_id);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index if not exists idx_availability_rules_coach_weekday
  on public.availability_rules (coach_id, weekday) where is_active;

create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  type exception_type not null default 'BLOCK',
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index if not exists idx_availability_exceptions_coach_date
  on public.availability_exceptions (coach_id, date);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  name text not null,
  total_credits int not null check (total_credits > 0 and total_credits <= 500),
  price_cents int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_packages_coach_active on public.packages (coach_id, is_active);
create trigger trg_packages_updated_at
before update on public.packages
for each row execute function public.set_updated_at();

create table if not exists public.client_wallets (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  package_id uuid references public.packages(id) on delete set null,
  credits_remaining int not null check (credits_remaining >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_client_wallets_coach_client on public.client_wallets (coach_id, client_id);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status booking_status not null default 'CONFIRMED',
  payment_status payment_status not null default 'UNPAID',
  credits_deducted int not null default 0 check (credits_deducted >= 0),
  cancel_token_hash text unique,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  check (start_at < end_at)
);

create index if not exists idx_bookings_coach_start on public.bookings (coach_id, start_at);
create index if not exists idx_bookings_coach_status on public.bookings (coach_id, status);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  actor audit_actor not null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_events_coach_created on public.audit_events (coach_id, created_at desc);

-- =========================
-- HELPERS FOR SAFE PUBLIC READS
-- =========================
create or replace view public.public_coach_profiles as
select
  c.id,
  c.slug,
  c.display_name,
  c.description,
  c.location,
  c.accent_color,
  c.logo_url,
  c.timezone,
  c.min_notice_hours,
  c.max_future_days,
  c.default_buffer_minutes
from public.coaches c
where c.is_active = true
  and c.deleted_at is null;

create or replace view public.public_active_services as
select
  s.id,
  s.coach_id,
  s.name,
  s.duration_minutes,
  s.price_cents,
  s.credits_cost,
  s.buffer_before_minutes,
  s.buffer_after_minutes
from public.services s
join public.coaches c on c.id = s.coach_id
where s.is_active = true
  and c.is_active = true
  and c.deleted_at is null;

-- =========================
-- RLS ENABLEMENT
-- =========================
alter table public.coaches enable row level security;
alter table public.services enable row level security;
alter table public.clients enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.bookings enable row level security;
alter table public.packages enable row level security;
alter table public.client_wallets enable row level security;
alter table public.audit_events enable row level security;

-- Views run with owner rights unless protected by security_invoker in newer PG;
-- we control access via grants and the underlying table policies.

-- =========================
-- COACH-SIDE RLS POLICIES
-- =========================
create policy "coach can select own profile" on public.coaches
for select using (id = public.current_coach_id());

create policy "coach can insert own profile" on public.coaches
for insert with check (id = public.current_coach_id());

create policy "coach can update own profile" on public.coaches
for update using (id = public.current_coach_id()) with check (id = public.current_coach_id());

create policy "coach can manage own services" on public.services
for all using (coach_id = public.current_coach_id()) with check (coach_id = public.current_coach_id());

create policy "coach can manage own clients" on public.clients
for all using (coach_id = public.current_coach_id()) with check (coach_id = public.current_coach_id());

create policy "coach can manage own availability rules" on public.availability_rules
for all using (coach_id = public.current_coach_id()) with check (coach_id = public.current_coach_id());

create policy "coach can manage own availability exceptions" on public.availability_exceptions
for all using (coach_id = public.current_coach_id()) with check (coach_id = public.current_coach_id());

create policy "coach can manage own bookings" on public.bookings
for all using (coach_id = public.current_coach_id()) with check (coach_id = public.current_coach_id());

create policy "coach can manage own packages" on public.packages
for all using (coach_id = public.current_coach_id()) with check (coach_id = public.current_coach_id());

create policy "coach can manage own wallets" on public.client_wallets
for all using (coach_id = public.current_coach_id()) with check (coach_id = public.current_coach_id());

create policy "coach can read own audit events" on public.audit_events
for select using (coach_id = public.current_coach_id());

create policy "system can insert audit events" on public.audit_events
for insert with check (true);

-- =========================
-- PUBLIC READ POLICIES (minimal)
-- =========================
create policy "public can read active coaches by slug-safe fields" on public.coaches
for select
using (is_active = true and deleted_at is null);

create policy "public can read active services" on public.services
for select
using (
  is_active = true
  and exists (
    select 1 from public.coaches c
    where c.id = services.coach_id
      and c.is_active = true
      and c.deleted_at is null
  )
);

create policy "public can read active availability rules" on public.availability_rules
for select
using (
  is_active = true
  and exists (
    select 1 from public.coaches c
    where c.id = availability_rules.coach_id
      and c.is_active = true
      and c.deleted_at is null
  )
);

create policy "public can read availability exceptions" on public.availability_exceptions
for select
using (
  exists (
    select 1 from public.coaches c
    where c.id = availability_exceptions.coach_id
      and c.is_active = true
      and c.deleted_at is null
  )
);

-- Ensure anonymous users cannot touch private entities.
revoke all on public.clients from anon;
revoke all on public.bookings from anon;
revoke all on public.packages from anon;
revoke all on public.client_wallets from anon;
revoke all on public.audit_events from anon;

-- Keep booking writes server-side only (service role).
revoke insert, update, delete on public.bookings from authenticated;

-- =========================
-- BOOKING CONCURRENCY HELPER (MVP)
-- =========================
create table if not exists public.coach_locks (
  coach_id uuid primary key references public.coaches(id) on delete cascade,
  updated_at timestamptz not null default now()
);

alter table public.coach_locks enable row level security;
create policy "coach can lock own row" on public.coach_locks
for all using (coach_id = public.current_coach_id()) with check (coach_id = public.current_coach_id());

-- Server-side flow should:
-- 1) upsert coach_locks(coach_id)
-- 2) select * from coach_locks where coach_id = $1 for update
-- 3) run overlap check on bookings(status='CONFIRMED')
-- 4) insert booking if clear, then commit

