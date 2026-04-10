import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient(request as any)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get groups where the user is a member, with member list
    const { data: memberships, error } = await supabase
      .from("group_members")
      .select(`
        group_id,
        role,
        groups (
          id,
          name,
          emoji,
          cover_color,
          created_by,
          created_at,
          updated_at,
          group_members ( user_id )
        )
      `)
      .eq("user_id", user.id)

    if (error) {
      console.error("group_members query error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const groupIds = (memberships ?? []).map((m) => m.group_id)

    // If user has no groups, return empty array immediately
    if (groupIds.length === 0) {
      return NextResponse.json([])
    }

    // Get expense totals per group
    const { data: expenses, error: expError } = await supabase
      .from("expenses")
      .select("group_id, amount")
      .in("group_id", groupIds)

    if (expError) console.error("expenses query error:", expError)

    // Get raw balances from the view
    const { data: owes, error: balError } = await supabase
      .from("group_balances")
      .select("group_id, from_user_id, to_user_id, amount")
      .in("group_id", groupIds)

    if (balError) console.error("group_balances query error:", balError)

    const expensesByGroup: Record<string, number> = {}
    for (const e of expenses ?? []) {
      expensesByGroup[e.group_id] = (expensesByGroup[e.group_id] ?? 0) + e.amount
    }

    const balanceByGroup: Record<string, number> = {}
    for (const b of owes ?? []) {
      if (b.to_user_id === user.id) {
        balanceByGroup[b.group_id] = (balanceByGroup[b.group_id] ?? 0) + Number(b.amount)
      }
      if (b.from_user_id === user.id) {
        balanceByGroup[b.group_id] = (balanceByGroup[b.group_id] ?? 0) - Number(b.amount)
      }
    }

    const groups = (memberships ?? []).map((m) => {
      const g = m.groups as any
      return {
        id: g.id,
        name: g.name,
        emoji: g.emoji,
        coverColor: g.cover_color,
        memberIds: (g.group_members as any[]).map((gm: any) => gm.user_id),
        createdAt: g.created_at,
        createdBy: g.created_by,
        totalExpenses: expensesByGroup[g.id] ?? 0,
        myBalance: balanceByGroup[g.id] ?? 0,
      }
    })

    return NextResponse.json(groups)
  } catch (err: any) {
    console.error("GET /api/groups unhandled error:", err)
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name, emoji = "🎉", coverColor = "bg-blue-500" } = body

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const { data: group, error } = await supabase.rpc("create_group", {
    p_name: name.trim(),
    p_emoji: emoji,
    p_cover_color: coverColor,
    p_user_id: user.id,
  })

  if (error) {
    console.error("create_group RPC error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(group, { status: 201 })
}
