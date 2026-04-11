"use client"

import { useState, useEffect, useRef } from "react"
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
import { UserPlus, Search, Loader2, Check } from "lucide-react"
import type { User } from "@/types"

const avatarColors = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500",
  "bg-violet-500", "bg-rose-500", "bg-cyan-500",
]

interface SearchProfile {
  id: string
  name: string
  initials: string
  phone?: string
}

interface Props {
  groupId: string
  members: User[]
  onMemberAdded?: () => void
}

export function MembersSheet({ groupId, members, onMemberAdded }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const existingIds = new Set(members.map((m) => m.id))

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setAddedIds(new Set())
    }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/profiles?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (Array.isArray(data)) setResults(data)
      } catch {
        // ignore
      } finally {
        setSearching(false)
      }
    }, 350)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function handleAdd(profile: SearchProfile) {
    setAdding(profile.id)
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to add member")
        return
      }
      setAddedIds((prev) => new Set([...prev, profile.id]))
      toast.success(`${profile.name} added to group`)
      onMemberAdded?.()
      router.refresh()
    } catch {
      toast.error("Failed to add member")
    } finally {
      setAdding(null)
    }
  }

  return (
    <>
      {/* Clickable avatar stack */}
      <button
        onClick={() => setOpen(true)}
        className="flex -space-x-2 mr-1 hover:opacity-80 transition-opacity"
        aria-label={`${members.length} members`}
      >
        {members.slice(0, 3).map((member, idx) => (
          <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
            <AvatarFallback className={`text-[10px] text-white font-semibold ${avatarColors[idx % avatarColors.length]}`}>
              {member.initials}
            </AvatarFallback>
          </Avatar>
        ))}
        {members.length > 3 && (
          <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium">
            +{members.length - 3}
          </div>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 h-[80vh] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-3 shrink-0">
            <SheetTitle>Group Members ({members.length})</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4 pb-6">
            {/* Current members */}
            <div className="space-y-1 mb-4">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-1 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
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
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>

            <Separator className="mb-4" />

            {/* Add member */}
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                Add Member
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 bg-muted/50 border-border/50"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Search results */}
              {results.length > 0 && (
                <div className="space-y-1 rounded-xl border border-border/50 overflow-hidden">
                  {results.map((profile) => {
                    const alreadyMember = existingIds.has(profile.id)
                    const justAdded = addedIds.has(profile.id)
                    const isAdding = adding === profile.id
                    const done = alreadyMember || justAdded

                    return (
                      <div key={profile.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs bg-muted">{profile.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{profile.name}</p>
                          {profile.phone && (
                            <p className="text-xs text-muted-foreground">{profile.phone}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={done ? "ghost" : "default"}
                          disabled={done || isAdding}
                          onClick={() => handleAdd(profile)}
                          className="shrink-0 h-8"
                        >
                          {isAdding ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : done ? (
                            <><Check className="h-3 w-3 mr-1" /> Added</>
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {query.length >= 2 && !searching && results.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found for &ldquo;{query}&rdquo;
                </p>
              )}

              {query.length < 2 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Type at least 2 characters to search
                </p>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
