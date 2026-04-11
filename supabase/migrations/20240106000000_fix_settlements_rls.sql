-- Fix settlements RLS so any group member can read all settlements for that group.
-- The old policy (from_user_id = auth.uid() OR to_user_id = auth.uid()) meant
-- that when computing group balances, settled debts between OTHER members were
-- invisible to the querying user, causing their balance view to be inconsistent.

DROP POLICY IF EXISTS "settlements: member read" ON settlements;

CREATE POLICY "settlements: member read" ON settlements FOR SELECT
  USING (public.is_member_of_group(group_id));

-- Insert policy stays the same (you can only record a settlement you're part of)
DROP POLICY IF EXISTS "settlements: member insert" ON settlements;

CREATE POLICY "settlements: member insert" ON settlements FOR INSERT
  WITH CHECK (
    (from_user_id = auth.uid() OR to_user_id = auth.uid())
    AND public.is_member_of_group(group_id)
  );
