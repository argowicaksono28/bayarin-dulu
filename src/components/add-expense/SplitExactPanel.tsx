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
  onChange: (userId: string, amount: number) => void
}

export function SplitExactPanel({ memberIds, totalAmount, inputs, onChange }: Props) {
  const totalExact = Object.values(inputs).reduce((s, v) => s + (v || 0), 0)
  const diff = totalAmount - totalExact
  const isValid = Math.abs(diff) <= 1

  return (
    <div className="space-y-2">
      {memberIds.map((id) => {
        const user = getUserById(id)
        return (
          <div key={id} className="flex items-center gap-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm">{user.name}</span>
            <div className="relative w-32">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
              <Input
                type="number"
                min={0}
                value={inputs[id] || ""}
                onChange={(e) => onChange(id, parseInt(e.target.value) || 0)}
                className="pl-8 text-right h-8 text-sm"
              />
            </div>
          </div>
        )
      })}
      <div className={cn(
        "text-xs text-right mt-2 font-medium",
        isValid ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}>
        {isValid
          ? `Total ${formatIDR(totalExact)} ✓`
          : diff > 0
            ? `Kurang ${formatIDR(diff)}`
            : `Lebih ${formatIDR(Math.abs(diff))}`}
      </div>
    </div>
  )
}
