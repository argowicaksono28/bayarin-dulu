export type UserId = string
export type GroupId = string
export type ExpenseId = string

export type SplitType = "equal" | "percentage" | "exact" | "shares"
export type NotificationType =
  | "payment_request"
  | "expense_added"
  | "group_invite"
  | "settlement_reminder"
export type ActivityType =
  | "expense_added"
  | "expense_edited"
  | "expense_deleted"
  | "member_joined"
  | "settlement"

export interface User {
  id: UserId
  name: string
  email: string
  avatarUrl: string | null
  phone: string
  initials: string
  /** True for guest members who have no account */
  isGuest?: boolean
}

export interface Group {
  id: GroupId
  name: string
  emoji: string
  coverColor: string
  memberIds: UserId[]
  createdAt: Date
  createdBy: UserId
  totalExpenses: number
  myBalance: number
  publicViewToken?: string | null
}

export interface UserProfile {
  id: UserId
  name: string
  initials: string
  avatarUrl: string | null
}

export interface ReceiptItem {
  name: string
  qty: number
  amount: number
}

export interface ReceiptData {
  restaurantName: string
  items: ReceiptItem[]
  subtotal: number
}

export interface Expense {
  id: ExpenseId
  groupId: GroupId
  description: string
  amount: number
  baseAmount: number
  tax: number
  serviceCharge: number
  paidBy: UserId
  paidByProfile?: UserProfile | null
  splitType: SplitType
  splits: Record<UserId, number>
  category: string
  notes?: string
  receiptData?: ReceiptData | null
  createdAt: Date | string
  createdBy: UserId
}

export interface Balance {
  id: string
  groupId: GroupId
  fromUserId: UserId
  toUserId: UserId
  fromProfile?: UserProfile & { phone?: string | null } | null
  toProfile?: UserProfile & { phone?: string | null } | null
  amount: number
  /** Present only in detailed (non-simplified) view — the expense that generated this IOU */
  expenseDescription?: string
  expenseCategory?: string
}

export interface Settlement {
  id: string
  groupId: GroupId
  fromUserId: UserId
  toUserId: UserId
  amount: number
  settledAt: Date
  status: "completed" | "pending_undo"
}

export interface Activity {
  id: string
  groupId: GroupId
  type: ActivityType
  actorId: UserId
  actor?: UserProfile | null
  targetUserId?: UserId
  target?: UserProfile | null
  expenseId?: ExpenseId
  amount?: number
  description: string
  createdAt: Date | string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  groupId?: GroupId
  actorId: UserId
  actor?: UserProfile | null
  createdAt: Date | string
}

export interface SplitResult {
  splits: Record<string, number>
  isValid: boolean
  errorMessage?: string
}

export interface AddExpenseFormValues {
  description: string
  amount: number
  paidBy: UserId
  splitType: SplitType
  splits: Record<UserId, number>
  tax: number
  serviceCharge: number
  category: string
  notes?: string
}
