"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatIDR } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { Group } from "@/types"

interface GlobalBalanceCardProps {
  initialNetBalance?: number | null
}

export function GlobalBalanceCard({ initialNetBalance = null }: GlobalBalanceCardProps) {
  const [netBalance, setNetBalance] = useState<number | null>(initialNetBalance)

  useEffect(() => {
    if (initialNetBalance !== null) return // Skip fetching if initial balance is provided
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => {
        setNetBalance(
          Array.isArray(data) ? data.reduce((sum: number, g: Group) => sum + (g.myBalance ?? 0), 0) : 0
        )
      })
      .catch(() => setNetBalance(0))
  }, [])

  const isPositive = (netBalance ?? 0) >= 0

  return (
    <Card className="border border-border/50 bg-card rounded-xl">
      <CardContent className="px-6 py-5">
        <p className="text-sm text-muted-foreground mb-1">Your Net Balance</p>
        {netBalance === null ? (
          <div className="h-9 w-40 rounded bg-muted animate-pulse" />
        ) : (
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            isPositive ? "text-primary" : "text-destructive"
          )}>
            {netBalance > 0 ? "+ " : netBalance < 0 ? "- " : ""}
            {formatIDR(Math.abs(netBalance))}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {netBalance !== null && netBalance > 0 ? "You lent overall" : netBalance !== null && netBalance < 0 ? "You owe overall" : "Settled"}
        </p>
      </CardContent>
    </Card>
  )
}
