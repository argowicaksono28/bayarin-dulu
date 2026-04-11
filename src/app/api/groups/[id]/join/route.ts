import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check group exists
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name")
    .eq("id", params.id)
    .single()

  if (groupError || !group) return NextResponse.json({ error: "Group not found" }, { status: 404 })

  // Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", params.id)
    .eq("user_id", user.id)
    .single()

  if (existing) return NextResponse.json({ alreadyMember: true, groupId: params.id })

  // Join the group
  const { error: joinError } = await supabase
    .from("group_members")
    .insert({ group_id: params.id, user_id: user.id, role: "member" })

  if (joinError) return NextResponse.json({ error: joinError.message }, { status: 500 })

  // Log activity
  await supabase.from("activities").insert({
    group_id: params.id,
    type: "member_joined",
    actor_id: user.id,
    description: `joined the group`,
  })

  return NextResponse.json({ groupId: params.id })
}
