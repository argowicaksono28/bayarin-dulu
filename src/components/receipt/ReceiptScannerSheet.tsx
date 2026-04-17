"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
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
import { Store, Check, Pencil, X, ChevronDown } from "lucide-react"
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
  receiptData: {
    restaurantName: string
    items: { name: string; qty: number; amount: number }[]
    subtotal: number
  }
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: ScannedReceipt | null
  members: User[]
  onConfirm: (result: ReceiptConfirmResult) => void
}

// ─── Split helper ─────────────────────────────────────────────────────────────

function computeSplits(
  items: ScannedItem[],
  assignments: Record<string, string[]>,
  members: User[],
  grandTotal: number,
): { exact: Record<string, number>; shares: Record<string, number> } {
  if (members.length === 0 || grandTotal <= 0) return { exact: {}, shares: {} }

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
  let distributed = 0

  for (let i = 0; i < ids.length - 1; i++) {
    const proportion = itemsSubtotal > 0 ? memberItemTotals[ids[i]] / itemsSubtotal : 1 / ids.length
    const rounded = Math.round(proportion * grandTotal)
    result[ids[i]] = rounded
    distributed += rounded
  }
  result[ids[ids.length - 1]] = Math.max(0, grandTotal - distributed)
  return { exact: result, shares: memberItemTotals }
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  members,
  getAssigned,
  onToggleMember,
  onUpdate,
}: {
  item: ScannedItem
  members: User[]
  getAssigned: () => string[]
  onToggleMember: (memberId: string) => void
  onUpdate: (updates: Partial<Pick<ScannedItem, "name" | "amount">>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [draftAmount, setDraftAmount] = useState("")

  function openEdit() {
    setDraftName(item.name)
    setDraftAmount(String(item.amount))
    setEditing(true)
  }

  function commitEdit() {
    const newName = draftName.trim() || item.name
    const newAmount = parseFloat(draftAmount)
    onUpdate({
      name: newName,
      amount: isNaN(newAmount) || newAmount <= 0 ? item.amount : newAmount,
    })
    setEditing(false)
  }

  function cancelEdit() {
    setEditing(false)
  }

  const [pickerOpen, setPickerOpen] = useState(false)
  const assigned = getAssigned()
  const assignedMembers = members.filter((m) => assigned.includes(m.id))
  const allAssigned = assigned.length === members.length

  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      {editing ? (
        <div className="space-y-2">
          <Input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            className="h-8 text-sm bg-muted/50"
            placeholder="Item name"
            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit() }}
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
              <Input
                type="number"
                value={draftAmount}
                onChange={(e) => setDraftAmount(e.target.value)}
                className="h-8 pl-7 text-sm bg-muted/50"
                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") cancelEdit() }}
              />
            </div>
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
            <Button size="sm" className="h-8" onClick={commitEdit}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {/* Name + amount (tap to edit) */}
          <button
            type="button"
            onClick={openEdit}
            className="flex-1 min-w-0 text-left group flex items-start gap-2"
          >
            <Pencil className="h-3 w-3 mt-1 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                {item.qty > 1 && <span className="text-muted-foreground mr-1">{item.qty}×</span>}
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatIDR(item.amount)}</p>
            </div>
          </button>

          {/* Assignment pill — tap to open member picker */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            {allAssigned ? (
              <span className="text-xs text-primary font-medium px-0.5">All</span>
            ) : (
              <>
                <div className="flex -space-x-1.5">
                  {assignedMembers.slice(0, 3).map((m) => (
                    <Avatar key={m.id} className="h-5 w-5 border border-card">
                      <AvatarFallback className="text-[8px] bg-muted">{m.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {assigned.length > 3 ? `+${assigned.length - 3}` : `${assigned.length} of ${members.length}`}
                </span>
              </>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Per-item member picker sheet */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 p-0 flex flex-col max-h-[70vh]">
          <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
            <SheetTitle className="text-sm font-semibold">Who had "{item.name}"?</SheetTitle>
            <div className="flex gap-2 mt-1">
              <Button
                variant="outline" size="sm" className="h-7 text-xs"
                onClick={() => members.forEach((m) => { if (!assigned.includes(m.id)) onToggleMember(m.id) })}
              >
                Select All
              </Button>
              <Button
                variant="outline" size="sm" className="h-7 text-xs"
                onClick={() => [...assigned].forEach((id) => onToggleMember(id))}
              >
                Clear
              </Button>
            </div>
          </SheetHeader>
          <ScrollArea className="flex-1 px-4 pb-6">
            {members.map((m) => {
              const isOn = assigned.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onToggleMember(m.id)}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-muted">{m.initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm text-left">{m.name}</span>
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    isOn ? "bg-primary border-primary" : "border-border/50"
                  )}>
                    {isOn && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </button>
              )
            })}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReceiptScannerSheet({ open, onOpenChange, receipt, members, onConfirm }: Props) {
  // Editable local copy of receipt data
  const [items, setItems] = useState<ScannedItem[]>([])
  const [taxLabel, setTaxLabel] = useState("Tax")
  const [restaurantName, setRestaurantName] = useState("")
  // Store actual amounts (not just %) as the source of truth
  const [taxAmount, setTaxAmount] = useState(0)
  const [serviceAmount, setServiceAmount] = useState(0)
  const [assignments, setAssignments] = useState<Record<string, string[]>>({})

  // Reset all local state when a new receipt is loaded
  useEffect(() => {
    if (!receipt) return
    setItems(receipt.items.map((i) => ({ ...i })))
    setTaxLabel(receipt.taxLabel || "PB1")
    setRestaurantName(receipt.restaurantName || "")
    // Use actual scanned amounts — preserves receipt.total exactly
    setTaxAmount(receipt.tax)
    setServiceAmount(receipt.serviceCharge)
    setAssignments({})
  }, [receipt])

  const toggleMember = useCallback((itemId: string, memberId: string) => {
    setAssignments((prev) => {
      const current = prev[itemId] ?? members.map((m) => m.id)
      const next = current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
      return { ...prev, [itemId]: next.length > 0 ? next : members.map((m) => m.id) }
    })
  }, [members])

  const updateItem = useCallback((id: string, updates: Partial<Pick<ScannedItem, "name" | "amount">>) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...updates } : item))
  }, [])

  // Recompute totals live from edited items + actual tax/service amounts
  const itemsSubtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const grandTotal = itemsSubtotal + taxAmount + serviceAmount

  // Derived % labels for display only
  const taxPercent = itemsSubtotal > 0 ? Math.round((taxAmount / itemsSubtotal) * 100 * 10) / 10 : 0
  const servicePercent = itemsSubtotal > 0 ? Math.round((serviceAmount / itemsSubtotal) * 100 * 10) / 10 : 0

  const { exact: memberExactSplits, shares: memberItemTotals } = useMemo(
    () => computeSplits(items, assignments, members, grandTotal),
    [items, assignments, members, grandTotal],
  )

  function handleConfirm() {
    onConfirm({
      description: restaurantName || "Restaurant",
      baseAmount: itemsSubtotal,
      taxPercent: taxPercent,
      serviceChargePercent: servicePercent,
      splits: memberItemTotals,
      receiptData: {
        restaurantName,
        items: items.map(({ id, name, qty, amount }) => ({ 
          name, 
          qty, 
          amount,
          assignments: assignments[id] ?? members.map(m => m.id)
        })),
        subtotal: itemsSubtotal,
      },
    })
    onOpenChange(false)
  }

  // Don't render at all if no receipt — but keep hooks above this guard
  if (!receipt) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl bg-card border-border/50 h-[92vh] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-1 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{restaurantName || "Receipt Split"}</span>
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            ✏️ Tap item to edit · 👤 Tap avatar to assign · Edit tax/service below
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          {/* Items */}
          <div className="pb-1">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                members={members}
                getAssigned={() => assignments[item.id] ?? members.map((m) => m.id)}
                onToggleMember={(mid) => toggleMember(item.id, mid)}
                onUpdate={(updates) => updateItem(item.id, updates)}
              />
            ))}
          </div>

          {/* Totals */}
          <div className="mt-3 rounded-xl bg-muted/30 border border-border/30 divide-y divide-border/30">
            <div className="flex justify-between items-center px-3 py-2 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatIDR(itemsSubtotal)}</span>
            </div>

            {/* Tax — edit actual amount, percent shown for reference */}
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
              <span className="text-muted-foreground flex-1">
                {taxLabel}
                {taxPercent > 0 && <span className="ml-1 text-xs opacity-60">({taxPercent}%)</span>}
              </span>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                <Input
                  type="number"
                  min={0}
                  value={taxAmount || ""}
                  placeholder="0"
                  onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                  className="h-7 pl-7 text-xs text-right tabular-nums bg-muted/50 border-border/50"
                />
              </div>
            </div>

            {/* Service — edit actual amount */}
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm">
              <span className="text-muted-foreground flex-1">
                Service
                {servicePercent > 0 && <span className="ml-1 text-xs opacity-60">({servicePercent}%)</span>}
              </span>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                <Input
                  type="number"
                  min={0}
                  value={serviceAmount || ""}
                  placeholder="0"
                  onChange={(e) => setServiceAmount(parseFloat(e.target.value) || 0)}
                  className="h-7 pl-7 text-xs text-right tabular-nums bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="flex justify-between px-3 py-2.5 font-semibold text-sm">
              <span>Total</span>
              <span className="tabular-nums">{formatIDR(grandTotal)}</span>
            </div>
          </div>

          {/* Per-member breakdown */}
          {members.length > 0 && (
            <div className="mt-4 mb-2 space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                Each person pays
              </p>
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-1.5">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[9px] bg-muted">{m.initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm truncate">{m.name}</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatIDR(memberExactSplits[m.id] ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="h-4" />
        </ScrollArea>

        <Separator className="shrink-0" />
        <div className="px-4 py-3 shrink-0">
          <Button className="w-full font-semibold" onClick={handleConfirm}>
            Use This Split — {formatIDR(grandTotal)}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
