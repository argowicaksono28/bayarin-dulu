import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { fromUserId, toUserId, amount } = await request.json()
  if (!fromUserId || !toUserId || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Security: only the payer can create a settlement
  if (fromUserId !== user.id) {
    return NextResponse.json({ error: "You can only settle your own debts" }, { status: 403 })
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
  const { error: actErr } = await supabase.from("activities").insert({
    group_id: params.id,
    type: "settlement",
    actor_id: user.id,
    target_user_id: toUserId,
    amount,
    description: `settled a debt`,
  })
  if (actErr) console.error("[activities] insert failed:", actErr.message)

  // Notify the recipient
  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single()
  const actorName = actorProfile?.name ?? "Someone"
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount)

  const { error: notifErr } = await supabase.from("notifications").insert({
    user_id: toUserId,
    type: "settlement_reminder",
    title: "Payment received",
    body: `${actorName} paid you ${formattedAmount}`,
    group_id: params.id,
    actor_id: user.id,
  })
  if (notifErr) console.error("[notifications] insert failed:", notifErr.message)

  return NextResponse.json(data, { status: 201 })
}
