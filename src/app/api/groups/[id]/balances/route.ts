import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // ── 1. Get all expenses for this group with their payer ──────
  const { data: expenses, error: expError } = await supabase
    .from("expenses")
    .select("id, paid_by")
    .eq("group_id", params.id)

  if (expError) {
    console.error("[balances] expenses error:", expError)
    return NextResponse.json({ error: expError.message }, { status: 500 })
  }

  const expenseIds = (expenses ?? []).map((e) => e.id)
  const payerByExpense: Record<string, string> = {}
  for (const e of expenses ?? []) payerByExpense[e.id] = e.paid_by

  // ── 2. Get all splits for those expenses ─────────────────────
  let splits: { expense_id: string; user_id: string; amount: number }[] = []
  if (expenseIds.length > 0) {
    const { data: splitData, error: splitError } = await supabase
      .from("expense_splits")
      .select("expense_id, user_id, amount")
      .in("expense_id", expenseIds)

    if (splitError) {
      console.error("[balances] splits error:", splitError)
      return NextResponse.json({ error: splitError.message }, { status: 500 })
    }
    splits = splitData ?? []
  }

  // ── 3. Fetch completed settlements for the group ─────────────
  const { data: settled, error: settledError } = await supabase
    .from("settlements")
    .select("from_user_id, to_user_id, amount")
    .eq("group_id", params.id)
    .eq("status", "completed")

  if (settledError) console.error("[balances] settlements error:", settledError)

  // ── 4. Build profile map: registered members + guests ────────
  const [{ data: members, error: membErr }, { data: guests, error: guestErr }] = await Promise.all([
    supabase
      .from("group_members")
      .select("user_id, profiles ( id, name, initials, avatar_url, phone )")
      .eq("group_id", params.id),
    supabase
      .from("guest_members")
      .select("id, name, initials")
      .eq("group_id", params.id),
  ])

  if (membErr)  console.error("[balances] members error:", membErr)
  if (guestErr) console.error("[balances] guests error:", guestErr)

  const profileMap: Record<string, { id: string; name: string; initials: string; avatarUrl: string | null; phone: string | null }> = {}
  for (const m of members ?? []) {
    const p = m.profiles as any
    if (p) profileMap[p.id] = { id: p.id, name: p.name, initials: p.initials, avatarUrl: p.avatar_url, phone: p.phone }
  }
  for (const g of guests ?? []) {
    profileMap[g.id] = { id: g.id, name: g.name, initials: g.initials, avatarUrl: null, phone: null }
  }

  console.log(`[balances] group=${params.id} expenses=${expenseIds.length} splits=${splits.length} members=${members?.length ?? 0} guests=${guests?.length ?? 0}`)

  // ── 5. Build net balance map ──────────────────────────────────
  // key = "<smallerUUID>|<largerUUID>", positive means smaller owes larger
  const netMap = new Map<string, number>()

  const addToMap = (from: string, to: string, amount: number) => {
    if (from === to || amount === 0) return
    const [a, b, sign] = from < to ? [from, to, 1] : [to, from, -1]
    const key = `${a}|${b}`
    netMap.set(key, (netMap.get(key) ?? 0) + sign * amount)
  }

  for (const s of splits) {
    const paidBy = payerByExpense[s.expense_id]
    if (!paidBy) continue
    if (s.user_id === paidBy) continue   // payer's own split — skip
    addToMap(s.user_id, paidBy, Number(s.amount))
  }

  for (const s of settled ?? []) {
    addToMap(s.from_user_id, s.to_user_id, -Number(s.amount))
  }

  // ── 6. Convert to balance array ───────────────────────────────
  const balances = Array.from(netMap.entries())
    .filter(([, amount]) => Math.abs(amount) > 0.5)
    .map(([key, amount]) => {
      const [a, b] = key.split("|")
      const from = amount > 0 ? a : b
      const to   = amount > 0 ? b : a
      return {
        id: key,
        groupId: params.id,
        fromUserId: from,
        toUserId: to,
        fromProfile: profileMap[from] ?? null,
        toProfile:   profileMap[to]   ?? null,
        amount: Math.abs(Math.round(amount)),
      }
    })

  console.log(`[balances] → ${balances.length} balance entries`)
  return NextResponse.json(balances)
}
