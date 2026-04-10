"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { getUserById } from "@/lib/mock-data"
import { formatIDR } from "@/lib/formatters"

interface Props {
  memberIds: string[]
  totalAmount: number
  inputs: Record<string, number>
  onChange: (userId: string, shares: number) => void
}

export function SplitSharesPanel({ memberIds, totalAmount, inputs, onChange }: Props) {
  const totalShares = Object.values(inputs).reduce((s, v) => s + (v || 0), 0)

  return (
    <div className="space-y-2">
      {memberIds.map((id) => {
        const user = getUserById(id)
        const shares = inputs[id] || 0
        const amount = totalShares > 0
          ? Math.floor(totalAmount * (shares / totalShares))
          : 0
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
                  value={shares || ""}
                  onChange={(e) => onChange(id, parseInt(e.target.value) || 0)}
                  className="text-right h-8 text-sm"
                  placeholder="0"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  bgn
                </span>
              </div>
            </div>
          </div>
        )
      })}
      <p className="text-xs text-muted-foreground text-right">
        Total {totalShares} bagian
      </p>
    </div>
  )
}
