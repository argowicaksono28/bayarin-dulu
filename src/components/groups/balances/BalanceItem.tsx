"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { formatIDR } from "@/lib/formatters"
import type { Balance } from "@/types"
import { SettlementAlertDialog } from "@/components/settlement/SettlementAlertDialog"
import { RequestPaymentSheet } from "@/components/request-payment/RequestPaymentSheet"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

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
}

export function BalanceItem({ balance, onSettle }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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

  return (
    <div className="flex items-center gap-4 px-4 py-4">
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
        <p className="text-sm font-semibold text-destructive mt-0.5">
          {formatIDR(balance.amount)}
        </p>
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
  )
}
