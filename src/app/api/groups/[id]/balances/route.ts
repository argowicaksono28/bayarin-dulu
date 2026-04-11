import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get raw balances from the view
  const { data: raw, error } = await supabase
    .from("group_balances")
    .select("from_user_id, to_user_id, amount")
    .eq("group_id", params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Subtract completed settlements
  const { data: settled } = await supabase
    .from("settlements")
    .select("from_user_id, to_user_id, amount")
    .eq("group_id", params.id)
    .eq("status", "completed")

  // Fetch all member profiles for this group (registered users)
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles ( id, name, initials, avatar_url, phone )")
    .eq("group_id", params.id)

  // Fetch guest members for this group
  const { data: guests } = await supabase
    .from("guest_members")
    .select("id, name, initials")
    .eq("group_id", params.id)

  const profileMap: Record<string, { id: string; name: string; initials: string; avatarUrl: string | null; phone: string | null }> = {}
  for (const m of members ?? []) {
    const p = m.profiles as any
    if (p) profileMap[p.id] = { id: p.id, name: p.name, initials: p.initials, avatarUrl: p.avatar_url, phone: p.phone }
  }
  // Add guests to profileMap so they appear in balance display
  for (const g of guests ?? []) {
    profileMap[g.id] = { id: g.id, name: g.name, initials: g.initials, avatarUrl: null, phone: null }
  }

  // Build a net balance map: key = "fromId|toId"
  type BalanceKey = string
  const netMap = new Map<BalanceKey, number>()

  const addToMap = (from: string, to: string, amount: number) => {
    const [a, b, sign] = from < to ? [from, to, 1] : [to, from, -1]
    const key = `${a}|${b}`
    netMap.set(key, (netMap.get(key) ?? 0) + sign * amount)
  }

  for (const b of raw ?? []) addToMap(b.from_user_id, b.to_user_id, Number(b.amount))
  for (const s of settled ?? []) addToMap(s.from_user_id, s.to_user_id, -Number(s.amount))

  const balances = Array.from(netMap.entries())
    .filter(([, amount]) => Math.abs(amount) > 0)
    .map(([key, amount]) => {
      const [a, b] = key.split("|")
      const from = amount > 0 ? a : b
      const to = amount > 0 ? b : a
      return {
        id: key,
        groupId: params.id,
        fromUserId: from,
        toUserId: to,
        fromProfile: profileMap[from] ?? null,
        toProfile: profileMap[to] ?? null,
        amount: Math.abs(amount),
      }
    })

  return NextResponse.json(balances)
}
