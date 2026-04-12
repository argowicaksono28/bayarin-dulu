-- ──────────────────────────────────────────────────────────────
-- Security & RLS fixes — 2024-01-08
-- ──────────────────────────────────────────────────────────────

-- ── 1. notifications INSERT policy ──────────────────────────
-- Without this, ALL notification inserts silently fail (RLS enabled, no insert policy).
CREATE POLICY "notifications: member insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (
    -- Actors can insert notifications for users in groups they belong to
    group_id IS NULL
    OR public.is_member_of_group(group_id)
  );

-- ── 2. group_members DELETE policy ──────────────────────────
-- Needed for "Leave Group" functionality.
-- Users can only remove themselves; admins can remove anyone in their group.
DROP POLICY IF EXISTS "group_members: self delete" ON group_members;

CREATE POLICY "group_members: self delete" ON group_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_of_group(group_id)
  );

-- ── 3. expense_splits DELETE policy ─────────────────────────
-- Needed for updating expenses (delete old splits, insert new ones).
DROP POLICY IF EXISTS "expense_splits: member delete" ON expense_splits;

CREATE POLICY "expense_splits: member delete" ON expense_splits FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN group_members gm ON gm.group_id = e.group_id
      WHERE e.id = expense_id AND gm.user_id = auth.uid()
    )
  );

-- ── 4. groups DELETE policy (admin only) ────────────────────
DROP POLICY IF EXISTS "groups: admin delete" ON groups;

CREATE POLICY "groups: admin delete" ON groups FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- ── 5. Tighten settlements INSERT ───────────────────────────
-- Only allow users to create settlements where THEY are the payer (from_user_id).
-- Drop the old permissive policy that allowed either party.
DROP POLICY IF EXISTS "settlements: member insert" ON settlements;

CREATE POLICY "settlements: member insert" ON settlements FOR INSERT TO authenticated
  WITH CHECK (
    from_user_id = auth.uid()
    AND public.is_member_of_group(group_id)
  );
