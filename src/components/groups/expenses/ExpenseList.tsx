"use client"

import { useState, useEffect, useRef } from "react"
import { Expense } from "@/types"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"
import { ExpenseItem } from "./ExpenseItem"
import { ExpenseDetailSheet } from "./ExpenseDetailSheet"
import { ExpenseListSkeleton } from "./ExpenseListSkeleton"
import { EmptyExpenseState } from "./EmptyExpenseState"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Search, SlidersHorizontal, X, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Props {
  groupId: string
  onAddExpense?: () => void
  onExpenseChanged?: () => void
}

export function ExpenseList({ groupId, onAddExpense, onExpenseChanged }: Props) {
  const [expenses, setExpenses] = useState<Expense[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null)

  function fetchExpenses() {
    setFetchError(null)
    fetch(`/api/groups/${groupId}/expenses`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          setFetchError(data.error ?? "Failed to load expenses")
          setExpenses([])
        } else {
          setExpenses(Array.isArray(data) ? data : [])
        }
        setIsLoading(false)
      })
      .catch(() => {
        setFetchError("Network error — could not load expenses")
        setExpenses([])
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setIsLoading(true)
    fetchExpenses()

    const supabase = createClient()

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`expenses:group:${groupId}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `group_id=eq.${groupId}`,
        },
        () => { fetchExpenses() }
      )
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[realtime] expenses channel error — falling back to manual refresh")
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  if (isLoading) return <ExpenseListSkeleton />

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <p className="text-sm text-destructive font-medium">{fetchError}</p>
        <p className="text-xs text-muted-foreground mt-1">Check your connection and try again</p>
        <button
          onClick={fetchExpenses}
          className="mt-3 text-sm text-primary hover:underline font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  const filtered = expenses?.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || e.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const hasFilter = !!selectedCategory
  const activeCategory = CATEGORY_OPTIONS.find(c => c.emoji === selectedCategory)

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

        {/* Filter button — opens bottom sheet */}
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
          {hasFilter && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>

        {/* Desktop-only Add Expense button */}
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

      {/* Active filter badge */}
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

      {/* Expense list */}
      {!filtered || filtered.length === 0 ? (
        <EmptyExpenseState onAdd={onAddExpense} />
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

      {/* Expense detail / edit / delete sheet */}
      {selectedExpense && (
        <ExpenseDetailSheet
          expense={selectedExpense}
          groupId={groupId}
          open={!!selectedExpense}
          onOpenChange={(open) => { if (!open) setSelectedExpense(null) }}
          onUpdated={() => {
            setSelectedExpense(null)
            fetchExpenses()
            onExpenseChanged?.()
          }}
          onDeleted={(id) => {
            setExpenses((prev) => prev?.filter((e) => e.id !== id) ?? null)
            onExpenseChanged?.()
          }}
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
