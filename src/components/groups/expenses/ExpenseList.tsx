"use client"

import { useState, useEffect } from "react"
import { Expense } from "@/types"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import { ExpenseItem } from "./ExpenseItem"
import { ExpenseDetailSheet } from "./ExpenseDetailSheet"
import { ExpenseListSkeleton } from "./ExpenseListSkeleton"
import { EmptyExpenseState } from "./EmptyExpenseState"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, X, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Props {
  groupId: string
  onAddExpense?: () => void
}


export function ExpenseList({ groupId, onAddExpense }: Props) {
  const [expenses, setExpenses] = useState<Expense[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/groups/${groupId}/expenses`)
      .then((r) => r.json())
      .then((data) => {
        setExpenses(Array.isArray(data) ? data : [])
        setIsLoading(false)
      })
      .catch(() => {
        setExpenses([])
        setIsLoading(false)
      })
  }, [groupId])

  if (isLoading) return <ExpenseListSkeleton />

  const filtered = expenses?.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || e.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const hasFilter = !!selectedCategory

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
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 border-border/50 bg-card hover:bg-muted relative",
                hasFilter && "border-primary text-primary"
              )}
              aria-label="Filter"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {hasFilter && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-3 bg-card border-border/50 shadow-2xl"
            align="end"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Filter Category
                </p>
                {hasFilter && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {CATEGORY_OPTIONS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === emoji ? null : emoji)
                      setFilterOpen(false)
                    }}
                    title={label}
                    className={cn(
                      "flex flex-col items-center gap-0.5 p-1.5 rounded-lg border text-center transition-colors",
                      selectedCategory === emoji
                        ? "border-primary bg-primary/15"
                        : "border-border/40 hover:bg-muted"
                    )}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-[8px] text-muted-foreground truncate w-full">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

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
      {hasFilter && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter:</span>
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30"
          >
            {selectedCategory}
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
            // Refetch to get fresh data including updated paidByProfile
            setIsLoading(true)
            fetch(`/api/groups/${groupId}/expenses`)
              .then((r) => r.json())
              .then((data) => { setExpenses(Array.isArray(data) ? data : []); setIsLoading(false) })
              .catch(() => setIsLoading(false))
          }}
          onDeleted={(id) => {
            setExpenses((prev) => prev?.filter((e) => e.id !== id) ?? null)
          }}
        />
      )}
    </div>
  )
}
