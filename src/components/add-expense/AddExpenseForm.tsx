"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { enUS as enLocale } from "date-fns/locale"
import { CalendarIcon, Calculator, Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { formatIDR } from "@/lib/formatters"
import { CATEGORY_OPTIONS, EXPENSE_SUGGESTIONS } from "@/lib/constants"
import { computeSplits } from "@/lib/split-utils"
import type { SplitType, User } from "@/types"
import { SplitTypeSelector } from "./SplitTypeSelector"
import { TaxServiceAccordion } from "./TaxServiceAccordion"
import { CalculatorKeyboard } from "./CalculatorKeyboard"
import { createClient } from "@/lib/supabase/client"
import type { ReceiptConfirmResult } from "@/components/receipt/ReceiptScannerSheet"
import type { ReceiptData } from "@/types"

const schema = z.object({
  description: z.string().min(1, "Description is required").max(255, "Max 255 characters"),
  amount: z.number().positive("Amount must be greater than 0").max(999_999_999, "Amount too large"),
  paidBy: z.string().min(1),
  date: z.date(),
  category: z.string().min(1),
  notes: z.string().max(500, "Max 500 characters").optional(),
})

type Values = z.infer<typeof schema>

interface InitialValues {
  expenseId: string
  description: string
  amount: number        // base amount (before tax/service)
  tax: number
  serviceCharge: number
  paidBy: string
  splitType: SplitType
  splits: Record<string, number>
  category: string
  notes?: string
}

interface Props {
  groupId: string
  onSuccess: () => void
  /** When provided, form operates in edit mode */
  initialValues?: InitialValues
  /** When parent confirms a receipt split, auto-fill the form */
  receiptResult?: ReceiptConfirmResult | null
}

export function AddExpenseForm({ groupId, onSuccess, initialValues, receiptResult }: Props) {
  const isEdit = !!initialValues
  const [members, setMembers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [includedIds, setIncludedIds] = useState<string[]>([])

  const [splitType, setSplitType] = useState<SplitType>(initialValues?.splitType ?? "equal")
  const [splitInputs, setSplitInputs] = useState<Record<string, number>>(initialValues?.splits ?? {})
  const [tax, setTax] = useState(initialValues?.tax ?? 0)
  const [serviceCharge, setServiceCharge] = useState(initialValues?.serviceCharge ?? 0)
  const [showCalc, setShowCalc] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
    Promise.all([
      fetch(`/api/groups/${groupId}/members`).then((r) => r.json()),
      fetch(`/api/groups/${groupId}/guests`).then((r) => r.json()),
    ]).then(([realMembers, guests]) => {
      const all = [
        ...(Array.isArray(realMembers) ? realMembers : []),
        ...(Array.isArray(guests) ? guests.map((g: any) => ({
          id: g.id, name: g.name, initials: g.initials,
          email: "", phone: "", avatarUrl: null, isGuest: true,
        })) : []),
      ]
      setMembers(all)
      // Initialize included to all members (or restore from initialValues splits)
      if (initialValues?.splits) {
        setIncludedIds(Object.keys(initialValues.splits))
      } else {
        setIncludedIds(all.map(m => m.id))
      }
    }).catch(() => {})
  }, [groupId])

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: initialValues?.description ?? "",
      amount: initialValues?.amount ?? 0,
      paidBy: initialValues?.paidBy ?? currentUserId,
      date: new Date(),
      category: initialValues?.category ?? "🍽️",
      notes: initialValues?.notes ?? "",
    },
  })

  useEffect(() => {
    if (currentUserId && !form.getValues("paidBy")) {
      form.setValue("paidBy", currentUserId)
    }
  }, [currentUserId, form])

  // Fill form when parent confirms a receipt split
  useEffect(() => {
    if (!receiptResult) return
    form.setValue("description", receiptResult.description, { shouldValidate: true, shouldDirty: true })
    form.setValue("amount", receiptResult.baseAmount, { shouldValidate: true, shouldDirty: true })
    setTax(receiptResult.taxPercent)
    setServiceCharge(receiptResult.serviceChargePercent)
    setSplitType("shares")
    setSplitInputs(receiptResult.splits)
    setIncludedIds(Object.keys(receiptResult.splits))
    setReceiptData(receiptResult.receiptData ?? null)
  }, [receiptResult, form])

  function toggleMember(id: string) {
    setIncludedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      setSplitInputs({}) // reset manual splits when included members change
      return next
    })
  }

  const watchedAmount = form.watch("amount")
  const totalAmount = Math.round(watchedAmount * (1 + tax / 100 + serviceCharge / 100))

  const activeIds = includedIds.length > 0 ? includedIds : members.map(m => m.id)
  const includedMembers = members.filter(m => activeIds.includes(m.id))
  const splitResult = computeSplits(totalAmount, activeIds, splitType, splitInputs)

  function handleInputChange(userId: string, value: number) {
    setSplitInputs((prev) => ({ ...prev, [userId]: value }))
  }

  function handleSplitTypeChange(type: SplitType) {
    setSplitType(type)
    setSplitInputs({})
  }

  async function onSubmit(values: Values) {
    if (!splitResult.isValid) {
      toast.error(`Invalid split: ${splitResult.errorMessage}`)
      return
    }

    const payload = {
      description: values.description,
      amount: totalAmount,
      baseAmount: values.amount,
      tax,
      serviceCharge,
      paidBy: values.paidBy,
      splitType,
      splits: splitResult.splits,
      category: values.category,
      notes: values.notes,
      receiptData: receiptData ?? undefined,
    }

    if (isEdit) {
      const res = await fetch(`/api/groups/${groupId}/expenses/${initialValues.expenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update expense")
        return
      }
      toast.success(`"${values.description}" updated!`)
    } else {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to add expense")
        return
      }
      toast.success(`"${values.description}" added!`)
    }

    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                    <Input
                      type="number"
                      placeholder="0"
                      className="pl-9 text-lg font-semibold bg-muted/50 border-border/50"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCalc(true)}
                  aria-label="Calculator"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Calculator Sheet */}
        <Sheet open={showCalc} onOpenChange={setShowCalc}>
          <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 p-0 flex flex-col overflow-x-hidden">
            <SheetHeader className="pl-4 pr-10 pt-4 pb-3 shrink-0">
              <SheetTitle>Calculator</SheetTitle>
            </SheetHeader>
            <div className="pl-4 pr-4 pb-8">
              <CalculatorKeyboard
                initialValue={form.getValues("amount")}
                onConfirm={(val) => {
                  form.setValue("amount", val)
                  setShowCalc(false)
                }}
                onCancel={() => setShowCalc(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div>
                  <Input
                    placeholder="What was this for?"
                    {...field}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {EXPENSE_SUGGESTIONS.slice(0, 4).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => field.onChange(s)}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full border transition-colors",
                          field.value === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(field.value, "d MMMM yyyy", { locale: enLocale })
                        : "Pick a date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[min(100vw-2rem,22rem)] p-0 bg-card border-border/50 shadow-xl z-[200]" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(d) => field.onChange(d || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payer — includes guests */}
        <FormField
          control={form.control}
          name="paidBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paid by</FormLabel>
              <div className="flex gap-2 flex-wrap">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => field.onChange(member.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors",
                      field.value === member.id
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent"
                    )}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[9px]">{member.initials}</AvatarFallback>
                    </Avatar>
                    {member.id === currentUserId ? "You" : member.name.split(" ")[0]}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category — monochrome icons, no labels */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORY_OPTIONS.map(({ emoji, label, icon: Icon }) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => field.onChange(emoji)}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-lg border transition-colors",
                      field.value === emoji
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent text-foreground border-border/50"
                    )}
                    title={label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tax & Service */}
        <TaxServiceAccordion
          baseAmount={watchedAmount || 0}
          tax={tax}
          serviceCharge={serviceCharge}
          onTaxChange={setTax}
          onServiceChange={setServiceCharge}
        />

        {/* Who's included */}
        <div>
          <p className="text-sm font-medium mb-3">Who&apos;s included?</p>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMember(m.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors",
                  includedIds.includes(m.id)
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border/50 hover:bg-accent text-muted-foreground"
                )}
              >
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">{m.initials}</AvatarFallback>
                </Avatar>
                {m.id === currentUserId ? "You" : m.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Split type */}
        <SplitTypeSelector
          members={includedMembers}
          totalAmount={totalAmount}
          splitType={splitType}
          inputs={splitInputs}
          onSplitTypeChange={handleSplitTypeChange}
          onInputChange={handleInputChange}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any extra notes..."
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid || !splitResult.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              Saving…
            </span>
          ) : isEdit
            ? `Save Changes — ${formatIDR(totalAmount)}`
            : watchedAmount > 0
              ? `Save — ${formatIDR(totalAmount)}`
              : "Save Expense"}
        </Button>

        {!splitResult.isValid && splitResult.errorMessage && (
          <p className="text-xs text-red-600 dark:text-red-400 text-center">
            {splitResult.errorMessage}
          </p>
        )}
      </form>
    </Form>
  )
}
