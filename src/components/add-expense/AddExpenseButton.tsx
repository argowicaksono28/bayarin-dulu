"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddExpenseForm } from "./AddExpenseForm"
import { ReceiptUploadPanel } from "./ReceiptUploadPanel"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { ReceiptScannerSheet, type ScannedReceipt, type ReceiptConfirmResult } from "@/components/receipt/ReceiptScannerSheet"
import type { User } from "@/types"

interface Props {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseButton({ groupId, open, onOpenChange }: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [activeTab, setActiveTab] = useState("manual")
  const [members, setMembers] = useState<User[]>([])
  const [scannedReceipt, setScannedReceipt] = useState<ScannedReceipt | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptResult, setReceiptResult] = useState<ReceiptConfirmResult | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/groups/${groupId}/members`).then((r) => r.json()),
      fetch(`/api/groups/${groupId}/guests`).then((r) => r.json()),
    ]).then(([realMembers, guests]) => {
      const all: User[] = [
        ...(Array.isArray(realMembers) ? realMembers : []),
        ...(Array.isArray(guests) ? guests.map((g: any) => ({
          id: g.id, name: g.name, initials: g.initials,
          email: "", phone: "", avatarUrl: null, isGuest: true,
        })) : []),
      ]
      setMembers(all)
    }).catch(() => {})
  }, [groupId])

  function handleReceiptScanned(receipt: ScannedReceipt) {
    setScannedReceipt(receipt)
    setReceiptOpen(true)
  }

  function handleReceiptConfirm(result: ReceiptConfirmResult) {
    setReceiptResult(result)
    setReceiptOpen(false)
    setActiveTab("manual")
  }

  function handleClose(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setActiveTab("manual")
      setReceiptResult(null)
    }
  }

  const tabs = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full bg-muted/50 border border-border/30 rounded-lg p-1 mb-1">
        <TabsTrigger value="manual" className="flex-1 text-sm rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">
          Manual
        </TabsTrigger>
        <TabsTrigger value="receipt" className="flex-1 text-sm rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm">
          Scan Receipt
        </TabsTrigger>
      </TabsList>

      <TabsContent value="manual" className="mt-4 focus-visible:outline-none">
        <AddExpenseForm
          groupId={groupId}
          onSuccess={() => { handleClose(false) }}
          receiptResult={receiptResult}
        />
      </TabsContent>

      <TabsContent value="receipt" className="mt-4 focus-visible:outline-none">
        <ReceiptUploadPanel onScanned={handleReceiptScanned} />
      </TabsContent>
    </Tabs>
  )

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-lg bg-card border-border/50 p-0 flex flex-col" style={{ maxHeight: "90vh" }}>
            <DialogHeader className="px-6 pt-5 pb-3 shrink-0 border-b border-border/30">
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
              {tabs}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={open} onOpenChange={handleClose}>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl h-[92vh] bg-card border-border/50 p-0 flex flex-col"
          >
            <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
              <SheetTitle>Add Expense</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <div className="px-5 pt-2 pb-10">
                {tabs}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      {/* Receipt sheet rendered OUTSIDE the add-expense sheet to avoid z-index conflict */}
      <ReceiptScannerSheet
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={scannedReceipt}
        members={members}
        onConfirm={handleReceiptConfirm}
      />
    </>
  )
}
