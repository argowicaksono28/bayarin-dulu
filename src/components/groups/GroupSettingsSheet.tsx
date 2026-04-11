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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, UserPlus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Group } from "@/types"
import { InviteMemberSheet } from "@/components/invite/InviteMemberSheet"

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
  group: Group
}

export function GroupSettingsSheet({ group }: Props) {
  const [open, setOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [name, setName] = useState(group.name)
  const [emoji, setEmoji] = useState(group.emoji)
  const [coverColor, setCoverColor] = useState(group.coverColor || "bg-violet-500")
  const [loading, setLoading] = useState(false)

  const isDirty = name !== group.name || emoji !== group.emoji || coverColor !== (group.coverColor || "bg-violet-500")

  async function handleSave() {
    setLoading(true)
    const res = await fetch(`/api/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emoji, coverColor }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success("Group settings saved")
      setOpen(false)
    } else {
      const data = await res.json()
      toast.error(data.error ?? "Failed to save settings")
    }
  }

  function handleLeave() {
    toast("You left the group", { description: group.name })
    setOpen(false)
  }

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/5"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 h-[85vh] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-3 shrink-0">
            <SheetTitle>Group Settings</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 px-4 pb-8">
            <div className="space-y-5 pb-6">
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleSave}
                disabled={!name.trim() || !isDirty || loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Saving…
                  </span>
                ) : "Save Changes"}
              </Button>

              <Separator className="bg-border/40" />

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => { setOpen(false); setInviteOpen(true) }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Invite Members</p>
                    <p className="text-xs text-muted-foreground">Share an invite link</p>
                  </div>
                </button>

                <button
                  onClick={handleLeave}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-left"
                >
                  <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">Leave Group</p>
                    <p className="text-xs text-muted-foreground">You won&apos;t be able to see this group anymore</p>
                  </div>
                </button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <InviteMemberSheet groupId={group.id} groupName={group.name} open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  )
}
