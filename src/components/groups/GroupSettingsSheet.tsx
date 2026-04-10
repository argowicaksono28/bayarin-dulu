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
import { Settings, UserPlus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Group } from "@/types"

interface Props {
  group: Group
}

export function GroupSettingsSheet({ group }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(group.name)

  async function handleSave() {
    const res = await fetch(`/api/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
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
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 pb-8">
          <SheetHeader className="pb-4">
            <SheetTitle>Group Settings</SheetTitle>
          </SheetHeader>

          <div className="space-y-5">
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
              disabled={!name.trim() || name === group.name}
            >
              Save Changes
            </Button>

            <Separator className="bg-border/40" />

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  toast.info("Invite member feature coming soon")
                  setOpen(false)
                }}
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
        </SheetContent>
      </Sheet>
    </>
  )
}
