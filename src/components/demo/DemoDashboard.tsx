"use client"

import { useDemo } from "@/contexts/DemoContext"
import { DemoGroupCard } from "./DemoGroupCard"
import { Card } from "@/components/ui/card"
import { formatIDR } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function DemoDashboard() {
  const { state } = useDemo()
  const { groups } = state

  const netBalance = groups.reduce((sum, g) => sum + (g.myBalance ?? 0), 0)
  const isPositive = netBalance > 0
  const isNeutral = netBalance === 0

  return (
    <div className="space-y-6 px-4 py-6 max-w-3xl mx-auto lg:px-8">
      {/* Net balance card */}
      <Card className="border border-border/50 bg-card rounded-xl p-5">
        <p className="text-sm text-muted-foreground mb-1">Your net balance</p>
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
        {!isNeutral && (
          <p className="text-xs text-muted-foreground mt-1">
            {isPositive ? "Overall, others owe you" : "Overall, you owe others"}
          </p>
        )}
      </Card>

      {/* Groups */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-base text-foreground">Your Groups</h2>
          <span className="text-xs text-muted-foreground">{groups.length} groups</span>
        </div>
        <Card className="border border-border/50 bg-card rounded-xl overflow-hidden">
          <div className="divide-y divide-border/40">
            {groups.map((group) => (
              <DemoGroupCard key={group.id} group={group} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
