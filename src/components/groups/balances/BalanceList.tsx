"use client"

import { useState, useEffect } from "react"
import { Balance } from "@/types"
import { useSettlement } from "@/hooks/useSettlement"
import { simplifyDebts } from "@/lib/split-utils"
import { BalanceItem } from "./BalanceItem"
import { BalanceListSkeleton } from "./BalanceListSkeleton"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface Props {
  groupId: string
}

export function BalanceList({ groupId }: Props) {
  const [rawBalances, setRawBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { balances, settle } = useSettlement(rawBalances)

  useEffect(() => {
    setIsLoading(true)
    setFetchError(null)
    fetch(`/api/groups/${groupId}/balances`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          setFetchError(data.error ?? "Failed to load balances")
          setRawBalances([])
        } else {
          setRawBalances(Array.isArray(data) ? data : [])
        }
        setIsLoading(false)
      })
      .catch(() => {
        setFetchError("Network error — could not load balances")
        setRawBalances([])
        setIsLoading(false)
      })
  }, [groupId])

  if (isLoading) return <BalanceListSkeleton />

  function refetch() {
    setIsLoading(true)
    setFetchError(null)
    fetch(`/api/groups/${groupId}/balances`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          setFetchError(data.error ?? "Failed to load balances")
          setRawBalances([])
        } else {
          setRawBalances(Array.isArray(data) ? data : [])
        }
        setIsLoading(false)
      })
      .catch(() => {
        setFetchError("Network error — could not load balances")
        setRawBalances([])
        setIsLoading(false)
      })
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <p className="text-sm text-destructive font-medium">{fetchError}</p>
        <p className="text-xs text-muted-foreground mt-1">Check your connection and try again</p>
        <button
          onClick={refetch}
          className="mt-3 text-sm text-primary hover:underline font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  // Re-attach profiles lost during simplification
  const profileLookup: Record<string, Balance["fromProfile"]> = {}
  for (const b of balances) {
    if (b.fromProfile) profileLookup[b.fromUserId] = b.fromProfile
    if (b.toProfile)   profileLookup[b.toUserId]   = b.toProfile
  }

  const displayed = simplifyDebts(balances).map((b) => ({
    ...b,
    fromProfile: profileLookup[b.fromUserId] ?? null,
    toProfile:   profileLookup[b.toUserId]   ?? null,
  }))

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
      <div className="flex justify-end">
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
              onSettle={settle}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
