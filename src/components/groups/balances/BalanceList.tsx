"use client"

import { useState, useEffect } from "react"
import { Balance } from "@/types"
import { useSettlement } from "@/hooks/useSettlement"
import { simplifyDebts } from "@/lib/split-utils"
import { BalanceItem } from "./BalanceItem"
import { BalanceListSkeleton } from "./BalanceListSkeleton"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"

interface Props {
  groupId: string
}

export function BalanceList({ groupId }: Props) {
  const [rawBalances, setRawBalances] = useState<Balance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [simplified, setSimplified] = useState(true)
  const { balances, settle } = useSettlement(rawBalances)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/groups/${groupId}/balances`)
      .then((r) => r.json())
      .then((data) => {
        setRawBalances(Array.isArray(data) ? data : [])
        setIsLoading(false)
      })
      .catch(() => {
        setRawBalances([])
        setIsLoading(false)
      })
  }, [groupId])

  if (isLoading) return <BalanceListSkeleton />

  const simplifiedList = simplifyDebts(balances)
  const displayed = simplified ? simplifiedList : balances

  if (displayed.length === 0 && simplified) {
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
      {/* Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="simplified"
          checked={simplified}
          onCheckedChange={setSimplified}
          className="data-[state=checked]:bg-primary"
        />
        <Label htmlFor="simplified" className="text-sm text-muted-foreground cursor-pointer select-none">
          Simplified debts
        </Label>
        <span className="text-xs text-muted-foreground ml-auto">
          {displayed.length} transaction{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CheckCircle className="h-6 w-6 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">All settled up!</p>
        </div>
      ) : (
        <Card className="border border-border/50 bg-card rounded-xl overflow-hidden">
          <div className="divide-y divide-border/40">
            {displayed.map((balance) => (
              <BalanceItem
                key={balance.id}
                balance={balance}
                onSettle={simplified ? settle : undefined}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
