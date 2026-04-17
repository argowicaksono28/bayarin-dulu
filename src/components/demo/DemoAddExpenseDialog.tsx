"use client"

import { useState, useEffect } from "react"
import { useDemo } from "@/contexts/DemoContext"
import { DEMO_CURRENT_USER_ID } from "@/lib/demo-data"
import { computeSplits } from "@/lib/split-utils"
import { formatIDR } from "@/lib/formatters"
import { CATEGORY_OPTIONS } from "@/lib/constants"
import { toast } from "sonner"
import type { SplitType, User, Expense } from "@/types"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SplitTypeSelector } from "@/components/add-expense/SplitTypeSelector"
import { ReceiptScannerSheet, type ScannedReceipt, type ReceiptConfirmResult } from "@/components/receipt/ReceiptScannerSheet"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { ScanLine, Upload, Loader2 } from "lucide-react"
import type { ReceiptData } from "@/types"

const AVATAR_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-amber-700",
  "bg-violet-600", "bg-rose-700", "bg-cyan-700",
]
function avatarColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const SUGGESTIONS = ["Coffee run", "Lunch", "Dinner", "Snacks", "Drinks", "Groceries", "Transport", "Hotel"]

interface Props {
  groupId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Receipt Upload Panel (calls public endpoint, no auth required) ───────────

function DemoReceiptUploadPanel({ onScanned }: { onScanned: (r: ScannedReceipt) => void }) {
  const [scanning, setScanning] = useState(false)

  async function handleFile(file: File) {
    setScanning(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/public/receipt-scan", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to scan receipt")
        return
      }
      onScanned(data as ScannedReceipt)
    } catch {
      toast.error("Failed to scan receipt")
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {scanning ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Scanning receipt…</p>
        </div>
      ) : (
        <>
          <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border/50 bg-muted/30 flex items-center justify-center">
            <ScanLine className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center px-4">
            Take a photo or upload an image of your receipt to auto-fill the form
          </p>
          <label className="w-full cursor-pointer">
            <input type="file" accept="image/*" capture="environment" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }}
            />
            <Button type="button" className="w-full gap-2 pointer-events-none" asChild={false}>
              <span className="flex items-center justify-center gap-2">
                <ScanLine className="h-4 w-4" /> Take Photo
              </span>
            </Button>
          </label>
          <label className="w-full cursor-pointer">
            <input type="file" accept="image/*" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }}
            />
            <Button type="button" variant="outline" className="w-full gap-2 border-border/50 pointer-events-none" asChild={false}>
              <span className="flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" /> Upload from Gallery
              </span>
            </Button>
          </label>
        </>
      )}
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function DemoAddExpenseDialog({ groupId, open, onOpenChange }: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const { dispatch, getMembersByGroupId } = useDemo()

  const members = getMembersByGroupId(groupId)

  const [activeTab, setActiveTab] = useState("manual")
  const [description, setDescription] = useState("")
  const [amountStr, setAmountStr] = useState("")
  const [category, setCategory] = useState("🍽️")
  const [paidBy, setPaidBy] = useState(DEMO_CURRENT_USER_ID)
  const [splitType, setSplitType] = useState<SplitType>("equal")
  const [splitInputs, setSplitInputs] = useState<Record<string, number>>({})
  const [includedIds, setIncludedIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Receipt scanner state
  const [scannedReceipt, setScannedReceipt] = useState<ScannedReceipt | null>(null)
  const [receiptSheetOpen, setReceiptSheetOpen] = useState(false)
  const [receiptResult, setReceiptResult] = useState<ReceiptConfirmResult | null>(null)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setDescription("")
      setAmountStr("")
      setCategory("🍽️")
      setPaidBy(DEMO_CURRENT_USER_ID)
      setSplitType("equal")
      setSplitInputs({})
      setIncludedIds(members.map((m) => m.id))
      setActiveTab("manual")
      setReceiptResult(null)
      setScannedReceipt(null)
      setReceiptData(null)
    }
  }, [open, members.length])

  // Pre-fill from receipt result
  useEffect(() => {
    if (!receiptResult) return
    setDescription(receiptResult.description || "")
    setAmountStr(String(receiptResult.baseAmount || ""))
    setSplitType("exact")
    setSplitInputs(receiptResult.splits)
    setIncludedIds(Object.keys(receiptResult.splits))
    setReceiptData(receiptResult.receiptData ?? null)
    setActiveTab("manual")
  }, [receiptResult])

  const amount = parseFloat(amountStr.replace(/[^0-9.]/g, "")) || 0
  const includedMembers = members.filter((m) => includedIds.includes(m.id))
  const splitResult = computeSplits(amount, includedIds, splitType, splitInputs)

  function handleSplitInputChange(userId: string, value: number) {
    setSplitInputs((prev) => ({ ...prev, [userId]: value }))
  }

  function toggleMember(id: string) {
    setIncludedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleReceiptScanned(receipt: ScannedReceipt) {
    setScannedReceipt(receipt)
    setReceiptSheetOpen(true)
  }

  function handleReceiptConfirm(result: ReceiptConfirmResult) {
    setReceiptResult(result)
    setReceiptSheetOpen(false)
  }

  function handleClose(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setActiveTab("manual")
      setReceiptResult(null)
    }
  }

  function handleSubmit() {
    if (!description.trim()) { toast.error("Please enter a description"); return }
    if (amount <= 0) { toast.error("Please enter a valid amount"); return }
    if (includedIds.length === 0) { toast.error("Include at least one member"); return }
    if (!splitResult.isValid) { toast.error(splitResult.errorMessage ?? "Invalid split"); return }

    setIsSubmitting(true)

    const paidByUser = members.find((m) => m.id === paidBy)
    const newExpense: Expense = {
      id: `exp_demo_${Date.now()}`,
      groupId,
      description: description.trim(),
      amount,
      baseAmount: amount,
      tax: 0,
      serviceCharge: 0,
      paidBy,
      paidByProfile: paidByUser
        ? { id: paidByUser.id, name: paidByUser.name, initials: paidByUser.initials, avatarUrl: null }
        : undefined,
      splitType,
      splits: splitResult.splits,
      category,
      receiptData: receiptData ?? undefined,
      createdAt: new Date(),
      createdBy: DEMO_CURRENT_USER_ID,
    }

    dispatch({ type: "ADD_EXPENSE", payload: newExpense })
    toast.success(`"${description.trim()}" added!`, { description: "Demo only — not saved to database" })
    setIsSubmitting(false)
    handleClose(false)
  }

  const manualForm = (
    <div className="space-y-5">
      {/* Amount */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
          <Input
            type="number"
            placeholder="0"
            className="pl-10 text-lg font-semibold h-12 bg-card border-border/50"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Description</label>
        <Input
          placeholder="What was this for?"
          className="bg-card border-border/50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={255}
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => setDescription(s)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                description === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 hover:bg-muted text-muted-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Category</label>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORY_OPTIONS.map(({ emoji, label, icon: Icon }) => (
            <button key={emoji} type="button" onClick={() => setCategory(emoji)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-colors",
                category === emoji
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 hover:bg-muted text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] text-muted-foreground leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Paid by */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Paid by</label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button key={m.id} type="button" onClick={() => setPaidBy(m.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors",
                paidBy === m.id
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border/50 hover:bg-muted text-foreground"
              )}
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className={cn("text-[9px] font-bold text-white", avatarColor(m.id))}>
                  {m.initials}
                </AvatarFallback>
              </Avatar>
              {m.id === DEMO_CURRENT_USER_ID ? `You (${m.name.split(" ")[0]})` : m.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Who's included */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Split between</label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const included = includedIds.includes(m.id)
            return (
              <button key={m.id} type="button" onClick={() => toggleMember(m.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors",
                  included
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border/50 bg-muted/30 text-muted-foreground line-through opacity-50"
                )}
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback className={cn("text-[9px] font-bold text-white", avatarColor(m.id))}>
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                {m.id === DEMO_CURRENT_USER_ID ? "You" : m.name.split(" ")[0]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Split type */}
      {amount > 0 && includedIds.length > 0 && (
        <SplitTypeSelector
          members={includedMembers}
          totalAmount={amount}
          splitType={splitType}
          inputs={splitInputs}
          onSplitTypeChange={setSplitType}
          onInputChange={handleSplitInputChange}
        />
      )}

      {amount > 0 && !splitResult.isValid && splitResult.errorMessage && (
        <p className="text-xs text-destructive">{splitResult.errorMessage}</p>
      )}

      <Button
        className="w-full h-11 text-base font-medium"
        onClick={handleSubmit}
        disabled={isSubmitting || !description.trim() || amount <= 0 || !splitResult.isValid}
      >
        {isSubmitting ? "Adding..." : `Add Expense${amount > 0 ? ` · ${formatIDR(amount)}` : ""}`}
      </Button>
    </div>
  )

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
        {manualForm}
      </TabsContent>

      <TabsContent value="receipt" className="mt-4 focus-visible:outline-none">
        <DemoReceiptUploadPanel onScanned={handleReceiptScanned} />
      </TabsContent>
    </Tabs>
  )

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogContent className="max-w-lg bg-card border-border/50 p-0 flex flex-col overflow-hidden" style={{ maxHeight: "90vh" }}>
            <DialogHeader className="px-6 pt-5 pb-3 shrink-0 border-b border-border/30">
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-4">{tabs}</div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={open} onOpenChange={handleClose}>
          <SheetContent side="bottom" className="rounded-t-2xl h-[92vh] bg-card border-border/50 p-0 flex flex-col">
            <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
              <SheetTitle>Add Expense</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <div className="px-5 pt-2 pb-10">{tabs}</div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}

      {/* Receipt assignment sheet — rendered outside the main dialog to avoid z-index conflicts */}
      <ReceiptScannerSheet
        open={receiptSheetOpen}
        onOpenChange={setReceiptSheetOpen}
        receipt={scannedReceipt}
        members={members}
        onConfirm={handleReceiptConfirm}
      />
    </>
  )
}
