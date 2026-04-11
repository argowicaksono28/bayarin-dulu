"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AddExpenseForm } from "./AddExpenseForm"
import { useMediaQuery } from "@/hooks/useMediaQuery"

interface Props {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseButton({ groupId, open, onOpenChange }: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg bg-card border-border/50 p-0 max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-5 pb-2 shrink-0">
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <AddExpenseForm groupId={groupId} onSuccess={() => onOpenChange(false)} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl h-[92vh] bg-card border-border/50 p-0 flex flex-col"
      >
        <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
          <SheetTitle>Add Expense</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-4 pb-8">
          <AddExpenseForm groupId={groupId} onSuccess={() => onOpenChange(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
