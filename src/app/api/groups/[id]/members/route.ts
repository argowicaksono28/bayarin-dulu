import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("group_members")
    .select("role, joined_at, profiles ( id, name, initials, avatar_url, phone )")
    .eq("group_id", params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const members = (data ?? []).map((m) => ({
    ...(m.profiles as any),
    role: m.role,
    joinedAt: m.joined_at,
  }))

  return NextResponse.json(members)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 })

  // Check not already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", params.id)
    .eq("user_id", userId)
    .single()

  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 })

  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: params.id, user_id: userId, role: "member" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log activity
  await supabase.from("activities").insert({
    group_id: params.id,
    type: "member_joined",
    actor_id: userId,
    description: "was added to the group",
  })

  return NextResponse.json({ success: true })
}
