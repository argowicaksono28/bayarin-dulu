-- ──────────────────────────────────────────────────────────────
-- Bayarin Dulu — Initial Schema (idempotent)
-- ──────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── Profiles (extends auth.users) ────────────────────────────
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text not null,
  initials   text not null generated always as (
               upper(
                 substring(split_part(name, ' ', 1) from 1 for 1) ||
                 coalesce(substring(split_part(name, ' ', 2) from 1 for 1), '')
               )
             ) stored,
  phone      text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Groups ───────────────────────────────────────────────────
create table if not exists groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  emoji       text not null default '🎉',
  cover_color text not null default 'bg-blue-500',
  created_by  uuid references profiles(id) not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Group Members ─────────────────────────────────────────────
create table if not exists group_members (
  group_id  uuid references groups(id) on delete cascade,
  user_id   uuid references profiles(id) on delete cascade,
  role      text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- ── Expenses ──────────────────────────────────────────────────
create table if not exists expenses (
  id                    uuid primary key default uuid_generate_v4(),
  group_id              uuid references groups(id) on delete cascade not null,
  description           text not null,
  amount                bigint not null,
  base_amount           bigint not null,
  tax_percent           numeric(5, 2) default 0,
  service_charge_percent numeric(5, 2) default 0,
  paid_by               uuid references profiles(id) not null,
  split_type            text not null default 'equal'
                          check (split_type in ('equal','percentage','exact','shares')),
  category              text not null default '📦',
  notes                 text,
  created_by            uuid references profiles(id) not null,
  created_at            timestamptz default now()
);

-- ── Expense Splits ────────────────────────────────────────────
create table if not exists expense_splits (
  expense_id uuid references expenses(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  amount     bigint not null,
  primary key (expense_id, user_id)
);

-- ── Settlements ───────────────────────────────────────────────
create table if not exists settlements (
  id           uuid primary key default uuid_generate_v4(),
  group_id     uuid references groups(id) on delete cascade not null,
  from_user_id uuid references profiles(id) not null,
  to_user_id   uuid references profiles(id) not null,
  amount       bigint not null,
  settled_at   timestamptz default now(),
  status       text not null default 'completed' check (status in ('completed', 'cancelled'))
);

-- ── Activities ────────────────────────────────────────────────
create table if not exists activities (
  id             uuid primary key default uuid_generate_v4(),
  group_id       uuid references groups(id) on delete cascade not null,
  type           text not null
                   check (type in ('expense_added','expense_edited','expense_deleted','member_joined','settlement')),
  actor_id       uuid references profiles(id) not null,
  target_user_id uuid references profiles(id),
  expense_id     uuid references expenses(id),
  amount         bigint,
  description    text not null,
  created_at     timestamptz default now()
);

-- ── Notifications ─────────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade not null,
  type       text not null
               check (type in ('payment_request','expense_added','group_invite','settlement_reminder')),
  title      text not null,
  body       text not null,
  is_read    boolean default false,
  group_id   uuid references groups(id) on delete set null,
  actor_id   uuid references profiles(id),
  created_at timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────────────

alter table profiles       enable row level security;
alter table groups         enable row level security;
alter table group_members  enable row level security;
alter table expenses       enable row level security;
alter table expense_splits enable row level security;
alter table settlements    enable row level security;
alter table activities     enable row level security;
alter table notifications  enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "profiles: read all"   on profiles;
drop policy if exists "profiles: own insert" on profiles;
drop policy if exists "profiles: own update" on profiles;

drop policy if exists "groups: member read"        on groups;
drop policy if exists "groups: authenticated insert" on groups;
drop policy if exists "groups: admin update"       on groups;

drop policy if exists "group_members: member read"       on group_members;
drop policy if exists "group_members: insert self"       on group_members;
drop policy if exists "group_members: admin insert others" on group_members;

drop policy if exists "expenses: member read"   on expenses;
drop policy if exists "expenses: member insert" on expenses;
drop policy if exists "expenses: member update" on expenses;
drop policy if exists "expenses: member delete" on expenses;

drop policy if exists "expense_splits: member read"   on expense_splits;
drop policy if exists "expense_splits: member insert" on expense_splits;

drop policy if exists "settlements: member read"   on settlements;
drop policy if exists "settlements: member insert" on settlements;

drop policy if exists "activities: member read"   on activities;
drop policy if exists "activities: member insert" on activities;

drop policy if exists "notifications: own read"   on notifications;
drop policy if exists "notifications: own update" on notifications;

-- Profiles
create policy "profiles: read all"   on profiles for select using (true);
create policy "profiles: own insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles: own update" on profiles for update using (auth.uid() = id);

-- Groups
create policy "groups: member read" on groups for select
  using (exists (select 1 from group_members where group_id = id and user_id = auth.uid()));
create policy "groups: authenticated insert" on groups for insert
  with check (auth.uid() = created_by);
create policy "groups: admin update" on groups for update
  using (exists (select 1 from group_members where group_id = id and user_id = auth.uid() and role = 'admin'));

-- Group members
create policy "group_members: member read" on group_members for select
  using (exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid()));
create policy "group_members: insert self" on group_members for insert
  with check (user_id = auth.uid());
create policy "group_members: admin insert others" on group_members for insert
  with check (exists (select 1 from group_members where group_id = group_members.group_id and user_id = auth.uid() and role = 'admin'));

-- Expenses
create policy "expenses: member read" on expenses for select
  using (exists (select 1 from group_members where group_id = expenses.group_id and user_id = auth.uid()));
create policy "expenses: member insert" on expenses for insert
  with check (exists (select 1 from group_members where group_id = group_id and user_id = auth.uid()));
create policy "expenses: member update" on expenses for update
  using (exists (select 1 from group_members where group_id = expenses.group_id and user_id = auth.uid()));
create policy "expenses: member delete" on expenses for delete
  using (paid_by = auth.uid() or created_by = auth.uid());

-- Expense splits
create policy "expense_splits: member read" on expense_splits for select
  using (exists (
    select 1 from expenses e
    join group_members gm on gm.group_id = e.group_id
    where e.id = expense_id and gm.user_id = auth.uid()
  ));
create policy "expense_splits: member insert" on expense_splits for insert
  with check (exists (
    select 1 from expenses e
    join group_members gm on gm.group_id = e.group_id
    where e.id = expense_id and gm.user_id = auth.uid()
  ));

-- Settlements
create policy "settlements: member read" on settlements for select
  using (from_user_id = auth.uid() or to_user_id = auth.uid());
create policy "settlements: member insert" on settlements for insert
  with check (from_user_id = auth.uid() or to_user_id = auth.uid());

-- Activities
create policy "activities: member read" on activities for select
  using (exists (select 1 from group_members where group_id = activities.group_id and user_id = auth.uid()));
create policy "activities: member insert" on activities for insert
  with check (exists (select 1 from group_members where group_id = group_id and user_id = auth.uid()));

-- Notifications
create policy "notifications: own read"   on notifications for select using (user_id = auth.uid());
create policy "notifications: own update" on notifications for update using (user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- Computed views
-- ──────────────────────────────────────────────────────────────

create or replace view group_balances as
select
  e.group_id,
  es.user_id    as from_user_id,
  e.paid_by     as to_user_id,
  sum(es.amount) as amount
from expense_splits es
join expenses e on e.id = es.expense_id
where es.user_id <> e.paid_by
group by e.group_id, es.user_id, e.paid_by;
