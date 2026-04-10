-- Security definer function for creating groups.
-- Bypasses RLS so the server-side API route can create groups even when
-- the PostgREST JWT context isn't available. Security is enforced in the
-- API route (user identity verified via supabase.auth.getUser()).

create or replace function public.create_group(
  p_name       text,
  p_emoji      text,
  p_cover_color text,
  p_user_id    uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
begin
  -- Insert group
  insert into public.groups (name, emoji, cover_color, created_by)
  values (p_name, p_emoji, p_cover_color, p_user_id)
  returning id into v_group_id;

  -- Add creator as admin member
  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, p_user_id, 'admin');

  -- Log activity
  insert into public.activities (group_id, type, actor_id, description)
  values (v_group_id, 'member_joined', p_user_id, 'created the group');

  return jsonb_build_object(
    'id',          v_group_id,
    'name',        p_name,
    'emoji',       p_emoji,
    'cover_color', p_cover_color,
    'created_by',  p_user_id
  );
end;
$$;
