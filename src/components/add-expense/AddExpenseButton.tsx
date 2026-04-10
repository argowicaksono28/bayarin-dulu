"use client"

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
