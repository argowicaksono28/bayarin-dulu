"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/useMediaQuery"

const EMOJI_OPTIONS = [
  "🎉", "🏖️", "🏠", "🍽️", "🚗", "✈️", "🎮", "🏋️",
  "📚", "💼", "🎵", "🎬", "🏕️", "🛒", "💊", "🐾",
  "🎓", "💪", "🌴", "🎯", "🍕", "☕", "🚢", "⚽",
]

const COLOR_OPTIONS = [
  { label: "Slate",   value: "bg-slate-500" },
  { label: "Rose",    value: "bg-rose-500" },
  { label: "Orange",  value: "bg-orange-500" },
  { label: "Amber",   value: "bg-amber-500" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Teal",    value: "bg-teal-500" },
  { label: "Sky",     value: "bg-sky-500" },
  { label: "Violet",  value: "bg-violet-500" },
  { label: "Pink",    value: "bg-pink-500" },
  { label: "Indigo",  value: "bg-indigo-500" },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupSheet({ open, onOpenChange }: Props) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🎉")
  const [coverColor, setCoverColor] = useState("bg-violet-500")
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim() || loading) return
    setLoading(true)
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), emoji, coverColor }),
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
    setCoverColor("bg-violet-500")
    onOpenChange(false)
    window.location.href = `/groups/${data.id}`
  }

  const content = (
    <div className="space-y-5">
      {/* Preview banner */}
      <div className={cn("rounded-xl h-20 flex items-center justify-center text-4xl transition-colors", coverColor)}>
        {emoji}
      </div>

      {/* Emoji picker */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Group Icon</Label>
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                "h-10 w-10 rounded-xl text-xl flex items-center justify-center border transition-colors",
                emoji === e
                  ? "border-primary bg-primary/15"
                  : "border-border/50 bg-muted/50 hover:bg-muted"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Cover Color</Label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              title={label}
              onClick={() => setCoverColor(value)}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all",
                value,
                coverColor === value ? "border-foreground scale-110" : "border-transparent"
              )}
            />
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
          maxLength={100}
        />
      </div>

      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={handleCreate}
        disabled={!name.trim() || loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating…
          </span>
        ) : (
          "Create Group"
        )}
      </Button>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg bg-card border-border/50 p-0 flex flex-col" style={{ maxHeight: "90vh" }}>
          <DialogHeader className="px-6 pt-5 pb-3 shrink-0 border-b border-border/30">
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 h-[85vh] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 shrink-0">
          <SheetTitle>Create New Group</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="px-4 pb-8">
            {content}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
