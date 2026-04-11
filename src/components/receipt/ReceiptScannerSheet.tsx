"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatIDR } from "@/lib/formatters"
import { Store, Check, Pencil } from "lucide-react"
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
  grandTotal: number
): Record<string, number> {
  if (members.length === 0) return {}

  const memberItemTotals: Record<string, number> = {}
  members.forEach((m) => { memberItemTotals[m.id] = 0 })

  for (const item of items) {
    const assigned = assignments[item.id] ?? members.map((m) => m.id)
    const active = assigned.filter((id) => id in memberItemTotals)
    if (active.length === 0) continue
    const share = item.amount / active.length
    for (const uid of active) memberItemTotals[uid] += share
  }

  const itemsSubtotal = Object.values(memberItemTotals).reduce((a, b) => a + b, 0)
  const ids = members.map((m) => m.id)
  const result: Record<string, number> = {}
  let assigned = 0

  for (let i = 0; i < ids.length - 1; i++) {
    const proportion = itemsSubtotal > 0 ? memberItemTotals[ids[i]] / itemsSubtotal : 1 / ids.length
    const rounded = Math.round(proportion * grandTotal)
    result[ids[i]] = rounded
    assigned += rounded
  }
  result[ids[ids.length - 1]] = Math.max(0, grandTotal - assigned)
  return result
}

// ─── Editable item row ────────────────────────────────────────────────────────

function ItemRow({
  item,
  members,
  isAssigned,
  onToggleMember,
  onUpdate,
}: {
  item: ScannedItem
  members: User[]
  isAssigned: (memberId: string) => boolean
  onToggleMember: (memberId: string) => void
  onUpdate: (field: "name" | "amount", value: string | number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(item.name)
  const [draftAmount, setDraftAmount] = useState(String(item.amount))

  function commitEdit() {
    onUpdate("name", draftName.trim() || item.name)
    onUpdate("amount", parseFloat(draftAmount) || item.amount)
    setEditing(false)
  }

  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      {editing ? (
        <div className="space-y-2 mb-2">
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="h-8 text-sm bg-muted/50"
            placeholder="Item name"
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
              <Input
                type="number"
                value={draftAmount}
                onChange={(e) => setDraftAmount(e.target.value)}
                className="h-8 pl-7 text-sm bg-muted/50"
              />
            </div>
            <Button size="sm" className="h-8" onClick={commitEdit}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 mb-2">
          <button
            type="button"
            onClick={() => { setDraftName(item.name); setDraftAmount(String(item.amount)); setEditing(true) }}
            className="flex-1 min-w-0 text-left group"
          >
            <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
              {item.qty > 1 && <span className="text-muted-foreground mr-1">{item.qty}×</span>}
              {item.name}
              <Pencil className="inline ml-1.5 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatIDR(item.amount)}</p>
          </button>
          {/* Member chips */}
          <div className="flex gap-1 flex-wrap justify-end shrink-0">
            {members.map((m) => {
              const assigned = isAssigned(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onToggleMember(m.id)}
                  className={cn(
                    "relative h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center",
                    assigned ? "border-primary ring-2 ring-primary/30" : "border-border/50 opacity-30"
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
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ReceiptScannerSheet({ open, onOpenChange, receipt, members, onConfirm }: Props) {
  const [items, setItems] = useState<ScannedItem[]>([])
  const [taxPercent, setTaxPercent] = useState(0)
  const [servicePercent, setServicePercent] = useState(0)
  const [taxLabel, setTaxLabel] = useState("Tax")
  const [restaurantName, setRestaurantName] = useState("")
  const [assignments, setAssignments] = useState<Record<string, string[]>>({})

  // Sync from prop when receipt changes
  useEffect(() => {
    if (!receipt) return
    setItems(receipt.items)
    setTaxPercent(receipt.taxPercent)
    setServicePercent(receipt.serviceChargePercent)
    setTaxLabel(receipt.taxLabel || "Tax")
    setRestaurantName(receipt.restaurantName)
    setAssignments({})
  }, [receipt])

  function toggleMember(itemId: string, memberId: string) {
    setAssignments((prev) => {
      const current = prev[itemId] ?? members.map((m) => m.id)
      const next = current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
      return { ...prev, [itemId]: next.length > 0 ? next : members.map((m) => m.id) }
    })
  }

  function updateItem(id: string, field: "name" | "amount", value: string | number) {
    setItems((prev) => prev.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // Recalculate totals from edited items + percentages
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = Math.round(subtotal * taxPercent / 100)
  const serviceAmount = Math.round(subtotal * servicePercent / 100)
  const grandTotal = subtotal + taxAmount + serviceAmount

  const memberSplits = useMemo(() => {
    return computeItemSplits(items, assignments, members, grandTotal)
  }, [items, assignments, members, grandTotal])

  function handleConfirm() {
    if (!receipt) return
    onConfirm({
      description: restaurantName || "Restaurant",
      baseAmount: subtotal,
      taxPercent,
      serviceChargePercent: servicePercent,
      splits: memberSplits,
    })
    onOpenChange(false)
  }

  if (!receipt) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl bg-card border-border/50 h-[92vh] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            {restaurantName || "Receipt Split"}
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Tap an item to edit name/amount · Tap avatars to assign members
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          {/* ── Line items ── */}
          <div className="pb-2">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                members={members}
                isAssigned={(mid) => {
                  const a = assignments[item.id] ?? members.map((m) => m.id)
                  return a.includes(mid)
                }}
                onToggleMember={(mid) => toggleMember(item.id, mid)}
                onUpdate={(field, value) => updateItem(item.id, field, value)}
              />
            ))}
          </div>

          {/* ── Charges (editable tax/service) ── */}
          <div className="mt-2 rounded-xl bg-muted/30 border border-border/30 divide-y divide-border/30">
            <div className="flex justify-between items-center px-3 py-2 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>

            {/* Tax row — editable percent */}
            <div className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="text-muted-foreground flex-1">{taxLabel}</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                  className="h-7 w-14 text-xs text-center bg-muted/50 border-border/50 px-1"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <span className="w-20 text-right tabular-nums">{formatIDR(taxAmount)}</span>
            </div>

            {/* Service row — editable percent */}
            <div className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="text-muted-foreground flex-1">Service</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={servicePercent}
                  onChange={(e) => setServicePercent(parseFloat(e.target.value) || 0)}
                  className="h-7 w-14 text-xs text-center bg-muted/50 border-border/50 px-1"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <span className="w-20 text-right tabular-nums">{formatIDR(serviceAmount)}</span>
            </div>

            <div className="flex justify-between px-3 py-2.5 font-semibold text-sm">
              <span>Total</span>
              <span>{formatIDR(grandTotal)}</span>
            </div>
          </div>

          {/* ── Per-member summary ── */}
          {members.length > 0 && (
            <div className="mt-4 space-y-2 mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Each person pays
              </p>
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-1">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[9px] bg-muted">{m.initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm truncate">{m.name}</span>
                  <span className="text-sm font-medium tabular-nums">
                    {formatIDR(memberSplits[m.id] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="h-4" />
        </ScrollArea>

        <Separator className="shrink-0" />
        <div className="px-4 py-3 shrink-0">
          <Button className="w-full" onClick={handleConfirm}>
            Use This Split — {formatIDR(grandTotal)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
