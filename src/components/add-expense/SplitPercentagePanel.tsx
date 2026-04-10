"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { getUserById } from "@/lib/mock-data"
import { formatIDR } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface Props {
  memberIds: string[]
  totalAmount: number
  inputs: Record<string, number>
  onChange: (userId: string, pct: number) => void
}

export function SplitPercentagePanel({ memberIds, totalAmount, inputs, onChange }: Props) {
  const totalPct = Object.values(inputs).reduce((s, v) => s + (v || 0), 0)
  const isValid = Math.abs(totalPct - 100) < 0.01

  return (
    <div className="space-y-2">
      {memberIds.map((id) => {
        const user = getUserById(id)
        const pct = inputs[id] || 0
        const amount = Math.floor(totalAmount * (pct / 100))
        return (
          <div key={id} className="flex items-center gap-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm">{user.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatIDR(amount)}
              </span>
              <div className="relative w-20">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={pct || ""}
                  onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
                  className="pr-6 text-right h-8 text-sm"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        )
      })}
      <div className={cn(
        "text-xs text-right mt-2 font-medium",
        isValid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}>
        Total: {totalPct.toFixed(1)}% {isValid ? "✓" : `(perlu ${(100 - totalPct).toFixed(1)}% lagi)`}
      </div>
    </div>
  )
}
