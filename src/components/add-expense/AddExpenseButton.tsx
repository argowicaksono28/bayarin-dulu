"use client"

import { Plus } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddExpenseForm } from "./AddExpenseForm"

interface Props {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseButton({ groupId, open, onOpenChange }: Props) {
  return (
    <>
      {/* Mobile FAB only — desktop button lives inside ExpenseList search row */}
      <button
        onClick={() => onOpenChange(true)}
        className="fixed right-5 bottom-[110px] z-40 lg:hidden h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl h-[92vh] bg-card border-border/50"
        >
          <SheetHeader className="pb-2">
            <SheetTitle>Add Expense</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full pb-8">
            <div className="px-1 pb-8">
              <AddExpenseForm groupId={groupId} onSuccess={() => onOpenChange(false)} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
