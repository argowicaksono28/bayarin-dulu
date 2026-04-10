import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; expId: string } }
) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { description, amount, baseAmount, tax, serviceCharge, paidBy, splitType, splits, category, notes } = body

  const updates: Record<string, unknown> = {}
  if (description !== undefined) updates.description = description
  if (amount !== undefined) updates.amount = amount
  if (baseAmount !== undefined) updates.base_amount = baseAmount
  if (tax !== undefined) updates.tax_percent = tax
  if (serviceCharge !== undefined) updates.service_charge_percent = serviceCharge
  if (paidBy !== undefined) updates.paid_by = paidBy
  if (splitType !== undefined) updates.split_type = splitType
  if (category !== undefined) updates.category = category
  if (notes !== undefined) updates.notes = notes

  const { data, error } = await supabase
    .from("expenses")
    .update(updates)
    .eq("id", params.expId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Replace splits if provided
  if (splits) {
    await supabase.from("expense_splits").delete().eq("expense_id", params.expId)
    const splitRows = Object.entries(splits as Record<string, number>).map(([userId, amt]) => ({
      expense_id: params.expId,
      user_id: userId,
      amount: amt,
    }))
    await supabase.from("expense_splits").insert(splitRows)
  }

  // Log activity
  await supabase.from("activities").insert({
    group_id: params.id,
    type: "expense_edited",
    actor_id: user.id,
    expense_id: params.expId,
    description: `edited expense "${data.description}"`,
  })

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; expId: string } }
) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get expense description for activity log
  const { data: expense } = await supabase
    .from("expenses")
    .select("description")
    .eq("id", params.expId)
    .single()

  const { error } = await supabase.from("expenses").delete().eq("id", params.expId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from("activities").insert({
    group_id: params.id,
    type: "expense_deleted",
    actor_id: user.id,
    description: `deleted expense "${expense?.description ?? ""}"`,
  })

  return NextResponse.json({ success: true })
}
