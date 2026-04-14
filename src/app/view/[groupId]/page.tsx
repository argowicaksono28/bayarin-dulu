"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { formatIDR, formatDate } from "@/lib/formatters"
import { CATEGORY_OPTIONS, GROUP_ICON_OPTIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ReceiptData } from "@/types"
import {
  Package, Users, ScanLine, ChevronRight, X,
  Loader2, XCircle, ArrowRight, Clock,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

interface PublicMember { id: string; name: string }

interface PublicExpense {
  id: string
  description: string
  amount: number
  baseAmount?: number
  tax: number
  serviceCharge: number
  paidBy: string
  paidByProfile?: { name: string } | null
  splitType: string
  splits: Record<string, number>
  category: string
  notes?: string
  receiptData?: ReceiptData | null
  createdAt: string
}

interface GroupInfo {
  id: string
  name: string
  emoji: string
  coverColor: string
}

interface Settlement {
  fromUserId: string
  toUserId: string
  amount: number
}

interface Activity {
  id: string
  type: string
  description: string
  amount?: number
  actorId: string
  createdAt: string
}

interface ComputedBalance {
  fromId: string
  toId: string
  from: string
  to: string
  amount: number
}

function computePublicBalances(
  expenses: PublicExpense[],
  settlements: Settlement[],
  members: PublicMember[],
): ComputedBalance[] {
  const netMap = new Map<string, number>()
  const addToMap = (from: string, to: string, amount: number) => {
    if (from === to) return
    const [a, b, sign] = from < to ? [from, to, 1] : [to, from, -1]
    const key = `${a}|${b}`
    netMap.set(key, (netMap.get(key) ?? 0) + sign * amount)
  }
  for (const exp of expenses) {
    for (const [uid, amt] of Object.entries(exp.splits ?? {})) {
      if (uid !== exp.paidBy) addToMap(uid, exp.paidBy, Number(amt))
    }
  }
  for (const s of settlements) {
    addToMap(s.fromUserId, s.toUserId, -s.amount)
  }
  const nameMap = Object.fromEntries(members.map((m) => [m.id, m.name]))
  return Array.from(netMap.entries())
    .filter(([, v]) => Math.abs(v) > 0.5)
    .map(([key, v]) => {
      const [a, b] = key.split("|")
      const from = v > 0 ? a : b
      const to = v > 0 ? b : a
      return {
        fromId: from,
        toId: to,
        from: nameMap[from] ?? "Unknown",
        to: nameMap[to] ?? "Unknown",
        amount: Math.abs(Math.round(v)),
      }
    })
}

export default function PublicViewPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [group, setGroup] = useState<GroupInfo | null>(null)
  const [expenses, setExpenses] = useState<PublicExpense[]>([])
  const [members, setMembers] = useState<PublicMember[]>([])
  const [nameMap, setNameMap] = useState<Record<string, string>>({})
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [selected, setSelected] = useState<PublicExpense | null>(null)

  useEffect(() => {
    if (!token) { setError("Missing access token"); setLoading(false); return }
    fetch(`/api/public/groups/${groupId}?token=${token}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) { setError(data.error ?? "Access denied"); return }
        setGroup(data.group)
        setExpenses(Array.isArray(data.expenses) ? data.expenses : [])
        const mems: PublicMember[] = Array.isArray(data.members) ? data.members : []
        setMembers(mems)
        setNameMap(Object.fromEntries(mems.map((m: PublicMember) => [m.id, m.name])))
        setSettlements(Array.isArray(data.settlements) ? data.settlements : [])
        setActivities(Array.isArray(data.activities) ? data.activities : [])
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false))
  }, [groupId, token])

  const computedBalances = useMemo(
    () => computePublicBalances(expenses, settlements, members),
    [expenses, settlements, members],
  )

  function isPaid(userId: string, paidBy: string): boolean {
    if (userId === paidBy) return true
    return !computedBalances.some((b) => b.fromId === userId && b.toId === paidBy)
  }

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

      {/* Tabs */}
      <Tabs defaultValue="expenses">
        <TabsList className="w-full h-10 bg-card border border-border/50 rounded-lg p-1 grid grid-cols-3">
          <TabsTrigger value="expenses" className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="balances" className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all">
            Balances
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all">
            Activity
          </TabsTrigger>
        </TabsList>

        {/* ── Expenses tab ── */}
        <TabsContent value="expenses" className="mt-4">
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
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        {expense.receiptData && <ScanLine className="h-3 w-3 text-primary shrink-0" />}
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
        </TabsContent>

        {/* ── Balances tab ── */}
        <TabsContent value="balances" className="mt-4">
          {computedBalances.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">All settled up!</div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/40">
              {computedBalances.map((b, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{b.from}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{b.to}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-primary shrink-0">{formatIDR(b.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Activity tab ── */}
        <TabsContent value="activity" className="mt-4">
          {activities.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">No activity yet</div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden divide-y divide-border/40">
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{nameMap[a.actorId] ?? "Someone"}</span>
                      {" "}{a.description}
                      {a.amount && a.amount > 0 && (
                        <span className="text-primary font-medium"> · {formatIDR(a.amount)}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground pt-2">
        🔒 View-only access · Powered by Bayarin Dulu
      </p>

      {/* Expense detail drawer — plain CSS, no Radix portal */}
      {selected && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/80 animate-in fade-in-0 duration-300"
            onClick={() => setSelected(null)}
          />
          {/* Drawer */}
          <div className="absolute inset-x-0 bottom-0 h-[85vh] rounded-t-2xl bg-card border-t border-border/50 flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 shrink-0 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Expense Details</h2>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-5">
              {(() => {
                const cat = CATEGORY_OPTIONS.find((c) => c.emoji === selected.category)
                const Icon = cat?.icon ?? Package
                const splitEntries = Object.entries(selected.splits ?? {})
                const rd = selected.receiptData

                return (
                  <>
                    {/* Detail card */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-base truncate">{selected.description}</p>
                          {rd && (
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
                    {rd && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <ScanLine className="h-4 w-4 text-muted-foreground" />
                          Receipt Breakdown
                          {rd.restaurantName && (
                            <span className="text-xs text-muted-foreground font-normal">— {rd.restaurantName}</span>
                          )}
                        </p>
                        <Tabs defaultValue="overall">
                          <TabsList className="w-full">
                            <TabsTrigger value="overall" className="flex-1">Overall</TabsTrigger>
                            <TabsTrigger value="perperson" className="flex-1">Per Person</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overall" className="mt-2">
                            <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
                              {rd.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2.5 text-sm">
                                  <span>{item.qty > 1 && <span className="text-muted-foreground mr-1">{item.qty}×</span>}{item.name}</span>
                                  <span className="text-muted-foreground tabular-nums">{formatIDR(item.amount)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground bg-muted/30">
                                <span>Subtotal</span><span className="tabular-nums">{formatIDR(rd.subtotal)}</span>
                              </div>
                              {selected.tax > 0 && (
                                <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground">
                                  <span>Tax ({selected.tax}%)</span>
                                  <span className="tabular-nums">{formatIDR(Math.round(rd.subtotal * selected.tax / 100))}</span>
                                </div>
                              )}
                              {selected.serviceCharge > 0 && (
                                <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground">
                                  <span>Service ({selected.serviceCharge}%)</span>
                                  <span className="tabular-nums">{formatIDR(Math.round(rd.subtotal * selected.serviceCharge / 100))}</span>
                                </div>
                              )}
                              <div className="flex justify-between px-3 py-3 text-sm font-semibold bg-muted/20">
                                <span>Total</span><span className="tabular-nums">{formatIDR(selected.amount)}</span>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="perperson" className="mt-2">
                            <Accordion type="multiple" className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
                              {splitEntries.map(([userId, amount]) => {
                                const proportion = selected.amount > 0 ? amount / selected.amount : 0
                                const personalItems = (rd.items || []).map(item => {
                                  if (item.assignments) {
                                    if (item.assignments.includes(userId)) {
                                      return { ...item, assignedShare: Math.round(item.amount / item.assignments.length) }
                                    }
                                    return null
                                  }
                                  return { ...item, assignedShare: Math.round(item.amount * proportion) }
                                }).filter((item): item is NonNullable<typeof item> => item !== null)
                                const personSubtotal = personalItems.reduce((sum, item) => sum + item.assignedShare, 0)
                                const personTax = selected.tax > 0 ? Math.round(personSubtotal * selected.tax / 100) : 0
                                const personService = selected.serviceCharge > 0 ? Math.round(personSubtotal * selected.serviceCharge / 100) : 0
                                return (
                                  <AccordionItem key={userId} value={userId} className="border-0">
                                    <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-white/5">
                                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                                        <span className="text-sm text-foreground truncate">{nameMap[userId] ?? "Unknown"}</span>
                                        {isPaid(userId, selected.paidBy) && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">paid</span>
                                        )}
                                      </div>
                                      <span className="text-sm text-muted-foreground tabular-nums mr-2">{formatIDR(amount)}</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-0">
                                      <div className="border-t border-border/30 divide-y divide-border/20 bg-muted/30">
                                        {personalItems.map((item, i) => (
                                          <div key={i} className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                                            <span>{item.qty > 1 && <span className="mr-1">{item.qty}×</span>}{item.name}</span>
                                            <span className="tabular-nums">{formatIDR(item.assignedShare)}</span>
                                          </div>
                                        ))}
                                        {personalItems.length > 0 && (
                                          <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                                            <span>Subtotal</span><span className="tabular-nums">{formatIDR(personSubtotal)}</span>
                                          </div>
                                        )}
                                        {selected.tax > 0 && (
                                          <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                                            <span>Tax ({selected.tax}%)</span><span className="tabular-nums">{formatIDR(personTax)}</span>
                                          </div>
                                        )}
                                        {selected.serviceCharge > 0 && (
                                          <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                                            <span>Service ({selected.serviceCharge}%)</span><span className="tabular-nums">{formatIDR(personService)}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between px-4 py-2.5 text-xs font-semibold">
                                          <span>Total</span><span className="tabular-nums">{formatIDR(amount)}</span>
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                )
                              })}
                            </Accordion>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}

                    {/* Split details for non-receipt expenses */}
                    {!rd && splitEntries.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Split Details</p>
                        <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
                          {splitEntries.map(([userId, amount]) => (
                            <div key={userId} className="flex items-center justify-between px-3 py-2.5 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-foreground">{nameMap[userId] ?? "Unknown"}</span>
                                {isPaid(userId, selected.paidBy) && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">paid</span>
                                )}
                              </div>
                              <span className="text-muted-foreground tabular-nums">{formatIDR(amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
