import type { User, Group, Expense, Balance, Activity, UserId, GroupId } from "@/types"

// ─── Demo Current User ─────────────────────────────────────────────────────

export const DEMO_CURRENT_USER_ID: UserId = "usr_001"

// ─── Users ─────────────────────────────────────────────────────────────────

export const demoUsers: User[] = [
  { id: "usr_001", name: "Budi Santoso",    email: "budi@demo.com",  avatarUrl: null, phone: "+6281234567890", initials: "BS" },
  { id: "usr_002", name: "Siti Rahayu",     email: "siti@demo.com",  avatarUrl: null, phone: "+6281234567891", initials: "SR" },
  { id: "usr_003", name: "Agus Prasetyo",   email: "agus@demo.com",  avatarUrl: null, phone: "+6281234567892", initials: "AP" },
  { id: "usr_004", name: "Dewi Kusuma",     email: "dewi@demo.com",  avatarUrl: null, phone: "+6281234567893", initials: "DK" },
  { id: "usr_005", name: "Reza Firmansyah", email: "reza@demo.com",  avatarUrl: null, phone: "+6281234567894", initials: "RF" },
]

// ─── Expenses ──────────────────────────────────────────────────────────────

export const demoExpenses: Expense[] = [
  // ── Bali Trip ─────────────────────────────────────────────────────────────
  {
    id: "exp_001", groupId: "grp_001",
    description: "Beachfront Hotel (3 nights)",
    amount: 2500000, baseAmount: 2272727, tax: 10, serviceCharge: 0,
    paidBy: "usr_001",
    paidByProfile: { id: "usr_001", name: "Budi Santoso", initials: "BS", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 500000, usr_002: 500000, usr_003: 500000, usr_004: 500000, usr_005: 500000 },
    category: "🏨", createdAt: new Date("2025-03-10"), createdBy: "usr_001",
  },
  {
    id: "exp_002", groupId: "grp_001",
    description: "Dinner at Jimbaran Bay",
    amount: 750000, baseAmount: 681818, tax: 10, serviceCharge: 0,
    paidBy: "usr_002",
    paidByProfile: { id: "usr_002", name: "Siti Rahayu", initials: "SR", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 150000, usr_002: 150000, usr_003: 150000, usr_004: 150000, usr_005: 150000 },
    category: "🍽️", createdAt: new Date("2025-03-11"), createdBy: "usr_002",
    receiptData: {
      restaurantName: "Jimbaran Bay Seafood",
      subtotal: 681818,
      items: [
        { name: "Grilled Lobster",        qty: 1, amount: 320000, assignments: ["usr_001", "usr_002"] },
        { name: "Nasi Goreng Seafood",    qty: 3, amount: 225000, assignments: ["usr_003", "usr_004", "usr_005"] },
        { name: "Es Kelapa Muda",         qty: 5, amount: 75000 },
        { name: "Sambal Platter",         qty: 1, amount: 35000 },
        { name: "Mineral Water",          qty: 5, amount: 26818 },
      ],
    },
  },
  {
    id: "exp_003", groupId: "grp_001",
    description: "Motorbike Rental ×5",
    amount: 450000, baseAmount: 450000, tax: 0, serviceCharge: 0,
    paidBy: "usr_003",
    paidByProfile: { id: "usr_003", name: "Agus Prasetyo", initials: "AP", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 90000, usr_002: 90000, usr_003: 90000, usr_004: 90000, usr_005: 90000 },
    category: "⛽", createdAt: new Date("2025-03-12"), createdBy: "usr_003",
  },
  {
    id: "exp_004", groupId: "grp_001",
    description: "Tanah Lot Entrance Tickets",
    amount: 300000, baseAmount: 300000, tax: 0, serviceCharge: 0,
    paidBy: "usr_001",
    paidByProfile: { id: "usr_001", name: "Budi Santoso", initials: "BS", avatarUrl: null },
    splitType: "percentage",
    splits: { usr_001: 90000, usr_002: 60000, usr_003: 60000, usr_004: 45000, usr_005: 45000 },
    category: "🎟️", createdAt: new Date("2025-03-12"), createdBy: "usr_001",
  },
  {
    id: "exp_005", groupId: "grp_001",
    description: "Batik Souvenir Shopping",
    amount: 850000, baseAmount: 850000, tax: 0, serviceCharge: 0,
    paidBy: "usr_004",
    paidByProfile: { id: "usr_004", name: "Dewi Kusuma", initials: "DK", avatarUrl: null },
    splitType: "exact",
    splits: { usr_001: 200000, usr_002: 150000, usr_003: 200000, usr_004: 150000, usr_005: 150000 },
    category: "🛒", createdAt: new Date("2025-03-13"), createdBy: "usr_004",
    receiptData: {
      restaurantName: "Erlangga Batik Bali",
      subtotal: 850000,
      items: [
        { name: "Batik Shirt — Budi",      qty: 1, amount: 200000, assignments: ["usr_001"] },
        { name: "Batik Scarf — Siti",      qty: 1, amount: 150000, assignments: ["usr_002"] },
        { name: "Batik Shirt — Agus",      qty: 1, amount: 200000, assignments: ["usr_003"] },
        { name: "Batik Fabric — Dewi",     qty: 1, amount: 150000, assignments: ["usr_004"] },
        { name: "Batik Pouch Set — Reza",  qty: 1, amount: 150000, assignments: ["usr_005"] },
      ],
    },
  },
  {
    id: "exp_006", groupId: "grp_001",
    description: "Speedboat to Nusa Penida",
    amount: 600000, baseAmount: 600000, tax: 0, serviceCharge: 0,
    paidBy: "usr_005",
    paidByProfile: { id: "usr_005", name: "Reza Firmansyah", initials: "RF", avatarUrl: null },
    splitType: "shares",
    splits: { usr_001: 200000, usr_002: 100000, usr_003: 100000, usr_004: 100000, usr_005: 100000 },
    category: "⛵", createdAt: new Date("2025-03-13"), createdBy: "usr_005",
  },

  // ── Kost Margonda ─────────────────────────────────────────────────────────
  {
    id: "exp_007", groupId: "grp_002",
    description: "April Rent",
    amount: 1800000, baseAmount: 1800000, tax: 0, serviceCharge: 0,
    paidBy: "usr_001",
    paidByProfile: { id: "usr_001", name: "Budi Santoso", initials: "BS", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 600000, usr_002: 600000, usr_003: 600000 },
    category: "🏠", createdAt: new Date("2025-04-01"), createdBy: "usr_001",
  },
  {
    id: "exp_008", groupId: "grp_002",
    description: "March Electricity Bill",
    amount: 375000, baseAmount: 375000, tax: 0, serviceCharge: 0,
    paidBy: "usr_002",
    paidByProfile: { id: "usr_002", name: "Siti Rahayu", initials: "SR", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 125000, usr_002: 125000, usr_003: 125000 },
    category: "💡", createdAt: new Date("2025-04-02"), createdBy: "usr_002",
  },
  {
    id: "exp_009", groupId: "grp_002",
    description: "IndiHome Internet",
    amount: 250000, baseAmount: 250000, tax: 0, serviceCharge: 0,
    paidBy: "usr_003",
    paidByProfile: { id: "usr_003", name: "Agus Prasetyo", initials: "AP", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 83334, usr_002: 83333, usr_003: 83333 },
    category: "📶", createdAt: new Date("2025-04-03"), createdBy: "usr_003",
  },
  {
    id: "exp_010", groupId: "grp_002",
    description: "Drinking Water Refill",
    amount: 45000, baseAmount: 45000, tax: 0, serviceCharge: 0,
    paidBy: "usr_002",
    paidByProfile: { id: "usr_002", name: "Siti Rahayu", initials: "SR", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 15000, usr_002: 15000, usr_003: 15000 },
    category: "📦", createdAt: new Date("2025-04-05"), createdBy: "usr_002",
  },

  // ── Office Lunch Crew ─────────────────────────────────────────────────────
  {
    id: "exp_011", groupId: "grp_003",
    description: "Padang Rice Lunch",
    amount: 180000, baseAmount: 163636, tax: 10, serviceCharge: 0,
    paidBy: "usr_001",
    paidByProfile: { id: "usr_001", name: "Budi Santoso", initials: "BS", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 45000, usr_002: 45000, usr_004: 45000, usr_005: 45000 },
    category: "🍽️", createdAt: new Date("2025-04-07"), createdBy: "usr_001",
  },
  {
    id: "exp_012", groupId: "grp_003",
    description: "Chicken Noodle + Iced Tea",
    amount: 85000, baseAmount: 85000, tax: 0, serviceCharge: 0,
    paidBy: "usr_002",
    paidByProfile: { id: "usr_002", name: "Siti Rahayu", initials: "SR", avatarUrl: null },
    splitType: "exact",
    splits: { usr_001: 25000, usr_002: 20000, usr_004: 25000, usr_005: 15000 },
    category: "🍜", createdAt: new Date("2025-04-08"), createdBy: "usr_002",
  },
  {
    id: "exp_013", groupId: "grp_003",
    description: "Trendy Coffee + Snacks",
    amount: 120000, baseAmount: 109090, tax: 10, serviceCharge: 1,
    paidBy: "usr_004",
    paidByProfile: { id: "usr_004", name: "Dewi Kusuma", initials: "DK", avatarUrl: null },
    splitType: "shares",
    splits: { usr_001: 40000, usr_002: 30000, usr_004: 30000, usr_005: 20000 },
    category: "☕", createdAt: new Date("2025-04-09"), createdBy: "usr_004",
    receiptData: {
      restaurantName: "Kopi Kenangan",
      subtotal: 109090,
      items: [
        { name: "Kopi Susu",       qty: 2, amount: 32000, assignments: ["usr_001", "usr_004"] },
        { name: "Matcha Latte",    qty: 1, amount: 18000, assignments: ["usr_002"] },
        { name: "Cold Brew",       qty: 1, amount: 20000, assignments: ["usr_005"] },
        { name: "Croissant",       qty: 2, amount: 22000 },
        { name: "Cheesecake Slice",qty: 1, amount: 14000 },
        { name: "Oat Milk Add-on", qty: 1, amount: 3090 },
      ],
    },
  },
  {
    id: "exp_014", groupId: "grp_003",
    description: "Warteg Dinner Run",
    amount: 95000, baseAmount: 86363, tax: 10, serviceCharge: 0,
    paidBy: "usr_005",
    paidByProfile: { id: "usr_005", name: "Reza Firmansyah", initials: "RF", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 23750, usr_002: 23750, usr_004: 23750, usr_005: 23750 },
    category: "🍽️", createdAt: new Date("2025-04-10"), createdBy: "usr_005",
  },

  // ── Weekend in Bandung ────────────────────────────────────────────────────
  {
    id: "exp_015", groupId: "grp_004",
    description: "Villa Rental (2 nights)",
    amount: 1200000, baseAmount: 1200000, tax: 0, serviceCharge: 0,
    paidBy: "usr_003",
    paidByProfile: { id: "usr_003", name: "Agus Prasetyo", initials: "AP", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 300000, usr_003: 300000, usr_004: 300000, usr_005: 300000 },
    category: "🏠", createdAt: new Date("2025-04-12"), createdBy: "usr_003",
  },
  {
    id: "exp_016", groupId: "grp_004",
    description: "Strawberry Farm Entry",
    amount: 160000, baseAmount: 160000, tax: 0, serviceCharge: 0,
    paidBy: "usr_004",
    paidByProfile: { id: "usr_004", name: "Dewi Kusuma", initials: "DK", avatarUrl: null },
    splitType: "equal",
    splits: { usr_001: 40000, usr_003: 40000, usr_004: 40000, usr_005: 40000 },
    category: "🎟️", createdAt: new Date("2025-04-12"), createdBy: "usr_004",
  },
  {
    id: "exp_017", groupId: "grp_004",
    description: "Floating Market Lunch",
    amount: 220000, baseAmount: 200000, tax: 10, serviceCharge: 0,
    paidBy: "usr_005",
    paidByProfile: { id: "usr_005", name: "Reza Firmansyah", initials: "RF", avatarUrl: null },
    splitType: "exact",
    splits: { usr_001: 55000, usr_003: 60000, usr_004: 65000, usr_005: 40000 },
    category: "🍽️", createdAt: new Date("2025-04-13"), createdBy: "usr_005",
    receiptData: {
      restaurantName: "Pasar Terapung Resto",
      subtotal: 200000,
      items: [
        { name: "Soto Ayam",          qty: 2, amount: 50000,  assignments: ["usr_001", "usr_003"] },
        { name: "Nasi Liwet",         qty: 1, amount: 28000,  assignments: ["usr_004"] },
        { name: "Mie Goreng Udang",   qty: 1, amount: 30000,  assignments: ["usr_005"] },
        { name: "Es Cincau",          qty: 4, amount: 40000 },
        { name: "Kerupuk & Sambal",   qty: 1, amount: 15000 },
        { name: "Jus Jambu",          qty: 2, amount: 37000 },
      ],
    },
  },
  {
    id: "exp_018", groupId: "grp_004",
    description: "Toll + Fuel (roundtrip)",
    amount: 180000, baseAmount: 180000, tax: 0, serviceCharge: 0,
    paidBy: "usr_001",
    paidByProfile: { id: "usr_001", name: "Budi Santoso", initials: "BS", avatarUrl: null },
    splitType: "shares",
    splits: { usr_001: 60000, usr_003: 40000, usr_004: 40000, usr_005: 40000 },
    category: "⛽", createdAt: new Date("2025-04-14"), createdBy: "usr_001",
  },
  {
    id: "exp_019", groupId: "grp_004",
    description: "Factory Outlet Shopping",
    amount: 340000, baseAmount: 340000, tax: 0, serviceCharge: 0,
    paidBy: "usr_003",
    paidByProfile: { id: "usr_003", name: "Agus Prasetyo", initials: "AP", avatarUrl: null },
    splitType: "exact",
    splits: { usr_001: 75000, usr_003: 100000, usr_004: 90000, usr_005: 75000 },
    category: "🛒", createdAt: new Date("2025-04-13"), createdBy: "usr_003",
  },
]

// ─── Balance Computation ───────────────────────────────────────────────────
// Computes net IOUs between all pairs in a group from expense splits.
// Produces raw (pre-simplification) balances that DemoBalanceList passes
// through simplifyDebts() for the Simplified view.

export function computeBalancesForGroup(
  groupId: GroupId,
  expenses: Expense[],
  users: User[],
): Balance[] {
  // net["smallerId|largerId"] > 0 means smaller owes larger; < 0 means larger owes smaller
  const net: Record<string, number> = {}

  for (const exp of expenses) {
    if (exp.groupId !== groupId) continue
    const payer = exp.paidBy
    for (const [userId, shareRaw] of Object.entries(exp.splits)) {
      if (userId === payer) continue
      const share = shareRaw as number
      if (share === 0) continue
      const [a, b] = userId < payer ? [userId, payer] : [payer, userId]
      const key = `${a}|${b}`
      // a owes b → positive delta; b owes a → negative delta
      const delta = userId === a ? share : -share
      net[key] = (net[key] ?? 0) + delta
    }
  }

  const result: Balance[] = []
  let idx = 0
  for (const [key, netAmount] of Object.entries(net)) {
    const rounded = Math.round(netAmount)
    if (Math.abs(rounded) < 1) continue
    const [aId, bId] = key.split("|")
    const fromUserId = rounded > 0 ? aId : bId
    const toUserId = rounded > 0 ? bId : aId
    const fromUser = users.find((u) => u.id === fromUserId)
    const toUser = users.find((u) => u.id === toUserId)
    if (!fromUser || !toUser) continue
    result.push({
      id: `bal_${groupId}_${idx++}`,
      groupId,
      fromUserId,
      toUserId,
      amount: Math.abs(rounded),
      fromProfile: { id: fromUserId, name: fromUser.name, initials: fromUser.initials, avatarUrl: null },
      toProfile: { id: toUserId, name: toUser.name, initials: toUser.initials, avatarUrl: null },
    })
  }
  return result
}

export function computeMyBalanceForGroup(
  groupId: GroupId,
  currentUserId: UserId,
  expenses: Expense[],
): number {
  let balance = 0
  for (const exp of expenses.filter((e) => e.groupId === groupId)) {
    const myShare = (exp.splits[currentUserId] as number | undefined) ?? 0
    if (exp.paidBy === currentUserId) {
      balance += exp.amount - myShare
    } else {
      balance -= myShare
    }
  }
  return balance
}

// ─── Balances (computed from expenses) ─────────────────────────────────────

export const demoBalances: Balance[] = (["grp_001", "grp_002", "grp_003", "grp_004"] as GroupId[])
  .flatMap((gid) => computeBalancesForGroup(gid, demoExpenses, demoUsers))

// ─── Groups (totals derived from expenses) ─────────────────────────────────

function sumGroupExpenses(groupId: GroupId): number {
  return demoExpenses
    .filter((e) => e.groupId === groupId)
    .reduce((sum, e) => sum + e.amount, 0)
}

export const demoGroups: Group[] = [
  {
    id: "grp_001",
    name: "Bali Trip 2025",
    emoji: "🏖️",
    coverColor: "bg-blue-500",
    memberIds: ["usr_001", "usr_002", "usr_003", "usr_004", "usr_005"],
    createdAt: new Date("2025-03-01"),
    createdBy: "usr_001",
    totalExpenses: sumGroupExpenses("grp_001"),
    myBalance: computeMyBalanceForGroup("grp_001", DEMO_CURRENT_USER_ID, demoExpenses),
  },
  {
    id: "grp_002",
    name: "Kost Margonda",
    emoji: "🏠",
    coverColor: "bg-green-500",
    memberIds: ["usr_001", "usr_002", "usr_003"],
    createdAt: new Date("2025-01-15"),
    createdBy: "usr_002",
    totalExpenses: sumGroupExpenses("grp_002"),
    myBalance: computeMyBalanceForGroup("grp_002", DEMO_CURRENT_USER_ID, demoExpenses),
  },
  {
    id: "grp_003",
    name: "Office Lunch Crew",
    emoji: "🍽️",
    coverColor: "bg-orange-500",
    memberIds: ["usr_001", "usr_002", "usr_004", "usr_005"],
    createdAt: new Date("2025-02-01"),
    createdBy: "usr_001",
    totalExpenses: sumGroupExpenses("grp_003"),
    myBalance: computeMyBalanceForGroup("grp_003", DEMO_CURRENT_USER_ID, demoExpenses),
  },
  {
    id: "grp_004",
    name: "Weekend in Bandung",
    emoji: "🎉",
    coverColor: "bg-violet-500",
    memberIds: ["usr_001", "usr_003", "usr_004", "usr_005"],
    createdAt: new Date("2025-04-01"),
    createdBy: "usr_003",
    totalExpenses: sumGroupExpenses("grp_004"),
    myBalance: computeMyBalanceForGroup("grp_004", DEMO_CURRENT_USER_ID, demoExpenses),
  },
]

// ─── Activities ────────────────────────────────────────────────────────────

export const demoActivities: Activity[] = [
  // Bali Trip
  {
    id: "act_001", groupId: "grp_001", type: "expense_added",
    actorId: "usr_001", actor: { id: "usr_001", name: "Budi Santoso",    initials: "BS", avatarUrl: null },
    expenseId: "exp_001", amount: 2500000,
    description: "Budi added \"Beachfront Hotel (3 nights)\"",
    createdAt: new Date("2025-03-10T09:00:00"),
  },
  {
    id: "act_002", groupId: "grp_001", type: "member_joined",
    actorId: "usr_005", actor: { id: "usr_005", name: "Reza Firmansyah", initials: "RF", avatarUrl: null },
    description: "Reza joined the group",
    createdAt: new Date("2025-03-09T18:30:00"),
  },
  {
    id: "act_003", groupId: "grp_001", type: "expense_added",
    actorId: "usr_002", actor: { id: "usr_002", name: "Siti Rahayu",     initials: "SR", avatarUrl: null },
    expenseId: "exp_002", amount: 750000,
    description: "Siti added \"Dinner at Jimbaran Bay\"",
    createdAt: new Date("2025-03-11T20:00:00"),
  },
  {
    id: "act_004", groupId: "grp_001", type: "settlement",
    actorId: "usr_003", actor: { id: "usr_003", name: "Agus Prasetyo",   initials: "AP", avatarUrl: null },
    targetUserId: "usr_001", amount: 90000,
    description: "Agus paid Rp 90,000 to Budi",
    createdAt: new Date("2025-03-14T10:00:00"),
  },
  {
    id: "act_005", groupId: "grp_001", type: "expense_added",
    actorId: "usr_003", actor: { id: "usr_003", name: "Agus Prasetyo",   initials: "AP", avatarUrl: null },
    expenseId: "exp_003", amount: 450000,
    description: "Agus added \"Motorbike Rental ×5\"",
    createdAt: new Date("2025-03-12T08:00:00"),
  },
  {
    id: "act_006", groupId: "grp_001", type: "expense_added",
    actorId: "usr_004", actor: { id: "usr_004", name: "Dewi Kusuma",     initials: "DK", avatarUrl: null },
    expenseId: "exp_005", amount: 850000,
    description: "Dewi added \"Batik Souvenir Shopping\"",
    createdAt: new Date("2025-03-13T15:00:00"),
  },
  {
    id: "act_007", groupId: "grp_001", type: "expense_added",
    actorId: "usr_005", actor: { id: "usr_005", name: "Reza Firmansyah", initials: "RF", avatarUrl: null },
    expenseId: "exp_006", amount: 600000,
    description: "Reza added \"Speedboat to Nusa Penida\"",
    createdAt: new Date("2025-03-13T07:30:00"),
  },
  {
    id: "act_008", groupId: "grp_001", type: "settlement",
    actorId: "usr_002", actor: { id: "usr_002", name: "Siti Rahayu",     initials: "SR", avatarUrl: null },
    targetUserId: "usr_001", amount: 150000,
    description: "Siti paid Rp 150,000 to Budi",
    createdAt: new Date("2025-03-15T09:00:00"),
  },
  // Kost Margonda
  {
    id: "act_009", groupId: "grp_002", type: "expense_added",
    actorId: "usr_001", actor: { id: "usr_001", name: "Budi Santoso",    initials: "BS", avatarUrl: null },
    expenseId: "exp_007", amount: 1800000,
    description: "Budi added \"April Rent\"",
    createdAt: new Date("2025-04-01T08:00:00"),
  },
  {
    id: "act_010", groupId: "grp_002", type: "expense_added",
    actorId: "usr_002", actor: { id: "usr_002", name: "Siti Rahayu",     initials: "SR", avatarUrl: null },
    expenseId: "exp_008", amount: 375000,
    description: "Siti added \"March Electricity Bill\"",
    createdAt: new Date("2025-04-02T08:30:00"),
  },
  {
    id: "act_011", groupId: "grp_002", type: "member_joined",
    actorId: "usr_003", actor: { id: "usr_003", name: "Agus Prasetyo",   initials: "AP", avatarUrl: null },
    description: "Agus joined the group",
    createdAt: new Date("2025-01-15T10:00:00"),
  },
  // Office Lunch Crew
  {
    id: "act_012", groupId: "grp_003", type: "expense_added",
    actorId: "usr_001", actor: { id: "usr_001", name: "Budi Santoso",    initials: "BS", avatarUrl: null },
    expenseId: "exp_011", amount: 180000,
    description: "Budi added \"Padang Rice Lunch\"",
    createdAt: new Date("2025-04-07T12:30:00"),
  },
  {
    id: "act_013", groupId: "grp_003", type: "expense_added",
    actorId: "usr_004", actor: { id: "usr_004", name: "Dewi Kusuma",     initials: "DK", avatarUrl: null },
    expenseId: "exp_013", amount: 120000,
    description: "Dewi added \"Trendy Coffee + Snacks\"",
    createdAt: new Date("2025-04-09T09:30:00"),
  },
  {
    id: "act_014", groupId: "grp_003", type: "expense_added",
    actorId: "usr_002", actor: { id: "usr_002", name: "Siti Rahayu",     initials: "SR", avatarUrl: null },
    expenseId: "exp_012", amount: 85000,
    description: "Siti added \"Chicken Noodle + Iced Tea\"",
    createdAt: new Date("2025-04-08T13:00:00"),
  },
  // Weekend in Bandung
  {
    id: "act_015", groupId: "grp_004", type: "expense_added",
    actorId: "usr_003", actor: { id: "usr_003", name: "Agus Prasetyo",   initials: "AP", avatarUrl: null },
    expenseId: "exp_015", amount: 1200000,
    description: "Agus added \"Villa Rental (2 nights)\"",
    createdAt: new Date("2025-04-12T14:00:00"),
  },
  {
    id: "act_016", groupId: "grp_004", type: "member_joined",
    actorId: "usr_001", actor: { id: "usr_001", name: "Budi Santoso",    initials: "BS", avatarUrl: null },
    description: "Budi joined the group",
    createdAt: new Date("2025-04-01T10:00:00"),
  },
  {
    id: "act_017", groupId: "grp_004", type: "expense_added",
    actorId: "usr_005", actor: { id: "usr_005", name: "Reza Firmansyah", initials: "RF", avatarUrl: null },
    expenseId: "exp_017", amount: 220000,
    description: "Reza added \"Floating Market Lunch\"",
    createdAt: new Date("2025-04-13T12:00:00"),
  },
  {
    id: "act_018", groupId: "grp_004", type: "expense_added",
    actorId: "usr_003", actor: { id: "usr_003", name: "Agus Prasetyo",   initials: "AP", avatarUrl: null },
    expenseId: "exp_019", amount: 340000,
    description: "Agus added \"Factory Outlet Shopping\"",
    createdAt: new Date("2025-04-13T15:30:00"),
  },
]

// ─── Helper Functions ──────────────────────────────────────────────────────

export function getDemoUserById(id: UserId): User {
  const user = demoUsers.find((u) => u.id === id)
  if (!user) throw new Error(`Demo user not found: ${id}`)
  return user
}

export function getDemoGroupById(id: GroupId): Group | undefined {
  return demoGroups.find((g) => g.id === id)
}

export function getDemoExpensesByGroupId(groupId: GroupId): Expense[] {
  return demoExpenses
    .filter((e) => e.groupId === groupId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getDemoBalancesByGroupId(groupId: GroupId): Balance[] {
  return demoBalances.filter((b) => b.groupId === groupId)
}

export function getDemoActivitiesByGroupId(groupId: GroupId): Activity[] {
  return demoActivities
    .filter((a) => a.groupId === groupId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getDemoMembersByGroupId(groupId: GroupId): User[] {
  const group = demoGroups.find((g) => g.id === groupId)
  if (!group) return []
  return group.memberIds.map((id) => getDemoUserById(id))
}
