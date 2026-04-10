-- ──────────────────────────────────────────────────────────────
-- Fix: infinite recursion in group_members RLS policy
-- The original policy checked group_members FROM WITHIN a group_members
-- policy, causing infinite recursion. Solution: use security definer
-- functions that bypass RLS when checking membership.
-- ──────────────────────────────────────────────────────────────

-- Step 1: Create security definer helper functions
-- These run as the DB owner and bypass RLS, so no recursion.

create or replace function public.is_member_of_group(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.is_admin_of_group(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role = 'admin'
  );
$$;

-- Step 2: Drop all recursive policies

drop policy if exists "group_members: member read"      on group_members;
drop policy if exists "group_members: insert self"      on group_members;
drop policy if exists "group_members: admin insert others" on group_members;

drop policy if exists "groups: member read"             on groups;
drop policy if exists "groups: authenticated insert"    on groups;
drop policy if exists "groups: admin update"            on groups;

drop policy if exists "expenses: member read"           on expenses;
drop policy if exists "expenses: member insert"         on expenses;
drop policy if exists "expenses: member update"         on expenses;
drop policy if exists "expenses: member delete"         on expenses;

drop policy if exists "expense_splits: member read"     on expense_splits;
drop policy if exists "expense_splits: member insert"   on expense_splits;

drop policy if exists "activities: member read"         on activities;
drop policy if exists "activities: member insert"       on activities;

drop policy if exists "settlements: member read"        on settlements;
drop policy if exists "settlements: member insert"      on settlements;

-- Step 3: Recreate all policies using the helper functions (no recursion)

-- group_members
create policy "group_members: member read" on group_members for select
  using (public.is_member_of_group(group_id));

create policy "group_members: insert self" on group_members for insert
  with check (user_id = auth.uid());

create policy "group_members: admin insert others" on group_members for insert
  with check (public.is_admin_of_group(group_id));

-- groups
create policy "groups: member read" on groups for select
  using (public.is_member_of_group(id));

create policy "groups: authenticated insert" on groups for insert
  with check (auth.uid() = created_by);

create policy "groups: admin update" on groups for update
  using (public.is_admin_of_group(id));

-- expenses
create policy "expenses: member read" on expenses for select
  using (public.is_member_of_group(group_id));

create policy "expenses: member insert" on expenses for insert
  with check (public.is_member_of_group(group_id));

create policy "expenses: member update" on expenses for update
  using (public.is_member_of_group(group_id));

create policy "expenses: member delete" on expenses for delete
  using (paid_by = auth.uid() or created_by = auth.uid());

-- expense_splits
create policy "expense_splits: member read" on expense_splits for select
  using (exists (
    select 1 from expenses e
    where e.id = expense_id and public.is_member_of_group(e.group_id)
  ));

create policy "expense_splits: member insert" on expense_splits for insert
  with check (exists (
    select 1 from expenses e
    where e.id = expense_id and public.is_member_of_group(e.group_id)
  ));

-- activities
create policy "activities: member read" on activities for select
  using (public.is_member_of_group(group_id));

create policy "activities: member insert" on activities for insert
  with check (public.is_member_of_group(group_id));

-- settlements
create policy "settlements: member read" on settlements for select
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

create policy "settlements: member insert" on settlements for insert
  with check (from_user_id = auth.uid() or to_user_id = auth.uid());
