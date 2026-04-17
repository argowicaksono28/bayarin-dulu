"use client"

import { useState } from "react"
import { useDemo } from "@/contexts/DemoContext"
import { ExpenseItem } from "@/components/groups/expenses/ExpenseItem"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Search, SlidersHorizontal, X, Plus, Package, Trash2, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import { formatIDR, formatDate } from "@/lib/formatters"
import { toast } from "sonner"
import type { Expense } from "@/types"

interface Props {
  groupId: string
  onAddExpense?: () => void
}

function DemoExpenseDetailSheet({
  expense,
  groupId,
  onClose,
}: {
  expense: Expense
  groupId: string
  onClose: () => void
}) {
  const { getBalancesByGroupId, state } = useDemo()
  const balances = getBalancesByGroupId(groupId)

  const category = CATEGORY_OPTIONS.find((c) => c.emoji === expense.category)
  const Icon = category?.icon ?? Package

  // A person is "paid/settled" if they ARE the payer, or have no outstanding balance owed to the payer
  function isPaid(userId: string): boolean {
    if (userId === expense.paidBy) return true
    return !balances.some((b) => b.fromUserId === userId && b.toUserId === expense.paidBy)
  }

  function getName(userId: string): string {
    return state.users.find((u) => u.id === userId)?.name ?? "Unknown"
  }

  const splitEntries = Object.entries(expense.splits ?? {})
  const rd = expense.receiptData

  function FlatSplitRows() {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
        {splitEntries.map(([userId, amount]) => (
          <div key={userId} className="flex items-center justify-between px-3 py-2.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-foreground">{getName(userId)}</span>
              {isPaid(userId) && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  paid
                </span>
              )}
            </div>
            <span className="text-muted-foreground tabular-nums">{formatIDR(amount as number)}</span>
          </div>
        ))}
      </div>
    )
  }

  function ReceiptPerPersonRows() {
    return (
      <Accordion type="multiple" className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden divide-y divide-border/30">
        {splitEntries.map(([userId, splitAmount]) => {
          const proportion = expense.amount > 0 ? (splitAmount as number) / expense.amount : 0
          const personalItems = (rd!.items ?? []).map((item) => {
            if (item.assignments) {
              if (item.assignments.includes(userId)) {
                return { ...item, assignedShare: Math.round(item.amount / item.assignments.length) }
              }
              return null
            }
            return { ...item, assignedShare: Math.round(item.amount * proportion) }
          }).filter((item): item is NonNullable<typeof item> => item !== null)

          const personSubtotal = personalItems.reduce((sum, item) => sum + item.assignedShare, 0)
          const personTax = expense.tax > 0 ? Math.round(personSubtotal * expense.tax / 100) : 0
          const personService = expense.serviceCharge > 0 ? Math.round(personSubtotal * expense.serviceCharge / 100) : 0

          return (
            <AccordionItem key={userId} value={userId} className="border-0">
              <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-white/5 [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                  <span className="text-sm text-foreground truncate">{getName(userId)}</span>
                  {isPaid(userId) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                      paid
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground tabular-nums mr-2">{formatIDR(splitAmount as number)}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="border-t border-border/30 divide-y divide-border/20 bg-muted/30">
                  {personalItems.map((item, i) => (
                    <div key={i} className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                      <span>
                        {item.qty > 1 && <span className="mr-1">{item.qty}×</span>}
                        {item.name}
                      </span>
                      <span className="tabular-nums">{formatIDR(item.assignedShare)}</span>
                    </div>
                  ))}
                  {personalItems.length > 0 && (
                    <div className="flex justify-between px-4 py-2 text-xs text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatIDR(personSubtotal)}</span>
                    </div>
                  )}
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
                    <span className="tabular-nums">{formatIDR(personSubtotal + personTax + personService)}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
  }

  return (
    <Sheet open onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 h-[92vh] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 shrink-0">
          <SheetTitle>Expense Details</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-4 pb-8">
            <div className="space-y-5 pb-4">
              {/* Detail card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-base truncate">{expense.description}</p>
                    {rd && (
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
                            <span className="text-foreground">
                              {item.qty > 1 && <span className="text-muted-foreground mr-1">{item.qty}×</span>}
                              {item.name}
                            </span>
                            <span className="text-muted-foreground tabular-nums">{formatIDR(item.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground bg-muted/30">
                          <span>Subtotal</span>
                          <span className="tabular-nums">{formatIDR(rd.subtotal)}</span>
                        </div>
                        {expense.tax > 0 && (
                          <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground">
                            <span>Tax ({expense.tax}%)</span>
                            <span className="tabular-nums">{formatIDR(Math.round(rd.subtotal * expense.tax / 100))}</span>
                          </div>
                        )}
                        {expense.serviceCharge > 0 && (
                          <div className="flex justify-between px-3 py-2 text-sm text-muted-foreground">
                            <span>Service ({expense.serviceCharge}%)</span>
                            <span className="tabular-nums">{formatIDR(Math.round(rd.subtotal * expense.serviceCharge / 100))}</span>
                          </div>
                        )}
                        <div className="flex justify-between px-3 py-3 text-sm font-semibold bg-muted/20">
                          <span>Total</span>
                          <span className="tabular-nums">{formatIDR(expense.amount)}</span>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="perperson" className="mt-2">
                      <ReceiptPerPersonRows />
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Flat split rows for non-receipt expenses */}
              {!rd && splitEntries.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Split Details</p>
                  <FlatSplitRows />
                </div>
              )}

              <Separator className="bg-border/40" />

              <div className="flex gap-3 pb-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-border/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
                  onClick={() => toast.info("Deleting expenses is not available in demo mode")}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export function DemoExpenseList({ groupId, onAddExpense }: Props) {
  const { getExpensesByGroupId } = useDemo()
  const expenses = getExpensesByGroupId(groupId)

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || e.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const hasFilter = !!selectedCategory
  const activeCategory = CATEGORY_OPTIONS.find((c) => c.emoji === selectedCategory)

  return (
    <div className="space-y-3 px-4">
      {/* Search + filter + add row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-9 bg-card border-border/50 text-sm h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9 border-border/50 bg-card hover:bg-muted relative",
            hasFilter && "border-primary text-primary"
          )}
          aria-label="Filter"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {hasFilter && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
        </Button>

        {onAddExpense && (
          <Button
            onClick={onAddExpense}
            className="hidden lg:flex gap-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        )}
      </div>

      {hasFilter && activeCategory && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter:</span>
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30"
          >
            <activeCategory.icon className="h-3 w-3" />
            {activeCategory.label}
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No expenses found</p>
          {onAddExpense && (
            <button onClick={onAddExpense} className="mt-3 text-sm text-primary hover:underline font-medium flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add first expense
            </button>
          )}
        </div>
      ) : (
        <Card className="border border-border/50 bg-card rounded-xl overflow-hidden">
          <div className="divide-y divide-border/40">
            {filtered.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onClick={() => setSelectedExpense(expense)}
              />
            ))}
          </div>
        </Card>
      )}

      {selectedExpense && (
        <DemoExpenseDetailSheet
          expense={selectedExpense}
          groupId={groupId}
          onClose={() => setSelectedExpense(null)}
        />
      )}

      {/* Category filter bottom sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-3 shrink-0 flex-row items-center justify-between">
            <SheetTitle>Filter by Category</SheetTitle>
            {hasFilter && (
              <button
                onClick={() => { setSelectedCategory(null); setFilterOpen(false) }}
                className="text-xs text-primary hover:underline flex items-center gap-1 mr-8"
              >
                <X className="h-3 w-3" /> Reset
              </button>
            )}
          </SheetHeader>
          <div className="px-4 pb-8">
            <div className="grid grid-cols-5 gap-3">
              {CATEGORY_OPTIONS.map(({ emoji, label, icon: Icon }) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === emoji ? null : emoji)
                    setFilterOpen(false)
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 py-3 px-1 rounded-xl border transition-colors",
                    selectedCategory === emoji
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 hover:bg-muted text-foreground"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[10px] text-muted-foreground leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
