-- Allow guest member UUIDs in expense_splits.user_id
-- Guest members live in guest_members table, not profiles,
-- so the FK to profiles(id) must be dropped.

ALTER TABLE expense_splits DROP CONSTRAINT IF EXISTS expense_splits_user_id_fkey;

-- user_id is still NOT NULL (enforced by primary key) — just no FK.
-- The application layer is responsible for ensuring user_id is either
-- a valid profiles.id OR a valid guest_members.id for the same group.
