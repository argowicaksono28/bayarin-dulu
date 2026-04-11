-- Guest members: named people in a group who don't have an app account
CREATE TABLE IF NOT EXISTS guest_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  initials   TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE guest_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group members can manage guests" ON guest_members;
CREATE POLICY "Group members can manage guests" ON guest_members
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = guest_members.group_id
        AND group_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = guest_members.group_id
        AND group_members.user_id = auth.uid()
    )
  );
