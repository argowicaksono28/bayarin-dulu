import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // ── 1. Compute raw balances directly from expense_splits + expenses ──
  // Avoids the group_balances view which requires an explicit GRANT to
  // the authenticated role and can silently fail via RLS.
  const { data: splits, error: splitsError } = await supabase
    .from("expense_splits")
    .select("user_id, amount, expenses!inner( group_id, paid_by )")
    .eq("expenses.group_id", params.id)

  if (splitsError) {
    console.error("[balances] splits error:", splitsError)
    return NextResponse.json({ error: splitsError.message }, { status: 500 })
  }

  // ── 2. Fetch completed settlements for the group ──
  const { data: settled, error: settledError } = await supabase
    .from("settlements")
    .select("from_user_id, to_user_id, amount")
    .eq("group_id", params.id)
    .eq("status", "completed")

  if (settledError) {
    console.error("[balances] settlements error:", settledError)
  }

  // ── 3. Build profile map (registered members + guests) ──
  const [{ data: members }, { data: guests }] = await Promise.all([
    supabase
      .from("group_members")
      .select("user_id, profiles ( id, name, initials, avatar_url, phone )")
      .eq("group_id", params.id),
    supabase
      .from("guest_members")
      .select("id, name, initials")
      .eq("group_id", params.id),
  ])

  const profileMap: Record<string, { id: string; name: string; initials: string; avatarUrl: string | null; phone: string | null }> = {}
  for (const m of members ?? []) {
    const p = m.profiles as any
    if (p) profileMap[p.id] = { id: p.id, name: p.name, initials: p.initials, avatarUrl: p.avatar_url, phone: p.phone }
  }
  for (const g of guests ?? []) {
    profileMap[g.id] = { id: g.id, name: g.name, initials: g.initials, avatarUrl: null, phone: null }
  }

  // ── 4. Build net balance map ──
  // key = "<smallerUUID>|<largerUUID>", positive means smaller owes larger
  const netMap = new Map<string, number>()

  const addToMap = (from: string, to: string, amount: number) => {
    if (from === to || amount === 0) return
    const [a, b, sign] = from < to ? [from, to, 1] : [to, from, -1]
    const key = `${a}|${b}`
    netMap.set(key, (netMap.get(key) ?? 0) + sign * amount)
  }

  // Each split row: the split user owes the expense payer their share
  // (excluding rows where the split user IS the payer — they don't owe themselves)
  for (const s of splits ?? []) {
    const exp = s.expenses as any
    if (!exp) continue
    if (s.user_id === exp.paid_by) continue        // payer's own split — skip
    addToMap(s.user_id, exp.paid_by, Number(s.amount))
  }

  // Subtract settled amounts
  for (const s of settled ?? []) {
    addToMap(s.from_user_id, s.to_user_id, -Number(s.amount))
  }

  // ── 5. Convert net map to balance array ──
  const balances = Array.from(netMap.entries())
    .filter(([, amount]) => Math.abs(amount) > 0.5)   // ignore sub-rupiah rounding
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

  console.log(`[balances] group=${params.id} splits=${splits?.length ?? 0} balances=${balances.length}`)
  return NextResponse.json(balances)
}
