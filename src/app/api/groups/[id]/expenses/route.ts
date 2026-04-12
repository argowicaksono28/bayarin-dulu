import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("expenses")
    .select("*, expense_splits ( user_id, amount )")
    .eq("group_id", params.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Collect unique payer IDs then resolve names from profiles + guest_members
  const payerIds = [...new Set((data ?? []).map((e) => e.paid_by).filter(Boolean))]

  const [{ data: profiles }, { data: guests }] = await Promise.all([
    supabase.from("profiles").select("id, name, initials, avatar_url").in("id", payerIds.length ? payerIds : ["none"]),
    supabase.from("guest_members").select("id, name, initials").in("id", payerIds.length ? payerIds : ["none"]),
  ])

  const payerMap: Record<string, { id: string; name: string; initials: string; avatar_url: string | null }> = {}
  for (const p of profiles ?? []) payerMap[p.id] = p
  for (const g of guests ?? []) if (!payerMap[g.id]) payerMap[g.id] = { id: g.id, name: g.name, initials: g.initials, avatar_url: null }

  const expenses = (data ?? []).map((e) => ({
    id: e.id,
    groupId: e.group_id,
    description: e.description,
    amount: e.amount,
    baseAmount: e.base_amount,
    tax: e.tax_percent,
    serviceCharge: e.service_charge_percent,
    paidBy: e.paid_by,
    paidByProfile: payerMap[e.paid_by] ?? null,
    splitType: e.split_type,
    splits: Object.fromEntries(
      ((e.expense_splits ?? []) as any[]).map((s: any) => [s.user_id, s.amount])
    ),
    category: e.category,
    notes: e.notes,
    receiptData: e.receipt_data ?? null,
    createdAt: e.created_at,
    createdBy: e.created_by,
  }))

  return NextResponse.json(expenses)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const {
    description,
    amount,
    baseAmount,
    tax = 0,
    serviceCharge = 0,
    paidBy,
    splitType = "equal",
    splits,
    category = "📦",
    notes,
    receiptData,
  } = body

  if (!description || !amount || !paidBy || !splits) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Validate amount
  if (typeof amount !== "number" || amount <= 0 || amount > 999_999_999) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  // Validate text lengths
  if (typeof description !== "string" || description.length > 255) {
    return NextResponse.json({ error: "Description too long (max 255)" }, { status: 400 })
  }
  if (notes && typeof notes === "string" && notes.length > 500) {
    return NextResponse.json({ error: "Notes too long (max 500)" }, { status: 400 })
  }

  // Validate splits sum matches amount (1 IDR rounding tolerance)
  const splitsSum = Object.values(splits as Record<string, number>).reduce((a, b) => a + b, 0)
  if (Math.abs(splitsSum - amount) > 1) {
    return NextResponse.json({ error: "Splits do not sum to total amount" }, { status: 400 })
  }

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      group_id: params.id,
      description,
      amount,
      base_amount: baseAmount ?? amount,
      tax_percent: tax,
      service_charge_percent: serviceCharge,
      paid_by: paidBy,
      split_type: splitType,
      category,
      notes,
      receipt_data: receiptData ?? null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert splits
  const splitRows = Object.entries(splits as Record<string, number>).map(([userId, amt]) => ({
    expense_id: expense.id,
    user_id: userId,
    amount: amt,
  }))

  const { error: splitError } = await supabase.from("expense_splits").insert(splitRows)
  if (splitError) return NextResponse.json({ error: splitError.message }, { status: 500 })

  // Log activity
  const { error: actErr } = await supabase.from("activities").insert({
    group_id: params.id,
    type: "expense_added",
    actor_id: user.id,
    expense_id: expense.id,
    amount,
    description: `added expense "${description}"`,
  })
  if (actErr) console.error("[activities] insert failed:", actErr.message)

  // Notify group members
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", params.id)
    .neq("user_id", user.id)

  if (members && members.length > 0) {
    const { data: actorProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single()
    const actorName = actorProfile?.name ?? "Someone"
    const formattedAmount = new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount)

    const { error: notifErr } = await supabase.from("notifications").insert(
      members.map((m) => ({
        user_id: m.user_id,
        type: "expense_added",
        title: "New expense added",
        body: `${actorName} added "${description}" for ${formattedAmount}`,
        group_id: params.id,
        actor_id: user.id,
      }))
    )
    if (notifErr) console.error("[notifications] insert failed:", notifErr.message)
  }

  return NextResponse.json(expense, { status: 201 })
}
