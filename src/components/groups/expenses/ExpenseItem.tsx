import { formatIDR, formatDate } from "@/lib/formatters"
import type { Expense } from "@/types"
import { cn } from "@/lib/utils"
import { ChevronRight, Package, ScanLine } from "lucide-react"
import { CATEGORY_OPTIONS } from "@/lib/constants"

const splitTypeLabels: Record<string, string> = {
  equal: "equal",
  percentage: "percent",
  exact: "exact",
  shares: "shares",
}

interface Props {
  expense: Expense
  onClick: () => void
}

export function ExpenseItem({ expense, onClick }: Props) {
  const payerName = expense.paidByProfile?.name ?? "Unknown"
  const category = CATEGORY_OPTIONS.find((c) => c.emoji === expense.category)
  const Icon = category?.icon ?? Package

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors text-left"
    >
      {/* Category icon */}
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-foreground" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
          {expense.receiptData && <ScanLine className="h-3 w-3 text-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Paid by {payerName} · {formatDate(expense.createdAt)}
        </p>
      </div>

      {/* Amount + badge + chevron */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{formatIDR(expense.amount)}</p>
          <span className={cn(
            "inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold",
            "bg-primary/15 text-secondary-foreground dark:text-primary"
          )}>
            {splitTypeLabels[expense.splitType]}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  )
}
