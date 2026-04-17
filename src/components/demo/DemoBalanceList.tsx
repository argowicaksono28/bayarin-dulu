"use client"

import { useState } from "react"
import { useDemo, DEMO_CURRENT_USER_ID } from "@/contexts/DemoContext"
import { BalanceItem } from "@/components/groups/balances/BalanceItem"
import { BalanceListSkeleton } from "@/components/groups/balances/BalanceListSkeleton"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { simplifyDebts } from "@/lib/split-utils"
import type { Balance } from "@/types"
import { toast } from "sonner"

interface Props {
  groupId: string
}

export function DemoBalanceList({ groupId }: Props) {
  const { getBalancesByGroupId, getExpensesByGroupId, dispatch } = useDemo()
  const [viewMode, setViewMode] = useState<"simplified" | "detailed">("simplified")

  const rawBalances = getBalancesByGroupId(groupId)
  const expenses = getExpensesByGroupId(groupId)

  const simplifiedDisplayed = simplifyDebts(rawBalances).map((b) => {
    const found = rawBalances.find(
      (r) => (r.fromUserId === b.fromUserId && r.toUserId === b.toUserId) ||
              (r.fromUserId === b.toUserId && r.toUserId === b.fromUserId)
    )
    return {
      ...b,
      fromProfile: rawBalances.find(r => r.fromUserId === b.fromUserId)?.fromProfile ?? null,
      toProfile: rawBalances.find(r => r.toUserId === b.toUserId)?.toProfile ?? null,
    }
  })

  const detailedDisplayed = rawBalances

  const displayed = viewMode === "simplified" ? simplifiedDisplayed : detailedDisplayed

  function handleSettle(balance: Balance) {
    const fromName = balance.fromProfile?.name ?? balance.fromUserId
    const toName = balance.toProfile?.name ?? balance.toUserId

    dispatch({
      type: "SETTLE_BALANCE",
      balanceId: balance.id,
      groupId,
      amount: balance.amount,
      fromName,
      toName,
    })

    toast.success(`Payment recorded! (demo only — not saved)`)
  }

  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-semibold text-base mb-1">All settled up!</h3>
        <p className="text-sm text-muted-foreground">No outstanding balances in this group</p>
      </div>
    )
  }

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("simplified")}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              viewMode === "simplified" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Simplified
          </button>
          <button
            onClick={() => setViewMode("detailed")}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              viewMode === "detailed" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Detailed
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {displayed.length} transaction{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Card className="border border-border/50 bg-card rounded-xl overflow-hidden">
        <div className="divide-y divide-border/40">
          {displayed.map((balance) => (
            <BalanceItem
              key={balance.id}
              balance={balance}
              onSettle={handleSettle}
              currentUserId={DEMO_CURRENT_USER_ID}
              expenses={viewMode === "detailed" ? expenses : undefined}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
