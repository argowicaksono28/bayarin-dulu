"use client"

import { useState, useMemo } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatIDR } from "@/lib/formatters"
import { Store, Check } from "lucide-react"
import type { User } from "@/types"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScannedItem {
  id: string
  name: string
  qty: number
  amount: number
}

export interface ScannedReceipt {
  restaurantName: string
  items: ScannedItem[]
  subtotal: number
  taxLabel: string
  taxPercent: number
  tax: number
  serviceChargePercent: number
  serviceCharge: number
  total: number
}

export interface ReceiptConfirmResult {
  description: string
  baseAmount: number
  taxPercent: number
  serviceChargePercent: number
  /** Exact per-member amounts (already includes proportional tax + service) */
  splits: Record<string, number>
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: ScannedReceipt | null
  members: User[]
  onConfirm: (result: ReceiptConfirmResult) => void
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function computeItemSplits(
  items: ScannedItem[],
  assignments: Record<string, string[]>,
  members: User[],
  taxPercent: number,
  serviceChargePercent: number
): Record<string, number> {
  const memberTotals: Record<string, number> = {}
  members.forEach((m) => { memberTotals[m.id] = 0 })

  for (const item of items) {
    const assigned = assignments[item.id] ?? members.map((m) => m.id)
    const activeAssigned = assigned.filter((id) => memberTotals[id] !== undefined)
    if (activeAssigned.length === 0) continue
    const share = item.amount / activeAssigned.length
    for (const uid of activeAssigned) {
      memberTotals[uid] = (memberTotals[uid] ?? 0) + share
    }
  }

  // Apply tax + service proportionally
  const subtotal = Object.values(memberTotals).reduce((a, b) => a + b, 0)
  const multiplier = 1 + taxPercent / 100 + serviceChargePercent / 100

  const result: Record<string, number> = {}
  let total = 0
  const ids = Object.keys(memberTotals)
  for (let i = 0; i < ids.length - 1; i++) {
    const rounded = Math.round(memberTotals[ids[i]] * multiplier)
    result[ids[i]] = rounded
    total += rounded
  }
  // Last member gets remainder to avoid rounding drift
  const grandTotal = subtotal > 0
    ? Math.round(subtotal * multiplier)
    : 0
  result[ids[ids.length - 1]] = Math.max(0, grandTotal - total)

  return result
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReceiptScannerSheet({ open, onOpenChange, receipt, members, onConfirm }: Props) {
  // assignments[itemId] = array of assigned memberIds (empty = ALL)
  const [assignments, setAssignments] = useState<Record<string, string[]>>({})

  function toggleMember(itemId: string, memberId: string) {
    setAssignments((prev) => {
      // Start with current selection or all members
      const current = prev[itemId] ?? members.map((m) => m.id)
      const next = current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
      // Never allow 0 members — revert to all
      return { ...prev, [itemId]: next.length > 0 ? next : members.map((m) => m.id) }
    })
  }

  function isMemberAssigned(itemId: string, memberId: string) {
    const assigned = assignments[itemId] ?? members.map((m) => m.id)
    return assigned.includes(memberId)
  }

  const memberSplits = useMemo(() => {
    if (!receipt) return {}
    return computeItemSplits(
      receipt.items,
      assignments,
      members,
      receipt.taxPercent,
      receipt.serviceChargePercent
    )
  }, [receipt, assignments, members])

  function handleConfirm() {
    if (!receipt) return
    onConfirm({
      description: receipt.restaurantName || "Restaurant",
      baseAmount: receipt.subtotal || receipt.total,
      taxPercent: receipt.taxPercent,
      serviceChargePercent: receipt.serviceChargePercent,
      splits: memberSplits,
    })
    onOpenChange(false)
  }

  if (!receipt) return null

  const grandTotal = receipt.total || (receipt.subtotal + receipt.tax + receipt.serviceCharge)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl bg-card border-border/50 h-[92vh] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
          <SheetTitle className="flex items-center gap-2">
            {receipt.restaurantName ? (
              <>
                <Store className="h-4 w-4 text-muted-foreground" />
                {receipt.restaurantName}
              </>
            ) : (
              "Receipt Split"
            )}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Tap members on each item to assign who ordered it
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-2">
            {/* ── Line items ── */}
            {receipt.items.map((item) => (
              <div key={item.id} className="py-3 border-b border-border/30 last:border-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {item.qty > 1 && (
                        <span className="text-muted-foreground mr-1">{item.qty}×</span>
                      )}
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatIDR(item.amount)}</p>
                  </div>
                  {/* Member chips */}
                  <div className="flex gap-1 flex-wrap justify-end">
                    {members.map((m) => {
                      const assigned = isMemberAssigned(item.id, m.id)
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleMember(item.id, m.id)}
                          className={cn(
                            "relative h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center",
                            assigned
                              ? "border-primary ring-2 ring-primary/30"
                              : "border-border/50 opacity-30"
                          )}
                          title={m.name}
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[9px] bg-muted">{m.initials}</AvatarFallback>
                          </Avatar>
                          {assigned && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-2 w-2 text-primary-foreground" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Charges ── */}
          <div className="mt-2 rounded-xl bg-muted/30 border border-border/30 divide-y divide-border/30">
            <div className="flex justify-between px-3 py-2 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatIDR(receipt.subtotal)}</span>
            </div>
            {receipt.tax > 0 && (
              <div className="flex justify-between px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  {receipt.taxLabel || "Tax"}
                  {receipt.taxPercent > 0 && (
                    <span className="ml-1 text-xs">({receipt.taxPercent}%)</span>
                  )}
                </span>
                <span>{formatIDR(receipt.tax)}</span>
              </div>
            )}
            {receipt.serviceCharge > 0 && (
              <div className="flex justify-between px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  Service
                  {receipt.serviceChargePercent > 0 && (
                    <span className="ml-1 text-xs">({receipt.serviceChargePercent}%)</span>
                  )}
                </span>
                <span>{formatIDR(receipt.serviceCharge)}</span>
              </div>
            )}
            <div className="flex justify-between px-3 py-2.5 font-semibold">
              <span>Total</span>
              <span>{formatIDR(grandTotal)}</span>
            </div>
          </div>

          {/* ── Per-member summary ── */}
          {members.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Each person pays
              </p>
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-1.5">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[9px] bg-muted">{m.initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm">{m.name}</span>
                  <span className="text-sm font-medium tabular-nums">
                    {formatIDR(memberSplits[m.id] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="h-6" />
        </ScrollArea>

        <Separator className="shrink-0" />

        <div className="px-4 py-3 shrink-0">
          <Button className="w-full" onClick={handleConfirm}>
            Use This Split
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
