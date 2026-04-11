-- ── Fix 1: activities.expense_id — add ON DELETE SET NULL ────────────────
-- Without this, deleting an expense fails with "activities_expense_id_fkey"
-- because activity log rows still reference the expense being deleted.
-- ON DELETE SET NULL preserves the activity history but clears the FK.

ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_expense_id_fkey;
ALTER TABLE activities
  ADD CONSTRAINT activities_expense_id_fkey
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE SET NULL;

-- ── Fix 2: guest_members RLS — use security-definer helper ───────────────
-- The old policy queried group_members directly, which could cause issues
-- in some PostgREST/RLS contexts. Use is_member_of_group() for consistency.

DROP POLICY IF EXISTS "Group members can manage guests" ON guest_members;

CREATE POLICY "guest_members: member read" ON guest_members FOR SELECT
  USING (public.is_member_of_group(group_id));

CREATE POLICY "guest_members: member insert" ON guest_members FOR INSERT
  WITH CHECK (public.is_member_of_group(group_id));

CREATE POLICY "guest_members: member delete" ON guest_members FOR DELETE
  USING (public.is_member_of_group(group_id));
