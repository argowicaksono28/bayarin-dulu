"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { formatIDR } from "@/lib/formatters"
import type { Balance, Expense } from "@/types"
import { SettlementAlertDialog } from "@/components/settlement/SettlementAlertDialog"
import { RequestPaymentSheet } from "@/components/request-payment/RequestPaymentSheet"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const AVATAR_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-amber-700",
  "bg-violet-600", "bg-rose-700", "bg-cyan-700",
  "bg-pink-700", "bg-indigo-600",
]
function avatarColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface Props {
  balance: Balance
  onSettle?: (balance: Balance) => void
  expenses?: Expense[]
}

export function BalanceItem({ balance, onSettle, expenses }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  const fromProfile = balance.fromProfile
  const toProfile = balance.toProfile
  const fromName = fromProfile?.name ?? balance.fromUserId.slice(0, 8)
  const toName = toProfile?.name ?? balance.toUserId.slice(0, 8)
  const fromInitials = fromProfile?.initials ?? "?"
  const toInitials = toProfile?.initials ?? "?"

  const isOwedToMe = balance.toUserId === currentUserId
  const iOwed = balance.fromUserId === currentUserId
  const isDetailed = !!balance.expenseDescription

  const otherInitials = iOwed ? toInitials : fromInitials
  const otherId = iOwed ? balance.toUserId : balance.fromUserId

  const relatedExpenses = expenses
    ? expenses.filter((e) => {
        const fromOwesTo = e.paidBy === balance.toUserId && (e.splits[balance.fromUserId] || 0) > 0
        const toOwesFrom = e.paidBy === balance.fromUserId && (e.splits[balance.toUserId] || 0) > 0
        return fromOwesTo || toOwesFrom
      })
    : []
  const hasExpenses = relatedExpenses.length > 0

  return (
    <div className="flex flex-col py-4 px-4 hover:bg-muted/10 transition-colors">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer shrink-0">
              <AvatarFallback className={`text-xs font-semibold text-white ${avatarColor(otherId)}`}>
                {otherInitials}
              </AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 bg-card border-border/50" side="top">
            <div className="space-y-1 text-sm">
              <p className="font-medium">{fromName} owes {toName}</p>
              <p className="text-muted-foreground">
                Amount: <span className="text-destructive font-semibold">{formatIDR(balance.amount)}</span>
              </p>
              {balance.expenseDescription && (
                <p className="text-muted-foreground">For: {balance.expenseDescription}</p>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {iOwed
              ? `You owe ${toName}`
              : isOwedToMe
                ? `${fromName} owes you`
                : `${fromName} owes ${toName}`}
          </p>
          {isDetailed && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {balance.expenseCategory} {balance.expenseDescription}
            </p>
          )}
          <div className="flex items-center gap-1 mt-0.5">
            <p className="text-sm font-semibold text-destructive">
              {formatIDR(balance.amount)}
            </p>
            {hasExpenses && (
              <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isDetailed && onSettle && (
          <div className="flex gap-2 shrink-0">
            {(iOwed || isOwedToMe) && (
              <SettlementAlertDialog balance={balance} onConfirm={() => onSettle(balance)} />
            )}
            {isOwedToMe && (
              <RequestPaymentSheet balance={balance} />
            )}
          </div>
        )}
      </div>

      {hasExpenses && expanded && (
        <div className="mt-3 pt-3 pb-1 border-t border-border/40 space-y-2">
          {relatedExpenses.map((expense) => {
            const isFromOwingTo = expense.paidBy === balance.toUserId
            const contributingAmount = isFromOwingTo
              ? expense.splits[balance.fromUserId]
              : expense.splits[balance.toUserId]
            
            // If fromOwesTo, it adds to the balance. If toOwesFrom, it subtracts from the balance.
            const directionText = isFromOwingTo ? `Added to debt` : `Reduced debt`
            const amountColor = isFromOwingTo ? "text-destructive" : "text-emerald-500"
            const sign = isFromOwingTo ? "+" : "-"

             return (
              <div key={expense.id} className="flex items-center justify-between pl-12 pr-2 text-sm">
                <div className="flex flex-col min-w-0 pr-3">
                  <p className="text-xs font-medium text-foreground truncate">{expense.category} {expense.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {directionText}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("text-xs font-semibold", amountColor)}>
                    {sign}{formatIDR(contributingAmount || 0)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
