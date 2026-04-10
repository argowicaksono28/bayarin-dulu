import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      actor:profiles!activities_actor_id_fkey ( id, name, initials, avatar_url ),
      target:profiles!activities_target_user_id_fkey ( id, name, initials, avatar_url )
    `)
    .eq("group_id", params.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const activities = (data ?? []).map((a) => ({
    id: a.id,
    groupId: a.group_id,
    type: a.type,
    actorId: a.actor_id,
    actor: a.actor,
    targetUserId: a.target_user_id,
    target: a.target,
    expenseId: a.expense_id,
    amount: a.amount,
    description: a.description,
    createdAt: a.created_at,
  }))

  return NextResponse.json(activities)
}
