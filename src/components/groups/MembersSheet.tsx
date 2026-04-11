"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { UserPlus, Loader2, Trash2 } from "lucide-react"
import type { User } from "@/types"

const avatarColors = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500",
  "bg-violet-500", "bg-rose-500", "bg-cyan-500",
]

interface GuestMember { id: string; name: string; initials: string }

interface Props {
  groupId: string
  members: User[]
}

export function MembersSheet({ groupId, members }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [guests, setGuests] = useState<GuestMember[]>([])
  const [guestName, setGuestName] = useState("")
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Fetch guests eagerly so the avatar stack shows them too
  function loadGuests() {
    fetch(`/api/groups/${groupId}/guests`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setGuests(data) })
      .catch(() => {})
  }

  useEffect(() => {
    loadGuests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  useEffect(() => {
    if (open) loadGuests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleAddGuest() {
    const name = guestName.trim()
    if (!name || adding) return
    setAdding(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Failed to add guest"); return }
      setGuests((prev) => [...prev, data])
      setGuestName("")
      toast.success(`${name} added!`)
    } catch {
      toast.error("Failed to add guest")
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveGuest(guest: GuestMember) {
    setRemovingId(guest.id)
    try {
      const res = await fetch(`/api/groups/${groupId}/guests`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id }),
      })
      if (!res.ok) { toast.error("Failed to remove"); return }
      setGuests((prev) => prev.filter((g) => g.id !== guest.id))
      toast.success(`${guest.name} removed`)
    } catch {
      toast.error("Failed to remove guest")
    } finally {
      setRemovingId(null)
    }
  }

  // Combined list for the avatar stack
  const allMembers = [
    ...members,
    ...guests.map((g) => ({ id: g.id, name: g.name, initials: g.initials, isGuest: true })),
  ]

  return (
    <>
      {/* Clickable avatar stack — shows real members + guests */}
      <button
        onClick={() => setOpen(true)}
        className="flex -space-x-2 mr-1 hover:opacity-80 transition-opacity"
        aria-label={`${allMembers.length} members`}
      >
        {allMembers.slice(0, 4).map((member, idx) => (
          <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
            <AvatarFallback
              className={`text-[10px] font-semibold ${"isGuest" in member && member.isGuest
                ? "bg-muted text-muted-foreground"
                : `${avatarColors[idx % avatarColors.length]} text-white`}`}
            >
              {member.initials}
            </AvatarFallback>
          </Avatar>
        ))}
        {allMembers.length > 4 && (
          <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium">
            +{allMembers.length - 4}
          </div>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 h-[80vh] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-3 shrink-0">
            <SheetTitle>Members ({members.length + guests.length})</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4 pb-6">
            {/* ── Registered members ── */}
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              Registered
            </p>
            <div className="space-y-1 mb-4">
              {members.map((member, idx) => (
                <div key={member.id} className="flex items-center gap-3 px-1 py-2.5 rounded-xl">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`text-sm text-white font-semibold ${avatarColors[idx % avatarColors.length]}`}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.phone || member.email}</p>
                  </div>
                  {idx === 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">Admin</span>
                  )}
                </div>
              ))}
            </div>

            <Separator className="mb-4" />

            {/* ── Guest members ── */}
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              Guests (no account needed)
            </p>

            {guests.length > 0 && (
              <div className="space-y-1 mb-3">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center gap-3 px-1 py-2 rounded-xl hover:bg-muted/40">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-muted/70 text-muted-foreground font-semibold">
                        {guest.initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="flex-1 text-sm font-medium">{guest.name}</p>
                    <button
                      onClick={() => handleRemoveGuest(guest)}
                      disabled={removingId === guest.id}
                      className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      {removingId === guest.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Add guest input ── */}
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Guest name (e.g. Alice)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGuest()}
                className="bg-muted/50 border-border/50"
              />
              <Button
                onClick={handleAddGuest}
                disabled={!guestName.trim() || adding}
                className="shrink-0 gap-1.5"
              >
                {adding
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <UserPlus className="h-4 w-4" />}
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Guests appear in the receipt scanner and expense split but don&apos;t need an account.
            </p>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
