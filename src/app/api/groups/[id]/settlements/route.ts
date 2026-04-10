import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { fromUserId, toUserId, amount } = await request.json()
  if (!fromUserId || !toUserId || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("settlements")
    .insert({
      group_id: params.id,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
      status: "completed",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log activity
  await supabase.from("activities").insert({
    group_id: params.id,
    type: "settlement",
    actor_id: user.id,
    target_user_id: toUserId,
    amount,
    description: `settled a debt`,
  })

  // Notify the recipient
  await supabase.from("notifications").insert({
    user_id: toUserId,
    type: "settlement_reminder",
    title: "Payment received",
    body: `You received a payment of ${amount}`,
    group_id: params.id,
    actor_id: user.id,
  })

  return NextResponse.json(data, { status: 201 })
}
