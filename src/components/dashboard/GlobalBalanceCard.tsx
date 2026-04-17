"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { formatIDR } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Group } from "@/types"

interface GlobalBalanceCardProps {
  initialNetBalance?: number | null
}

export function GlobalBalanceCard({ initialNetBalance = null }: GlobalBalanceCardProps) {
  const [netBalance, setNetBalance] = useState<number | null>(initialNetBalance)

  useEffect(() => {
    if (initialNetBalance !== null) return
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => {
        setNetBalance(
          Array.isArray(data) ? data.reduce((sum: number, g: Group) => sum + (g.myBalance ?? 0), 0) : 0
        )
      })
      .catch(() => setNetBalance(0))
  }, [])

  const isPositive = (netBalance ?? 0) > 0
  const isNeutral  = netBalance === 0

  return (
    <Card className="border border-border/50 bg-card rounded-xl p-5">
      <p className="text-sm text-muted-foreground mb-1">Your net balance</p>

      {netBalance === null ? (
        <div className="h-8 w-44 rounded bg-muted animate-pulse" />
      ) : (
        <div className="flex items-center gap-2">
          {isNeutral ? (
            <Minus className="h-5 w-5 text-muted-foreground" />
          ) : isPositive ? (
            <TrendingUp className="h-5 w-5 text-primary" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
          <span className={cn(
            "text-2xl font-bold",
            isNeutral ? "text-muted-foreground" : isPositive ? "text-primary" : "text-destructive"
          )}>
            {isNeutral ? "All settled" : (isPositive ? "+ " : "- ") + formatIDR(Math.abs(netBalance))}
          </span>
        </div>
      )}

      {netBalance !== null && !isNeutral && (
        <p className="text-xs text-muted-foreground mt-1">
          {isPositive ? "Overall, others owe you" : "Overall, you owe others"}
        </p>
      )}
    </Card>
  )
}
