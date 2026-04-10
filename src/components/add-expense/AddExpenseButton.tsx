"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddExpenseForm } from "./AddExpenseForm"

interface Props {
  groupId: string
}

export function AddExpenseButton({ groupId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop button */}
      <Button
        onClick={() => setOpen(true)}
        className="hidden lg:flex gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Plus className="h-4 w-4" />
        Add Expense
      </Button>

      {/* Mobile FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-5 bottom-[110px] z-40 lg:hidden h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Always bottom Sheet — slides up on both mobile and desktop */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl h-[92vh] bg-card border-border/50"
        >
          <SheetHeader className="pb-2">
            <SheetTitle>Add Expense</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full pb-8">
            <div className="px-1 pb-8">
              <AddExpenseForm groupId={groupId} onSuccess={() => setOpen(false)} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
