"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { formatIDR } from "@/lib/formatters"
import { getUserById, CURRENT_USER_ID } from "@/lib/mock-data"
import type { Balance } from "@/types"
import { SettlementAlertDialog } from "@/components/settlement/SettlementAlertDialog"
import { RequestPaymentSheet } from "@/components/request-payment/RequestPaymentSheet"

const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500",
  "bg-violet-500", "bg-rose-500", "bg-cyan-500",
  "bg-pink-500", "bg-indigo-500",
]
function avatarColor(id: string) {
  const n = parseInt(id.replace(/\D/g, ""), 10)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

interface Props {
  balance: Balance
  onSettle?: (balance: Balance) => void
}

export function BalanceItem({ balance, onSettle }: Props) {
  const fromUser = getUserById(balance.fromUserId)
  const toUser = getUserById(balance.toUserId)
  const isOwedToMe = balance.toUserId === CURRENT_USER_ID
  const iOwed = balance.fromUserId === CURRENT_USER_ID
  const isDetailed = !!balance.expenseDescription

  return (
    <div className="flex items-center gap-4 px-4 py-4">
      {/* Avatar */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Avatar className="h-9 w-9 cursor-pointer shrink-0">
            <AvatarFallback className={`text-xs font-semibold text-white ${avatarColor(iOwed ? balance.toUserId : balance.fromUserId)}`}>
              {iOwed ? toUser.initials : fromUser.initials}
            </AvatarFallback>
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 bg-card border-border/50" side="top">
          <div className="space-y-1 text-sm">
            <p className="font-medium">{fromUser.name} owes {toUser.name}</p>
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
            ? `You owe ${toUser.name}`
            : isOwedToMe
              ? `${fromUser.name} owes you`
              : `${fromUser.name} owes ${toUser.name}`}
        </p>
        {/* In detailed view show the expense name; in simplified show the amount */}
        {isDetailed ? (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {balance.expenseCategory} {balance.expenseDescription}
          </p>
        ) : null}
        <p className="text-sm font-semibold text-destructive mt-0.5">
          {formatIDR(balance.amount)}
        </p>
      </div>

      {/* Actions — only in simplified mode */}
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
  )
}
