"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, UserCheck } from "lucide-react"
import { toast } from "sonner"

interface GuestCandidate {
  id: string
  name: string
  initials: string
}

interface Props {
  groupId: string
  candidates: GuestCandidate[]
  onLinked: () => void
  onSkip: () => void
}

export function GuestLinkDialog({ groupId, candidates, onLinked, onSkip }: Props) {
  const [linking, setLinking] = useState<string | null>(null)

  async function handleLink(guestId: string) {
    setLinking(guestId)
    try {
      const res = await fetch(`/api/groups/${groupId}/guests/${guestId}/link`, { method: "PATCH" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to link account")
        return
      }
      toast.success(`Linked to guest "${data.linkedName}" — your history is now connected!`)
      onLinked()
    } catch {
      toast.error("Failed to link account")
    } finally {
      setLinking(null)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onSkip() }}>
      <DialogContent className="max-w-sm bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Link Your Account
          </DialogTitle>
          <DialogDescription>
            We found guest members with a similar name. Are any of these you?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-sm font-medium">{c.initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium">{c.name}</span>
              <Button
                size="sm"
                className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!!linking}
                onClick={() => handleLink(c.id)}
              >
                {linking === c.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : "This is me"}
              </Button>
            </div>
          ))}
        </div>

        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onSkip}>
          None of these are me
        </Button>
      </DialogContent>
    </Dialog>
  )
}
