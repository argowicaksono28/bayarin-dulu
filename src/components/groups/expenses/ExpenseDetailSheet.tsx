"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { formatIDR, formatDate } from "@/lib/formatters"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Expense } from "@/types"
import { Trash2, Loader2, Pencil } from "lucide-react"

interface Props {
  expense: Expense
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (expense: Expense) => void
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
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState(expense.description)
  const [category, setCategory] = useState(expense.category)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleClose() {
    setEditing(false)
    setConfirmDelete(false)
    onOpenChange(false)
  }

  async function handleSave() {
    if (!description.trim()) return
    setSaving(true)
    const res = await fetch(`/api/groups/${groupId}/expenses/${expense.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description.trim(), category }),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? "Failed to update expense")
      return
    }
    toast.success("Expense updated")
    setEditing(false)
    onUpdated({ ...expense, description: description.trim(), category })
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
      <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle>Expense Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {!editing ? (
            /* View mode */
            <>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
                  {expense.category}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Paid by {expense.paidByProfile?.name ?? "Unknown"} · {formatDate(expense.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-foreground">{formatIDR(expense.amount)}</p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/15 text-primary">
                    {expense.splitType}
                  </span>
                </div>
              </div>

              {expense.notes && (
                <p className="text-sm text-muted-foreground px-1">📝 {expense.notes}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-border/50"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 gap-2 border-border/50",
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
            </>
          ) : (
            /* Edit mode */
            <>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted/50 border-border/50"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Category</Label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORY_OPTIONS.map(({ emoji, label }) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCategory(emoji)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-colors",
                        category === emoji
                          ? "border-primary bg-primary/10"
                          : "border-border/40 hover:bg-muted"
                      )}
                      title={label}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-[9px] text-muted-foreground truncate w-full">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/40" />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border/50"
                  onClick={() => {
                    setEditing(false)
                    setDescription(expense.description)
                    setCategory(expense.category)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleSave}
                  disabled={saving || !description.trim()}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </span>
                  ) : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
