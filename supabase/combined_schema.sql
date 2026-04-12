-- ══════════════════════════════════════════════════════════════
-- Bayarin Dulu — Complete Database Schema (All Migrations Combined)
-- Run this in Supabase SQL Editor on a FRESH project
-- ══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════════
-- TABLES
-- ══════════════════════════════════════════════════════════════

-- ── Profiles (extends auth.users) ────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name       TEXT NOT NULL,
  initials   TEXT NOT NULL GENERATED ALWAYS AS (
               upper(
                 substring(split_part(name, ' ', 1) FROM 1 FOR 1) ||
                 coalesce(substring(split_part(name, ' ', 2) FROM 1 FOR 1), '')
               )
             ) STORED,
  phone      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, name, phone)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── Groups ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '🎉',
  cover_color TEXT NOT NULL DEFAULT 'bg-blue-500',
  created_by  UUID REFERENCES profiles(id) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Group Members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
  group_id  UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- ── Guest Members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guest_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  initials   TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Expenses ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id               UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  description            TEXT NOT NULL,
  amount                 BIGINT NOT NULL,
  base_amount            BIGINT NOT NULL,
  tax_percent            NUMERIC(5, 2) DEFAULT 0,
  service_charge_percent NUMERIC(5, 2) DEFAULT 0,
  paid_by                UUID REFERENCES profiles(id) NOT NULL,
  split_type             TEXT NOT NULL DEFAULT 'equal'
                           CHECK (split_type IN ('equal','percentage','exact','shares')),
  category               TEXT NOT NULL DEFAULT '📦',
  notes                  TEXT,
  created_by             UUID REFERENCES profiles(id) NOT NULL,
  created_at             TIMESTAMPTZ DEFAULT now()
);

-- ── Expense Splits ────────────────────────────────────────────
-- NOTE: No FK on user_id — it can be a profiles.id OR a guest_members.id
CREATE TABLE IF NOT EXISTS expense_splits (
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL,
  amount     BIGINT NOT NULL,
  PRIMARY KEY (expense_id, user_id)
);

-- ── Settlements ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settlements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id     UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES profiles(id) NOT NULL,
  to_user_id   UUID REFERENCES profiles(id) NOT NULL,
  amount       BIGINT NOT NULL,
  settled_at   TIMESTAMPTZ DEFAULT now(),
  status       TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled'))
);

-- ── Activities ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id       UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  type           TEXT NOT NULL
                   CHECK (type IN ('expense_added','expense_edited','expense_deleted','member_joined','settlement')),
  actor_id       UUID REFERENCES profiles(id) NOT NULL,
  target_user_id UUID REFERENCES profiles(id),
  expense_id     UUID REFERENCES expenses(id) ON DELETE SET NULL,
  amount         BIGINT,
  description    TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type       TEXT NOT NULL
               CHECK (type IN ('payment_request','expense_added','group_invite','settlement_reminder')),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  group_id   UUID REFERENCES groups(id) ON DELETE SET NULL,
  actor_id   UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ══════════════════════════════════════════════════════════════
-- SECURITY DEFINER HELPER FUNCTIONS (prevent RLS recursion)
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_member_of_group(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_of_group(gid UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ── Create Group Function ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_group(
  p_name       TEXT,
  p_emoji      TEXT,
  p_cover_color TEXT,
  p_user_id    UUID
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_group_id UUID;
BEGIN
  INSERT INTO public.groups (name, emoji, cover_color, created_by)
  VALUES (p_name, p_emoji, p_cover_color, p_user_id)
  RETURNING id INTO v_group_id;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, p_user_id, 'admin');

  INSERT INTO public.activities (group_id, type, actor_id, description)
  VALUES (v_group_id, 'member_joined', p_user_id, 'created the group');

  RETURN jsonb_build_object(
    'id',          v_group_id,
    'name',        p_name,
    'emoji',       p_emoji,
    'cover_color', p_cover_color,
    'created_by',  p_user_id
  );
END;
$$;


-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — Enable on all tables
-- ══════════════════════════════════════════════════════════════

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;


-- ══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ══════════════════════════════════════════════════════════════

-- ── Profiles ──────────────────────────────────────────────────
CREATE POLICY "profiles: read all"   ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles: own insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: own update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ── Groups ────────────────────────────────────────────────────
CREATE POLICY "groups: member read" ON groups FOR SELECT
  USING (public.is_member_of_group(id));

CREATE POLICY "groups: authenticated insert" ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "groups: admin update" ON groups FOR UPDATE
  USING (public.is_admin_of_group(id));

CREATE POLICY "groups: admin delete" ON groups FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- ── Group Members ─────────────────────────────────────────────
CREATE POLICY "group_members: member read" ON group_members FOR SELECT
  USING (public.is_member_of_group(group_id));

CREATE POLICY "group_members: insert self" ON group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "group_members: admin insert others" ON group_members FOR INSERT
  WITH CHECK (public.is_admin_of_group(group_id));

CREATE POLICY "group_members: self delete" ON group_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_of_group(group_id)
  );

-- ── Guest Members ─────────────────────────────────────────────
CREATE POLICY "guest_members: member read" ON guest_members FOR SELECT
  USING (public.is_member_of_group(group_id));

CREATE POLICY "guest_members: member insert" ON guest_members FOR INSERT
  WITH CHECK (public.is_member_of_group(group_id));

CREATE POLICY "guest_members: member delete" ON guest_members FOR DELETE
  USING (public.is_member_of_group(group_id));

-- ── Expenses ──────────────────────────────────────────────────
CREATE POLICY "expenses: member read" ON expenses FOR SELECT
  USING (public.is_member_of_group(group_id));

CREATE POLICY "expenses: member insert" ON expenses FOR INSERT
  WITH CHECK (public.is_member_of_group(group_id));

CREATE POLICY "expenses: member update" ON expenses FOR UPDATE
  USING (public.is_member_of_group(group_id));

CREATE POLICY "expenses: member delete" ON expenses FOR delete
  USING (paid_by = auth.uid() OR created_by = auth.uid());

-- ── Expense Splits ────────────────────────────────────────────
CREATE POLICY "expense_splits: member read" ON expense_splits FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM expenses e
    WHERE e.id = expense_id AND public.is_member_of_group(e.group_id)
  ));

CREATE POLICY "expense_splits: member insert" ON expense_splits FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM expenses e
    WHERE e.id = expense_id AND public.is_member_of_group(e.group_id)
  ));

CREATE POLICY "expense_splits: member delete" ON expense_splits FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses e
      JOIN group_members gm ON gm.group_id = e.group_id
      WHERE e.id = expense_id AND gm.user_id = auth.uid()
    )
  );

-- ── Settlements ───────────────────────────────────────────────
CREATE POLICY "settlements: member read" ON settlements FOR SELECT
  USING (public.is_member_of_group(group_id));

CREATE POLICY "settlements: member insert" ON settlements FOR INSERT TO authenticated
  WITH CHECK (
    from_user_id = auth.uid()
    AND public.is_member_of_group(group_id)
  );

-- ── Activities ────────────────────────────────────────────────
CREATE POLICY "activities: member read" ON activities FOR SELECT
  USING (public.is_member_of_group(group_id));

CREATE POLICY "activities: member insert" ON activities FOR INSERT
  WITH CHECK (public.is_member_of_group(group_id));

-- ── Notifications ─────────────────────────────────────────────
CREATE POLICY "notifications: own read" ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications: own update" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notifications: member insert" ON notifications FOR INSERT TO authenticated
  WITH CHECK (
    group_id IS NULL
    OR public.is_member_of_group(group_id)
  );


-- ══════════════════════════════════════════════════════════════
-- VIEWS
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW group_balances AS
SELECT
  e.group_id,
  es.user_id    AS from_user_id,
  e.paid_by     AS to_user_id,
  sum(es.amount) AS amount
FROM expense_splits es
JOIN expenses e ON e.id = es.expense_id
WHERE es.user_id <> e.paid_by
GROUP BY e.group_id, es.user_id, e.paid_by;
