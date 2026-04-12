import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST — generate a new view token for the group
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Only group members can generate a view link
  const { data: membership } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  // Generate a UUID token using Postgres gen_random_uuid()
  const { data, error } = await supabase
    .from("groups")
    .update({ public_view_token: crypto.randomUUID() })
    .eq("id", params.id)
    .select("public_view_token")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ token: data.public_view_token })
}

// DELETE — revoke the view token
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: membership } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  await supabase
    .from("groups")
    .update({ public_view_token: null })
    .eq("id", params.id)

  return NextResponse.json({ success: true })
}
