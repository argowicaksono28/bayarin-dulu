"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { formatIDR, formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { Expense } from "@/types"
import { Trash2, Loader2, Pencil, ChevronLeft, Package, ScanLine } from "lucide-react"
import { AddExpenseForm } from "@/components/add-expense/AddExpenseForm"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Balance {
  fromUserId: string
  toUserId: string
  amount: number
}

interface Props {
  expense: Expense
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
  onDeleted: (expenseId: string) => void
}

export function ExpenseDetailSheet({
  expense,
  groupId,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: Props) {
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [memberNames, setMemberNames] = useState<Record<string, string>>({})
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [balances, setBalances] = useState<Balance[]>([])

  useEffect(() => {
    if (!open) return
    setLoadingMembers(true)
    Promise.all([
      fetch(`/api/groups/${groupId}/members`).then(r => r.json()),
      fetch(`/api/groups/${groupId}/guests`).then(r => r.json()),
      fetch(`/api/groups/${groupId}/balances`).then(r => r.json()),
    ]).then(([members, guests, bals]) => {
      const map: Record<string, string> = {}
      for (const m of (members ?? [])) map[m.id] = m.name
      for (const g of (guests ?? [])) map[g.id] = g.name
      setMemberNames(map)
      setBalances(Array.isArray(bals) ? bals : [])
    }).finally(() => setLoadingMembers(false))
  }, [open, groupId])

  // A person is "paid/settled" if they ARE the payer, or have no outstanding debt to the payer
  function isPaid(userId: string): boolean {
    if (userId === expense.paidBy) return true
    return !balances.some(b => b.fromUserId === userId && b.toUserId === expense.paidBy)
  }

  const category = CATEGORY_OPTIONS.find((c) => c.emoji === expense.category)
  const Icon = category?.icon ?? Package

  function handleClose() {
    setMode("view")
    setConfirmDelete(false)
    onOpenChange(false)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    const res = await fetch(`/api/groups/${groupId}/expenses/${expense.id}`, {
      method: "DELETE",
    })
    setDeleting(false)
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? "Failed to delete expense")
      return
    }
    toast.success("Expense deleted")
    handleClose()
    onDeleted(expense.id)
  }

  const splitEntries = Object.entries(expense.splits ?? {})

  // Per-person receipt accordion rows
  function ReceiptPerPersonRows() {
    const rd = expense.receiptData!
    return (
      <Accordion type="multiple" className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
        {splitEntries.map(([userId, amount]) => {
          const proportion = expense.amount > 0 ? amount / expense.amount : 0
          const personSubtotal = Math.round(rd.subtotal * proportion)
          const personTax = expense.tax > 0 ? Math.round(rd.subtotal * proportion * expense.tax / 100) : 0
          const personService = expense.serviceCharge > 0 ? Math.round(rd.subtotal * proportion * expense.serviceCharge / 100) : 0

          return (
            <AccordionItem key={userId} value={userId} className="border-0">
              <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                  {loadingMembers ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <span className="text-sm text-foreground truncate">
                      {memberNames[userId] ?? "Unknown"}
                    </span>
                  )}
                  {isPaid(userId) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                      paid
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground tabular-nums mr-2">{formatIDR(amount)}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="border-t border-border/30 divide-y divide-border/20 bg-muted/30">
                  {rd.items.map((item, i) => (
                    <div key={i} className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                      <span>
                        {item.qty > 1 && <span className="mr-1">{item.qty}×</span>}
                        {item.name}
                      </span>
                      <span className="tabular-nums">{formatIDR(Math.round(item.amount * proportion))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatIDR(personSubtotal)}</span>
                  </div>
                  {expense.tax > 0 && (
                    <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                      <span>Tax ({expense.tax}%)</span>
                      <span className="tabular-nums">{formatIDR(personTax)}</span>
                    </div>
                  )}
                  {expense.serviceCharge > 0 && (
                    <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                      <span>Service ({expense.serviceCharge}%)</span>
                      <span className="tabular-nums">{formatIDR(personService)}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-2.5 text-xs font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatIDR(amount)}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
  }

  // Flat split rows for non-receipt expenses
  function FlatSplitRows() {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
        {splitEntries.map(([userId, amount]) => (
          <div key={userId} className="flex items-center justify-between px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2">
              {loadingMembers ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="text-foreground">{memberNames[userId] ?? "Unknown"}</span>
              )}
              {!loadingMembers && isPaid(userId) && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  paid
                </span>
              )}
            </div>
            <span className="text-muted-foreground tabular-nums">{formatIDR(amount)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 h-[92vh] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            {mode === "edit" && (
              <button
                onClick={() => setMode("view")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <SheetTitle>{mode === "edit" ? "Edit Expense" : "Expense Details"}</SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-4 pb-8">
            {mode === "view" ? (
              <div className="space-y-5 pb-4">
                {/* Detail card */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-base truncate">{expense.description}</p>
                      {expense.receiptData && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                          <ScanLine className="h-2.5 w-2.5" />
                          Receipt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Paid by {expense.paidByProfile?.name ?? "Unknown"} · {formatDate(expense.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      Split: {expense.splitType}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-foreground">{formatIDR(expense.amount)}</p>
                  </div>
                </div>

                {expense.notes && (
                  <p className="text-sm text-muted-foreground px-1">📝 {expense.notes}</p>
                )}

                {/* Receipt breakdown with Overall / Per Person tabs */}
                {expense.receiptData && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <ScanLine className="h-4 w-4 text-muted-foreground" />
                      Receipt Breakdown
                      {expense.receiptData.restaurantName && (
                        <span className="text-xs text-muted-foreground font-normal">
                          — {expense.receiptData.restaurantName}
                        </span>
                      )}
                    </p>
                    <Tabs defaultValue="overall">
                      <TabsList className="w-full">
                        <TabsTrigger value="overall" className="flex-1">Overall</TabsTrigger>
                        <TabsTrigger value="perperson" className="flex-1">Per Person</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overall" className="mt-2">
                        <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
                          {expense.receiptData.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2.5 text-sm">
                              <span className="text-foreground">
                                {item.qty > 1 && <span className="text-muted-foreground mr-1">{item.qty}×</span>}
                                {item.name}
                              </span>
                              <span className="text-muted-foreground tabular-nums">{formatIDR(item.amount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground bg-muted/30">
                            <span>Subtotal</span>
                            <span className="tabular-nums">{formatIDR(expense.receiptData.subtotal)}</span>
                          </div>
                          {expense.tax > 0 && (
                            <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground">
                              <span>Tax ({expense.tax}%)</span>
                              <span className="tabular-nums">
                                {formatIDR(Math.round(expense.receiptData.subtotal * expense.tax / 100))}
                              </span>
                            </div>
                          )}
                          {expense.serviceCharge > 0 && (
                            <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground">
                              <span>Service ({expense.serviceCharge}%)</span>
                              <span className="tabular-nums">
                                {formatIDR(Math.round(expense.receiptData.subtotal * expense.serviceCharge / 100))}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between px-3 py-3 text-sm font-semibold bg-muted/20">
                            <span>Total</span>
                            <span className="tabular-nums">{formatIDR(expense.amount)}</span>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="perperson" className="mt-2">
                        {loadingMembers ? (
                          <div className="space-y-2">
                            {[...Array(splitEntries.length || 3)].map((_, i) => (
                              <Skeleton key={i} className="h-10 w-full rounded-xl" />
                            ))}
                          </div>
                        ) : (
                          <ReceiptPerPersonRows />
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Per-person split for non-receipt expenses */}
                {!expense.receiptData && splitEntries.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Split Details</p>
                    <FlatSplitRows />
                  </div>
                )}

                <Separator className="bg-border/40" />

                <div className="flex gap-3 pb-4">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-border/50"
                    onClick={() => { setMode("edit"); setConfirmDelete(false) }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 gap-2 border-border/50 transition-colors",
                      confirmDelete
                        ? "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
                        : "text-destructive hover:bg-destructive/10 hover:border-destructive"
                    )}
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {confirmDelete ? "Tap again to confirm" : "Delete"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pb-4">
                <AddExpenseForm
                  groupId={groupId}
                  initialValues={{
                    expenseId: expense.id,
                    description: expense.description,
                    amount: expense.baseAmount ?? expense.amount,
                    tax: expense.tax ?? 0,
                    serviceCharge: expense.serviceCharge ?? 0,
                    paidBy: expense.paidBy,
                    splitType: expense.splitType,
                    splits: expense.splits ?? {},
                    category: expense.category,
                    notes: expense.notes,
                  }}
                  onSuccess={() => {
                    setMode("view")
                    onUpdated()
                  }}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
