"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatIDR } from "@/lib/formatters"
import type { Balance } from "@/types"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"

const avatarColors = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500",
  "bg-violet-500", "bg-rose-500",
]

interface Props {
  balance: Balance
  onConfirm: () => void
}

export function SettlementAlertDialog({ balance, onConfirm }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fromName = balance.fromProfile?.name ?? "User"
  const toName = balance.toProfile?.name ?? "User"
  const fromInitials = balance.fromProfile?.initials ?? "?"
  const toInitials = balance.toProfile?.initials ?? "?"

  async function handleConfirm() {
    setLoading(true)
    setOpen(false)
    setLoading(false)
    onConfirm()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 border-border/60 text-xs hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Settle
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 pb-8">
          <SheetHeader className="pb-6">
            <SheetTitle>Confirm Settlement</SheetTitle>
          </SheetHeader>

          <div className="flex items-center justify-center gap-4 py-4 mb-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-14 w-14">
                <AvatarFallback className={`text-base text-white font-semibold ${avatarColors[0]}`}>
                  {fromInitials}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground font-medium">{fromName.split(" ")[0]}</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary">{formatIDR(balance.amount)}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-14 w-14">
                <AvatarFallback className={`text-base text-white font-semibold ${avatarColors[1]}`}>
                  {toInitials}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground font-medium">{toName.split(" ")[0]}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mb-6">
            Mark {formatIDR(balance.amount)} from {fromName} to {toName} as settled?{" "}
            You can undo this within 5 seconds.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-border/50 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Confirm
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
