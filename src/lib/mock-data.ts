import type {
  User,
  Group,
  Expense,
  Balance,
  Activity,
  Notification,
  UserId,
  GroupId,
} from "@/types"

// ─── Users ─────────────────────────────────────────────────────────────────

export const CURRENT_USER_ID: UserId = "usr_001"

export const mockUsers: User[] = [
  {
    id: "usr_001",
    name: "Budi Santoso",
    email: "budi@example.com",
    avatarUrl: null,
    phone: "+6281234567890",
    initials: "BS",
  },
  {
    id: "usr_002",
    name: "Siti Rahayu",
    email: "siti@example.com",
    avatarUrl: null,
    phone: "+6281234567891",
    initials: "SR",
  },
  {
    id: "usr_003",
    name: "Agus Prasetyo",
    email: "agus@example.com",
    avatarUrl: null,
    phone: "+6281234567892",
    initials: "AP",
  },
  {
    id: "usr_004",
    name: "Dewi Kusuma",
    email: "dewi@example.com",
    avatarUrl: null,
    phone: "+6281234567893",
    initials: "DK",
  },
  {
    id: "usr_005",
    name: "Reza Firmansyah",
    email: "reza@example.com",
    avatarUrl: null,
    phone: "+6281234567894",
    initials: "RF",
  },
]

// ─── Groups ────────────────────────────────────────────────────────────────

export const mockGroups: Group[] = [
  {
    id: "grp_001",
    name: "Bali Trip 2025",
    emoji: "🏖️",
    coverColor: "bg-blue-500",
    memberIds: ["usr_001", "usr_002", "usr_003", "usr_004", "usr_005"],
    createdAt: new Date("2025-03-01"),
    createdBy: "usr_001",
    totalExpenses: 8750000,
    myBalance: 350000,
  },
  {
    id: "grp_002",
    name: "Kost Margonda",
    emoji: "🏠",
    coverColor: "bg-green-500",
    memberIds: ["usr_001", "usr_002", "usr_003"],
    createdAt: new Date("2025-01-15"),
    createdBy: "usr_002",
    totalExpenses: 3600000,
    myBalance: -125000,
  },
  {
    id: "grp_003",
    name: "Makan Siang Kantor",
    emoji: "🍽️",
    coverColor: "bg-orange-500",
    memberIds: ["usr_001", "usr_002", "usr_004", "usr_005"],
    createdAt: new Date("2025-02-01"),
    createdBy: "usr_001",
    totalExpenses: 1250000,
    myBalance: 75000,
  },
]

// ─── Expenses ──────────────────────────────────────────────────────────────

export const mockExpenses: Expense[] = [
  // grp_001 – Bali Trip
  {
    id: "exp_001",
    groupId: "grp_001",
    description: "Hotel Bali Beachfront (3 malam)",
    amount: 2500000,
    baseAmount: 2272727,
    tax: 10,
    serviceCharge: 0,
    paidBy: "usr_001",
    splitType: "equal",
    splits: {
      usr_001: 500000,
      usr_002: 500000,
      usr_003: 500000,
      usr_004: 500000,
      usr_005: 500000,
    },
    category: "🏨",
    createdAt: new Date("2025-03-10"),
    createdBy: "usr_001",
  },
  {
    id: "exp_002",
    groupId: "grp_001",
    description: "Makan malam di Jimbaran",
    amount: 750000,
    baseAmount: 681818,
    tax: 10,
    serviceCharge: 0,
    paidBy: "usr_002",
    splitType: "equal",
    splits: {
      usr_001: 150000,
      usr_002: 150000,
      usr_003: 150000,
      usr_004: 150000,
      usr_005: 150000,
    },
    category: "🍽️",
    createdAt: new Date("2025-03-11"),
    createdBy: "usr_002",
  },
  {
    id: "exp_003",
    groupId: "grp_001",
    description: "Sewa motor x5",
    amount: 450000,
    baseAmount: 450000,
    tax: 0,
    serviceCharge: 0,
    paidBy: "usr_003",
    splitType: "equal",
    splits: {
      usr_001: 90000,
      usr_002: 90000,
      usr_003: 90000,
      usr_004: 90000,
      usr_005: 90000,
    },
    category: "⛽",
    createdAt: new Date("2025-03-12"),
    createdBy: "usr_003",
  },
  {
    id: "exp_004",
    groupId: "grp_001",
    description: "Tiket Tanah Lot",
    amount: 300000,
    baseAmount: 300000,
    tax: 0,
    serviceCharge: 0,
    paidBy: "usr_001",
    splitType: "percentage",
    splits: {
      usr_001: 90000,
      usr_002: 60000,
      usr_003: 60000,
      usr_004: 45000,
      usr_005: 45000,
    },
    category: "🎟️",
    createdAt: new Date("2025-03-12"),
    createdBy: "usr_001",
  },
  {
    id: "exp_005",
    groupId: "grp_001",
    description: "Oleh-oleh batik",
    amount: 850000,
    baseAmount: 850000,
    tax: 0,
    serviceCharge: 0,
    paidBy: "usr_004",
    splitType: "exact",
    splits: {
      usr_001: 200000,
      usr_002: 150000,
      usr_003: 200000,
      usr_004: 150000,
      usr_005: 150000,
    },
    category: "🛒",
    createdAt: new Date("2025-03-13"),
    createdBy: "usr_004",
  },
  {
    id: "exp_006",
    groupId: "grp_001",
    description: "Speedboat ke Nusa Penida",
    amount: 600000,
    baseAmount: 600000,
    tax: 0,
    serviceCharge: 0,
    paidBy: "usr_005",
    splitType: "shares",
    splits: {
      usr_001: 200000,
      usr_002: 100000,
      usr_003: 100000,
      usr_004: 100000,
      usr_005: 100000,
    },
    category: "⛵",
    createdAt: new Date("2025-03-13"),
    createdBy: "usr_005",
  },
  // grp_002 – Kost Margonda
  {
    id: "exp_007",
    groupId: "grp_002",
    description: "Sewa kost bulan April",
    amount: 1800000,
    baseAmount: 1800000,
    tax: 0,
    serviceCharge: 0,
    paidBy: "usr_001",
    splitType: "equal",
    splits: {
      usr_001: 600000,
      usr_002: 600000,
      usr_003: 600000,
    },
    category: "🏠",
    createdAt: new Date("2025-04-01"),
    createdBy: "usr_001",
  },
  {
    id: "exp_008",
    groupId: "grp_002",
    description: "Tagihan listrik bulan Maret",
    amount: 375000,
    baseAmount: 375000,
    tax: 0,
    serviceCharge: 0,
    paidBy: "usr_002",
    splitType: "equal",
    splits: {
      usr_001: 125000,
      usr_002: 125000,
      usr_003: 125000,
    },
    category: "💡",
    createdAt: new Date("2025-04-02"),
    createdBy: "usr_002",
  },
  {
    id: "exp_009",
    groupId: "grp_002",
    description: "Internet Indihome",
    amount: 250000,
    baseAmount: 250000,
    tax: 0,
    serviceCharge: 0,
    paidBy: "usr_003",
    splitType: "equal",
    splits: {
      usr_001: 83334,
      usr_002: 83333,
      usr_003: 83333,
    },
    category: "📶",
    createdAt: new Date("2025-04-03"),
    createdBy: "usr_003",
  },
  // grp_003 – Makan Siang
  {
    id: "exp_010",
    groupId: "grp_003",
    description: "Nasi padang bareng",
    amount: 180000,
    baseAmount: 163636,
    tax: 10,
    serviceCharge: 0,
    paidBy: "usr_001",
    splitType: "equal",
    splits: {
      usr_001: 45000,
      usr_002: 45000,
      usr_004: 45000,
      usr_005: 45000,
    },
    category: "🍽️",
    createdAt: new Date("2025-04-07"),
    createdBy: "usr_001",
  },
  {
    id: "exp_011",
    groupId: "grp_003",
    description: "Mie ayam & es teh",
    amount: 85000,
    baseAmount: 85000,
    tax: 0,
    serviceCharge: 0,
    paidBy: "usr_002",
    splitType: "exact",
    splits: {
      usr_001: 25000,
      usr_002: 20000,
      usr_004: 25000,
      usr_005: 15000,
    },
    category: "🍜",
    createdAt: new Date("2025-04-08"),
    createdBy: "usr_002",
  },
  {
    id: "exp_012",
    groupId: "grp_003",
    description: "Kopi kekinian + snack",
    amount: 120000,
    baseAmount: 109090,
    tax: 10,
    serviceCharge: 1,
    paidBy: "usr_004",
    splitType: "shares",
    splits: {
      usr_001: 40000,
      usr_002: 30000,
      usr_004: 30000,
      usr_005: 20000,
    },
    category: "☕",
    createdAt: new Date("2025-04-09"),
    createdBy: "usr_004",
  },
]

// ─── Balances ──────────────────────────────────────────────────────────────

export const mockBalances: Balance[] = [
  // grp_001
  { id: "bal_001", groupId: "grp_001", fromUserId: "usr_002", toUserId: "usr_001", amount: 240000 },
  { id: "bal_002", groupId: "grp_001", fromUserId: "usr_003", toUserId: "usr_001", amount: 110000 },
  { id: "bal_003", groupId: "grp_001", fromUserId: "usr_001", toUserId: "usr_004", amount: 50000 },
  { id: "bal_004", groupId: "grp_001", fromUserId: "usr_005", toUserId: "usr_002", amount: 60000 },
  // grp_002
  { id: "bal_005", groupId: "grp_002", fromUserId: "usr_001", toUserId: "usr_002", amount: 125000 },
  { id: "bal_006", groupId: "grp_002", fromUserId: "usr_003", toUserId: "usr_001", amount: 83334 },
  // grp_003
  { id: "bal_007", groupId: "grp_003", fromUserId: "usr_002", toUserId: "usr_001", amount: 25000 },
  { id: "bal_008", groupId: "grp_003", fromUserId: "usr_005", toUserId: "usr_004", amount: 20000 },
  { id: "bal_009", groupId: "grp_003", fromUserId: "usr_004", toUserId: "usr_001", amount: 70000 },
]

// ─── Activities ────────────────────────────────────────────────────────────

export const mockActivities: Activity[] = [
  {
    id: "act_001",
    groupId: "grp_001",
    type: "expense_added",
    actorId: "usr_001",
    expenseId: "exp_001",
    amount: 2500000,
    description: "Budi menambahkan \"Hotel Bali Beachfront (3 malam)\"",
    createdAt: new Date("2025-03-10T09:00:00"),
  },
  {
    id: "act_002",
    groupId: "grp_001",
    type: "member_joined",
    actorId: "usr_005",
    description: "Reza bergabung ke grup",
    createdAt: new Date("2025-03-09T18:30:00"),
  },
  {
    id: "act_003",
    groupId: "grp_001",
    type: "expense_added",
    actorId: "usr_002",
    expenseId: "exp_002",
    amount: 750000,
    description: "Siti menambahkan \"Makan malam di Jimbaran\"",
    createdAt: new Date("2025-03-11T20:00:00"),
  },
  {
    id: "act_004",
    groupId: "grp_001",
    type: "settlement",
    actorId: "usr_003",
    targetUserId: "usr_001",
    amount: 90000,
    description: "Agus melunasi Rp 90.000 ke Budi",
    createdAt: new Date("2025-03-14T10:00:00"),
  },
  {
    id: "act_005",
    groupId: "grp_001",
    type: "expense_added",
    actorId: "usr_003",
    expenseId: "exp_003",
    amount: 450000,
    description: "Agus menambahkan \"Sewa motor x5\"",
    createdAt: new Date("2025-03-12T08:00:00"),
  },
  {
    id: "act_006",
    groupId: "grp_001",
    type: "expense_added",
    actorId: "usr_004",
    expenseId: "exp_005",
    amount: 850000,
    description: "Dewi menambahkan \"Oleh-oleh batik\"",
    createdAt: new Date("2025-03-13T15:00:00"),
  },
  {
    id: "act_007",
    groupId: "grp_001",
    type: "expense_added",
    actorId: "usr_005",
    expenseId: "exp_006",
    amount: 600000,
    description: "Reza menambahkan \"Speedboat ke Nusa Penida\"",
    createdAt: new Date("2025-03-13T07:30:00"),
  },
  {
    id: "act_008",
    groupId: "grp_001",
    type: "expense_edited",
    actorId: "usr_001",
    expenseId: "exp_004",
    description: "Budi mengubah \"Tiket Tanah Lot\"",
    createdAt: new Date("2025-03-12T16:00:00"),
  },
  {
    id: "act_009",
    groupId: "grp_001",
    type: "settlement",
    actorId: "usr_002",
    targetUserId: "usr_001",
    amount: 150000,
    description: "Siti melunasi Rp 150.000 ke Budi",
    createdAt: new Date("2025-03-15T09:00:00"),
  },
  {
    id: "act_010",
    groupId: "grp_001",
    type: "member_joined",
    actorId: "usr_002",
    description: "Siti bergabung ke grup",
    createdAt: new Date("2025-03-01T12:00:00"),
  },
  // grp_002
  {
    id: "act_011",
    groupId: "grp_002",
    type: "expense_added",
    actorId: "usr_001",
    expenseId: "exp_007",
    amount: 1800000,
    description: "Budi menambahkan \"Sewa kost bulan April\"",
    createdAt: new Date("2025-04-01T08:00:00"),
  },
  // grp_003
  {
    id: "act_012",
    groupId: "grp_003",
    type: "expense_added",
    actorId: "usr_001",
    expenseId: "exp_010",
    amount: 180000,
    description: "Budi menambahkan \"Nasi padang bareng\"",
    createdAt: new Date("2025-04-07T12:30:00"),
  },
]

// ─── Notifications ─────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: "ntf_001",
    type: "payment_request",
    title: "Permintaan pembayaran",
    body: "Siti meminta Rp 125.000 darimu untuk Kost Margonda",
    isRead: false,
    groupId: "grp_002",
    actorId: "usr_002",
    createdAt: new Date("2025-04-09T10:00:00"),
  },
  {
    id: "ntf_002",
    type: "expense_added",
    title: "Pengeluaran baru",
    body: "Dewi menambahkan \"Kopi kekinian\" Rp 120.000 di Makan Siang Kantor",
    isRead: false,
    groupId: "grp_003",
    actorId: "usr_004",
    createdAt: new Date("2025-04-09T09:30:00"),
  },
  {
    id: "ntf_003",
    type: "settlement_reminder",
    title: "Pengingat pembayaran",
    body: "Kamu masih berutang Rp 50.000 ke Dewi di Bali Trip 2025",
    isRead: false,
    groupId: "grp_001",
    actorId: "usr_004",
    createdAt: new Date("2025-04-08T18:00:00"),
  },
  {
    id: "ntf_004",
    type: "group_invite",
    title: "Undangan grup baru",
    body: "Agus mengundangmu bergabung ke \"Weekend Bandung\"",
    isRead: false,
    groupId: undefined,
    actorId: "usr_003",
    createdAt: new Date("2025-04-08T14:00:00"),
  },
  {
    id: "ntf_005",
    type: "expense_added",
    title: "Pengeluaran baru",
    body: "Siti menambahkan \"Mie ayam & es teh\" Rp 85.000 di Makan Siang Kantor",
    isRead: false,
    groupId: "grp_003",
    actorId: "usr_002",
    createdAt: new Date("2025-04-08T13:00:00"),
  },
  {
    id: "ntf_006",
    type: "settlement_reminder",
    title: "Pembayaran diterima",
    body: "Siti sudah melunasi Rp 150.000 ke kamu di Bali Trip 2025",
    isRead: true,
    groupId: "grp_001",
    actorId: "usr_002",
    createdAt: new Date("2025-03-15T09:05:00"),
  },
  {
    id: "ntf_007",
    type: "expense_added",
    title: "Pengeluaran baru",
    body: "Reza menambahkan \"Speedboat ke Nusa Penida\" Rp 600.000 di Bali Trip 2025",
    isRead: true,
    groupId: "grp_001",
    actorId: "usr_005",
    createdAt: new Date("2025-03-13T07:35:00"),
  },
]

// ─── Helper Functions ──────────────────────────────────────────────────────

export function getUserById(id: UserId): User {
  const user = mockUsers.find((u) => u.id === id)
  if (!user) throw new Error(`User not found: ${id}`)
  return user
}

export function getGroupById(id: GroupId): Group {
  const group = mockGroups.find((g) => g.id === id)
  if (!group) throw new Error(`Group not found: ${id}`)
  return group
}

export function getExpensesByGroupId(groupId: GroupId): Expense[] {
  return mockExpenses
    .filter((e) => e.groupId === groupId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function getBalancesByGroupId(groupId: GroupId): Balance[] {
  return mockBalances.filter((b) => b.groupId === groupId)
}

export function getActivitiesByGroupId(groupId: GroupId): Activity[] {
  return mockActivities
    .filter((a) => a.groupId === groupId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/** Returns per-expense IOUs — used in the non-simplified balances view */
export function getExpenseBasedBalances(groupId: GroupId): Balance[] {
  const expenses = getExpensesByGroupId(groupId)
  const result: Balance[] = []
  for (const expense of expenses) {
    for (const [userId, amount] of Object.entries(expense.splits)) {
      if (userId !== expense.paidBy && amount > 0) {
        result.push({
          id: `detail_${expense.id}_${userId}`,
          groupId,
          fromUserId: userId,
          toUserId: expense.paidBy,
          amount,
          expenseDescription: expense.description,
          expenseCategory: expense.category,
        })
      }
    }
  }
  return result
}

export function getMembersByGroupId(groupId: GroupId): User[] {
  const group = getGroupById(groupId)
  return group.memberIds.map((id) => getUserById(id))
}

export const CATEGORY_OPTIONS = [
  { label: "Makanan", emoji: "🍽️" },
  { label: "Hotel", emoji: "🏨" },
  { label: "Transport", emoji: "⛽" },
  { label: "Belanja", emoji: "🛒" },
  { label: "Hiburan", emoji: "🎟️" },
  { label: "Kopi", emoji: "☕" },
  { label: "Utilitas", emoji: "💡" },
  { label: "Internet", emoji: "📶" },
  { label: "Wisata", emoji: "🎡" },
  { label: "Lainnya", emoji: "📦" },
]

export const EXPENSE_SUGGESTIONS = [
  "Makan siang",
  "Makan malam",
  "Kopi",
  "Bensin",
  "Parkir",
  "Tagihan listrik",
  "Internet",
  "Belanja bulanan",
]
