"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { formatIDR, formatDate } from "@/lib/formatters"
import { CATEGORY_OPTIONS, GROUP_ICON_OPTIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Expense, ReceiptData } from "@/types"
import {
  Package, Users, ScanLine, ChevronRight, X,
  Loader2, XCircle,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface PublicExpense extends Omit<Expense, "splits" | "createdBy" | "groupId"> {
  receiptData?: ReceiptData | null
}

interface GroupInfo {
  id: string
  name: string
  emoji: string
  coverColor: string
}

export default function PublicViewPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [group, setGroup] = useState<GroupInfo | null>(null)
  const [expenses, setExpenses] = useState<PublicExpense[]>([])
  const [selected, setSelected] = useState<PublicExpense | null>(null)

  useEffect(() => {
    if (!token) { setError("Missing access token"); setLoading(false); return }
    fetch(`/api/public/groups/${groupId}?token=${token}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) { setError(data.error ?? "Access denied"); return }
        setGroup(data.group)
        setExpenses(Array.isArray(data.expenses) ? data.expenses : [])
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false))
  }, [groupId, token])

  const groupIcon = GROUP_ICON_OPTIONS.find((o) => o.key === group?.emoji)
  const GroupIcon = groupIcon?.icon ?? Users

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="font-semibold text-lg">Access Denied</p>
        <p className="text-sm text-muted-foreground">{error ?? "This link is invalid or has expired."}</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", group.coverColor || "bg-violet-500")}>
          <GroupIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{group.name}</h1>
          <p className="text-sm text-muted-foreground">{expenses.length} expense{expenses.length !== 1 ? "s" : ""} · View only</p>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No expenses yet</div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/40">
          {expenses.map((expense) => {
            const cat = CATEGORY_OPTIONS.find((c) => c.emoji === expense.category)
            const Icon = cat?.icon ?? Package
            return (
              <button
                key={expense.id}
                onClick={() => setSelected(expense)}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{expense.description}</p>
                    {expense.receiptData && (
                      <ScanLine className="h-3 w-3 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {expense.paidByProfile?.name ?? "Unknown"} · {formatDate(expense.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-semibold">{formatIDR(expense.amount)}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pt-2">
        🔒 View-only access · Powered by Bayarin Dulu
      </p>

      {/* Expense detail sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 h-[85vh] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-3 shrink-0 flex-row items-center justify-between">
            <SheetTitle>Expense Details</SheetTitle>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 pb-8 space-y-5">
              {selected && (() => {
                const cat = CATEGORY_OPTIONS.find((c) => c.emoji === selected.category)
                const Icon = cat?.icon ?? Package
                return (
                  <>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-base truncate">{selected.description}</p>
                          {selected.receiptData && (
                            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                              <ScanLine className="h-2.5 w-2.5" /> Receipt
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Paid by {selected.paidByProfile?.name ?? "Unknown"} · {formatDate(selected.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">Split: {selected.splitType}</p>
                      </div>
                      <p className="text-lg font-bold shrink-0">{formatIDR(selected.amount)}</p>
                    </div>

                    {selected.notes && (
                      <p className="text-sm text-muted-foreground px-1">📝 {selected.notes}</p>
                    )}

                    {/* Receipt breakdown */}
                    {selected.receiptData && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <ScanLine className="h-4 w-4 text-muted-foreground" />
                          Receipt Breakdown
                          {selected.receiptData.restaurantName && (
                            <span className="text-xs text-muted-foreground font-normal">— {selected.receiptData.restaurantName}</span>
                          )}
                        </p>
                        <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
                          {selected.receiptData.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2.5 text-sm">
                              <span>
                                {item.qty > 1 && <span className="text-muted-foreground mr-1">{item.qty}×</span>}
                                {item.name}
                              </span>
                              <span className="text-muted-foreground tabular-nums">{formatIDR(item.amount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground bg-muted/30">
                            <span>Subtotal</span>
                            <span className="tabular-nums">{formatIDR(selected.receiptData.subtotal)}</span>
                          </div>
                          {selected.tax > 0 && (
                            <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground">
                              <span>Tax ({selected.tax}%)</span>
                              <span className="tabular-nums">{formatIDR(Math.round(selected.receiptData.subtotal * selected.tax / 100))}</span>
                            </div>
                          )}
                          {selected.serviceCharge > 0 && (
                            <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground">
                              <span>Service ({selected.serviceCharge}%)</span>
                              <span className="tabular-nums">{formatIDR(Math.round(selected.receiptData.subtotal * selected.serviceCharge / 100))}</span>
                            </div>
                          )}
                          <div className="flex justify-between px-3 py-3 text-sm font-semibold bg-muted/20">
                            <span>Total</span>
                            <span className="tabular-nums">{formatIDR(selected.amount)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
