"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Balance, Expense } from "@/types"
import { cn } from "@/lib/utils"
import { useSettlement } from "@/hooks/useSettlement"
import { simplifyDebts } from "@/lib/split-utils"
import { BalanceItem } from "./BalanceItem"
import { BalanceListSkeleton } from "./BalanceListSkeleton"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  groupId: string
  refreshKey?: number
}

export function BalanceList({ groupId, refreshKey }: Props) {
  const [rawBalances, setRawBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { balances, settle } = useSettlement(rawBalances)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null)

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [viewMode, setViewMode] = useState<"simplified" | "detailed">("simplified")

  const doFetch = useCallback(() => {
    setFetchError(null)
    Promise.all([
      fetch(`/api/groups/${groupId}/balances`).then(r => r.json()),
      fetch(`/api/groups/${groupId}/expenses`).then(r => r.json())
    ])
      .then(([balancesData, expensesData]) => {
        if (balancesData.error || expensesData.error) {
          setFetchError(balancesData.error ?? expensesData.error ?? "Failed to load data")
          setRawBalances([])
          setExpenses([])
        } else {
          setRawBalances(Array.isArray(balancesData) ? balancesData : [])
          setExpenses(Array.isArray(expensesData) ? expensesData : [])
        }
        setIsLoading(false)
      })
      .catch(() => {
        setFetchError("Network error — could not load data")
        setRawBalances([])
        setExpenses([])
        setIsLoading(false)
      })
  }, [groupId])

  // Initial fetch + real-time subscription on settlements
  useEffect(() => {
    setIsLoading(true)
    doFetch()

    const supabase = createClient()
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    const channel = supabase
      .channel(`balances-settlements:${groupId}:${Date.now()}`)
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "settlements", filter: `group_id=eq.${groupId}` },
        () => doFetch()
      )
      .subscribe()
    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [groupId, doFetch])

  // Re-fetch when parent signals a change (e.g. expense deleted)
  useEffect(() => {
    if (refreshKey === undefined || refreshKey === 0) return
    setIsLoading(true)
    doFetch()
  }, [refreshKey, doFetch])

  if (isLoading) return <BalanceListSkeleton />

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <p className="text-sm text-destructive font-medium">{fetchError}</p>
        <p className="text-xs text-muted-foreground mt-1">Check your connection and try again</p>
        <button
          onClick={() => { setIsLoading(true); doFetch() }}
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

  const simplifiedDisplayed = simplifyDebts(balances).map((b) => ({
    ...b,
    fromProfile: profileLookup[b.fromUserId] ?? null,
    toProfile:   profileLookup[b.toUserId]   ?? null,
  }))

  const detailedDisplayed = balances.map((b) => ({
    ...b,
    fromProfile: profileLookup[b.fromUserId] ?? null,
    toProfile:   profileLookup[b.toUserId]   ?? null,
  }))

  const displayed = viewMode === "simplified" ? simplifiedDisplayed : detailedDisplayed

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
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewMode === "simplified" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Simplified
          </button>
          <button
            onClick={() => setViewMode("detailed")}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", viewMode === "detailed" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
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
              onSettle={settle}
              expenses={viewMode === "detailed" ? expenses : undefined}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
