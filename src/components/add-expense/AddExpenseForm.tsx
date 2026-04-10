"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { enUS as enLocale } from "date-fns/locale"
import { CalendarIcon, Calculator, Receipt, ChevronDown, Loader2 } from "lucide-react"
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
import { CATEGORY_OPTIONS, EXPENSE_SUGGESTIONS } from "@/lib/mock-data"
import { computeSplits } from "@/lib/split-utils"
import type { SplitType, User } from "@/types"
import { SplitTypeSelector } from "./SplitTypeSelector"
import { TaxServiceAccordion } from "./TaxServiceAccordion"
import { CalculatorKeyboard } from "./CalculatorKeyboard"
import { createClient } from "@/lib/supabase/client"

const schema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  paidBy: z.string().min(1),
  date: z.date(),
  category: z.string().min(1),
  notes: z.string().optional(),
})

type Values = z.infer<typeof schema>

interface Props {
  groupId: string
  onSuccess: () => void
}

export function AddExpenseForm({ groupId, onSuccess }: Props) {
  const [members, setMembers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")

  const [splitType, setSplitType] = useState<SplitType>("equal")
  const [splitInputs, setSplitInputs] = useState<Record<string, number>>({})
  const [tax, setTax] = useState(0)
  const [serviceCharge, setServiceCharge] = useState(0)
  const [showCalc, setShowCalc] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    // Get current user id
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
    // Fetch real group members
    fetch(`/api/groups/${groupId}/members`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data)
      })
      .catch(() => {})
  }, [groupId])

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: "",
      amount: 0,
      paidBy: currentUserId,
      date: new Date(),
      category: "🍽️",
      notes: "",
    },
  })

  // Update paidBy default when currentUserId loads
  useEffect(() => {
    if (currentUserId && !form.getValues("paidBy")) {
      form.setValue("paidBy", currentUserId)
    }
  }, [currentUserId, form])

  const watchedAmount = form.watch("amount")
  const totalAmount = Math.round(watchedAmount * (1 + tax / 100 + serviceCharge / 100))

  const splitResult = computeSplits(totalAmount, members.map(m => m.id), splitType, splitInputs)

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
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? "Failed to add expense")
      return
    }
    toast.success(`"${values.description}" added!`)
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
          <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 pb-8">
            <SheetHeader className="pb-4">
              <SheetTitle>Calculator</SheetTitle>
            </SheetHeader>
            <CalculatorKeyboard
              initialValue={form.getValues("amount")}
              onConfirm={(val) => {
                form.setValue("amount", val)
                setShowCalc(false)
              }}
              onCancel={() => setShowCalc(false)}
            />
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
                <div className="relative">
                  <Input
                    placeholder="Lunch, gas, groceries..."
                    {...field}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  {showSuggestions && field.value === "" && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 border border-border/50 rounded-lg bg-card shadow-xl overflow-hidden">
                      {EXPENSE_SUGGESTIONS.slice(0, 4).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                          onClick={() => { field.onChange(s); setShowSuggestions(false) }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
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
                <PopoverContent className="w-auto p-0" align="start">
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

        {/* Payer */}
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

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORY_OPTIONS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => field.onChange(emoji)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-colors",
                      field.value === emoji
                        ? "border-primary bg-primary/10"
                        : "hover:bg-accent"
                    )}
                    title={label}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[9px] text-muted-foreground truncate w-full">{label}</span>
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

        {/* Split type */}
        <SplitTypeSelector
          memberIds={members.map(m => m.id)}
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

        {/* Receipt upload (UI only) */}
        <Button type="button" variant="outline" className="w-full gap-2 border-border/50 hover:bg-muted text-muted-foreground">
          <Receipt className="h-4 w-4" />
          Upload Receipt (coming soon)
        </Button>

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
          ) : watchedAmount > 0
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
