import { formatIDR, formatDate } from "@/lib/formatters"
import { getUserById, CURRENT_USER_ID } from "@/lib/mock-data"
import type { Expense } from "@/types"
import { cn } from "@/lib/utils"

const splitTypeLabels: Record<string, string> = {
  equal: "equal",
  percentage: "percent",
  exact: "exact",
  shares: "shares",
}

interface Props {
  expense: Expense
}

export function ExpenseItem({ expense }: Props) {
  const payer = getUserById(expense.paidBy)
  const isPaidByMe = expense.paidBy === CURRENT_USER_ID

  return (
    <div className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors rounded-lg">
      {/* Category emoji in a subtle circle */}
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-base shrink-0">
        {expense.category}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Paid by {isPaidByMe ? "you" : payer.name} · {formatDate(expense.createdAt)}
        </p>
      </div>

      {/* Amount + badge */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-foreground">{formatIDR(expense.amount)}</p>
        <span className={cn(
          "inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium",
          "bg-primary/15 text-primary"
        )}>
          {splitTypeLabels[expense.splitType]}
        </span>
      </div>
    </div>
  )
}
