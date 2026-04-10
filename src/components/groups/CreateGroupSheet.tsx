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

  async function handleCreate() {
    if (!name.trim()) return
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), emoji }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? "Failed to create group")
      return
    }
    toast.success(`Group "${name}" created!`)
    setName("")
    setEmoji("🎉")
    onOpenChange(false)
    // Navigate to the new group
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
            disabled={!name.trim()}
          >
            Create Group
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
