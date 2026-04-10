"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { formatIDR, formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import type { Expense } from "@/types"
import { Trash2, Loader2, Pencil, ChevronLeft } from "lucide-react"
import { AddExpenseForm } from "@/components/add-expense/AddExpenseForm"

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

        <ScrollArea className="flex-1 px-4 pb-8">
          {mode === "view" ? (
            <div className="space-y-5 pb-4">
              {/* Detail card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
                  {expense.category}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">{expense.description}</p>
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
