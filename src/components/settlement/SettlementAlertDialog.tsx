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
import { getUserById, CURRENT_USER_ID } from "@/lib/mock-data"
import type { Balance } from "@/types"
import { CheckCircle, ArrowRight } from "lucide-react"

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
  const fromUser = getUserById(balance.fromUserId)
  const toUser = getUserById(balance.toUserId)
  const iOwed = balance.fromUserId === CURRENT_USER_ID

  function handleConfirm() {
    setOpen(false)
    onConfirm()
  }

  const colorA = avatarColors[0]
  const colorB = avatarColors[1]

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

          {/* Visual: who pays who */}
          <div className="flex items-center justify-center gap-4 py-4 mb-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-14 w-14">
                <AvatarFallback className={`text-base text-white font-semibold ${colorA}`}>
                  {fromUser.initials}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground font-medium">{fromUser.name.split(" ")[0]}</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary">{formatIDR(balance.amount)}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-14 w-14">
                <AvatarFallback className={`text-base text-white font-semibold ${colorB}`}>
                  {toUser.initials}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground font-medium">{toUser.name.split(" ")[0]}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center mb-6">
            {iOwed
              ? `Mark your ${formatIDR(balance.amount)} debt to ${toUser.name} as settled?`
              : `Mark ${formatIDR(balance.amount)} from ${fromUser.name} as received?`}
            {" "}You can undo this within 5 seconds.
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
            >
              <CheckCircle className="h-4 w-4" />
              Konfirmasi
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
