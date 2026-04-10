"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { formatIDR } from "@/lib/formatters"
import { getUserById, getGroupById } from "@/lib/mock-data"
import type { Balance } from "@/types"
import { Send, Copy, MessageSquare } from "lucide-react"

interface Props {
  balance: Balance
}

export function RequestPaymentSheet({ balance }: Props) {
  const [open, setOpen] = useState(false)
  const fromUser = getUserById(balance.fromUserId)
  const toUser = getUserById(balance.toUserId)
  let group = { name: "group" }
  try { group = getGroupById(balance.groupId) } catch {}

  const [includeGroup, setIncludeGroup] = useState(true)

  function buildMessage(withGroup: boolean) {
    const groupPart = withGroup ? ` for "${group.name}"` : ""
    return `Hi ${fromUser.name}, please transfer ${formatIDR(balance.amount)} to ${toUser.name}${groupPart}. Mark as settled once done. Thanks! 🙏`
  }

  const [message, setMessage] = useState(buildMessage(true))

  function handleToggleGroup(checked: boolean) {
    setIncludeGroup(checked)
    setMessage(buildMessage(checked))
  }

  function handleCopy() {
    navigator.clipboard.writeText(message).then(() => toast.success("Message copied!"))
  }

  function handleShare() {
    window.open(`https://wa.me/${fromUser.phone}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 border-border/60 text-xs hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        <Send className="h-3.5 w-3.5" />
        Request
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 max-h-[80vh]">
          <SheetHeader className="pb-4">
            <SheetTitle>Request Payment</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto pb-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none bg-muted/50 border-border/50 text-sm"
              />
              <p className="text-xs text-muted-foreground text-right">{message.length} chars</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="inc-group" checked={includeGroup} onCheckedChange={handleToggleGroup} />
              <Label htmlFor="inc-group" className="text-sm cursor-pointer">Include group name</Label>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2 border-border/50 hover:bg-muted" onClick={handleCopy}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button className="flex-1 gap-2 bg-primary hover:bg-primary/90" onClick={handleShare}>
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
