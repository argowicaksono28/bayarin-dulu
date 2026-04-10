"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const EMOJI_OPTIONS = ["🏖️", "🏠", "🍽️", "🚗", "✈️", "🎉", "🎮", "🏋️", "📚", "💼"]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupSheet({ open, onOpenChange }: Props) {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🎉")
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim() || loading) return
    setLoading(true)
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), emoji }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? "Failed to create group")
      setLoading(false)
      return
    }
    toast.success(`Group "${name}" created!`)
    setName("")
    setEmoji("🎉")
    onOpenChange(false)
    window.location.href = `/groups/${data.id}`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 pb-8">
        <SheetHeader className="pb-4">
          <SheetTitle>Create New Group</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Emoji picker */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Group Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center border transition-colors ${
                    emoji === e
                      ? "border-primary bg-primary/15"
                      : "border-border/50 bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Group name */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Group Name</Label>
            <Input
              placeholder="e.g. Bali Trip, House Expenses..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/50 border-border/50"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          {/* Preview */}
          {name && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/30">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xl">{emoji}</div>
              <div>
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">1 member · just created</p>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleCreate}
            disabled={!name.trim() || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Creating…
              </span>
            ) : (
              "Create Group"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
