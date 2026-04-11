import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Attempt to join — let DB constraints tell us if it's a bad group_id or duplicate
  const { error: joinError } = await supabase
    .from("group_members")
    .insert({ group_id: params.id, user_id: user.id, role: "member" })

  if (joinError) {
    // 23503 = FK violation → group_id doesn't exist
    if (joinError.code === "23503") {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }
    // 23505 = unique violation → already a member
    if (joinError.code === "23505") {
      // Fetch group name (they're already a member so RLS allows this)
      const { data: group } = await supabase
        .from("groups")
        .select("name")
        .eq("id", params.id)
        .single()
      return NextResponse.json({ alreadyMember: true, groupId: params.id, groupName: group?.name ?? "" })
    }
    return NextResponse.json({ error: joinError.message }, { status: 500 })
  }

  // Success — now they're a member, RLS lets them read the group
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("id", params.id)
    .single()

  // Log activity
  await supabase.from("activities").insert({
    group_id: params.id,
    type: "member_joined",
    actor_id: user.id,
    description: "joined the group",
  })

  return NextResponse.json({ groupId: params.id, groupName: group?.name ?? "" })
}
