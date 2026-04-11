"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Copy, Check, Link } from "lucide-react"

interface Props {
  groupId: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberSheet({ groupId, groupName, open, onOpenChange }: Props) {
  const [inviteUrl, setInviteUrl] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      setInviteUrl(`${window.location.origin}/invite/${groupId}`)
    }
  }, [open, groupId])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success("Invite link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Join me on Bayarin Dulu for "${groupName}"! Click the link to join: ${inviteUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle>Invite Members</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* QR placeholder */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-40 w-40 rounded-2xl border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Link className="h-8 w-8" />
              <p className="text-xs text-center px-3">QR Code<br/>(coming soon)</p>
            </div>
            <p className="text-xs text-muted-foreground">or share the link below</p>
          </div>

          {/* Invite link */}
          <div className="flex gap-2">
            <Input
              value={inviteUrl}
              readOnly
              className="bg-muted/50 border-border/50 text-sm font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
              aria-label="Copy link"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Share via WhatsApp */}
          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleWhatsApp}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share via WhatsApp
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Anyone with this link can join &ldquo;{groupName}&rdquo;
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
