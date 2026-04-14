import { SupabaseClient } from "@supabase/supabase-js"

export async function getUserGroupsBase(supabase: SupabaseClient, user: { id: string }) {
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
    throw new Error(error.message)
  }

  const groupIds = (memberships ?? []).map((m) => m.group_id)

  // If user has no groups, return empty array immediately
  if (groupIds.length === 0) {
    return []
  }

  // Get expense totals per group
  const { data: expenses, error: expError } = await supabase
    .from("expenses")
    .select("group_id, amount")
    .in("group_id", groupIds)

  if (expError) console.error("expenses query error:", expError)

  // Get raw splits
  const { data: allExpenses, error: allExpErr } = await supabase
    .from("expenses")
    .select("id, group_id, paid_by")
    .in("group_id", groupIds)
  if (allExpErr) console.error("all expenses query error:", allExpErr)

  const expenseIds = (allExpenses ?? []).map((e) => e.id)
  const payerByExpense: Record<string, string> = {}
  for (const e of allExpenses ?? []) payerByExpense[e.id] = e.paid_by

  const { data: splits, error: splitErr } = expenseIds.length > 0
    ? await supabase.from("expense_splits").select("expense_id, user_id, amount").in("expense_id", expenseIds)
    : { data: [], error: null }
  if (splitErr) console.error("splits query error:", splitErr)

  // Get completed settlements
  const { data: settlements, error: settleErr } = await supabase
    .from("settlements")
    .select("group_id, from_user_id, to_user_id, amount")
    .in("group_id", groupIds)
    .eq("status", "completed")
  if (settleErr) console.error("settlements query error:", settleErr)

  const expensesByGroup: Record<string, number> = {}
  for (const e of expenses ?? []) {
    expensesByGroup[e.group_id] = (expensesByGroup[e.group_id] ?? 0) + e.amount
  }

  // Build net balance per group
  const balanceByGroup: Record<string, number> = {}

  for (const s of splits ?? []) {
    const paidBy = payerByExpense[s.expense_id]
    if (!paidBy || s.user_id === paidBy) continue
    const groupId = allExpenses?.find((e) => e.id === s.expense_id)?.group_id
    if (!groupId) continue
    if (s.user_id === user.id) {
      balanceByGroup[groupId] = (balanceByGroup[groupId] ?? 0) - Number(s.amount)
    } else if (paidBy === user.id) {
      balanceByGroup[groupId] = (balanceByGroup[groupId] ?? 0) + Number(s.amount)
    }
  }

  for (const s of settlements ?? []) {
    if (s.from_user_id === user.id) {
      balanceByGroup[s.group_id] = (balanceByGroup[s.group_id] ?? 0) + Number(s.amount)
    } else if (s.to_user_id === user.id) {
      balanceByGroup[s.group_id] = (balanceByGroup[s.group_id] ?? 0) - Number(s.amount)
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

  // Sort by created_at descending
  return groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
