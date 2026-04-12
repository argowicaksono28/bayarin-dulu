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
import { Settings, UserPlus, Loader2, LogOut, Link, Copy, Check, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import type { Group } from "@/types"
import { InviteMemberSheet } from "@/components/invite/InviteMemberSheet"
import { GROUP_ICON_OPTIONS } from "@/lib/constants"

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
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [name, setName] = useState(group.name)
  const [emoji, setEmoji] = useState(group.emoji)
  const [coverColor, setCoverColor] = useState(group.coverColor || "bg-violet-500")
  const [loading, setLoading] = useState(false)
  const [leavePending, setLeavePending] = useState(false)
  const [leaveConfirm, setLeaveConfirm] = useState(false)
  const [viewToken, setViewToken] = useState<string | null>(group.publicViewToken ?? null)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const viewUrl = viewToken && typeof window !== "undefined"
    ? `${window.location.origin}/view/${group.id}?token=${viewToken}`
    : ""

  const selectedIcon = GROUP_ICON_OPTIONS.find((o) => o.key === emoji) ?? GROUP_ICON_OPTIONS[0]
  const PreviewIcon = selectedIcon.icon
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
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error ?? "Failed to save settings")
    }
  }

  async function handleToggleViewLink() {
    setTokenLoading(true)
    if (viewToken) {
      await fetch(`/api/groups/${group.id}/view-token`, { method: "DELETE" })
      setViewToken(null)
      toast.success("View-only link disabled")
    } else {
      const res = await fetch(`/api/groups/${group.id}/view-token`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setViewToken(data.token)
        toast.success("View-only link created")
      } else {
        toast.error(data.error ?? "Failed to create link")
      }
    }
    setTokenLoading(false)
  }

  async function handleCopyViewLink() {
    if (!viewUrl) return
    await navigator.clipboard.writeText(viewUrl)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLeave() {
    if (!leaveConfirm) {
      setLeaveConfirm(true)
      return
    }
    setLeavePending(true)
    const res = await fetch(`/api/groups/${group.id}/leave`, { method: "DELETE" })
    const data = await res.json()
    setLeavePending(false)
    if (!res.ok) {
      toast.error(data.error ?? "Failed to leave group")
      setLeaveConfirm(false)
      return
    }
    toast.success(`Left "${group.name}"`)
    setOpen(false)
    router.push("/dashboard")
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
              <div className={cn("rounded-xl h-20 flex items-center justify-center transition-colors", coverColor)}>
                <PreviewIcon className="h-10 w-10 text-white" />
              </div>

              {/* Icon picker — monochrome Lucide icons */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Group Icon</Label>
                <div className="grid grid-cols-8 gap-2">
                  {GROUP_ICON_OPTIONS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      title={label}
                      onClick={() => setEmoji(key)}
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center border transition-colors",
                        emoji === key
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/50 bg-muted/50 hover:bg-muted text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
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

              {/* View-only link */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">View-Only Link</p>
                  </div>
                  <button
                    onClick={handleToggleViewLink}
                    disabled={tokenLoading}
                    className={cn(
                      "text-xs px-3 py-1 rounded-full border transition-colors font-medium",
                      viewToken
                        ? "border-primary text-primary bg-primary/10 hover:bg-primary/20"
                        : "border-border/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tokenLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : viewToken ? (
                      <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> Disable</span>
                    ) : (
                      <span className="flex items-center gap-1"><Link className="h-3 w-3" /> Enable</span>
                    )}
                  </button>
                </div>
                {viewToken && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Share this link so anyone can view expenses without signing in
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-xs font-mono text-muted-foreground truncate">
                        {viewUrl}
                      </div>
                      <button
                        onClick={handleCopyViewLink}
                        className="h-9 w-9 rounded-lg border border-border/50 bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                        aria-label="Copy link"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
                  disabled={leavePending}
                  onBlur={() => setLeaveConfirm(false)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-left disabled:opacity-60"
                >
                  <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    {leavePending
                      ? <Loader2 className="h-4 w-4 text-destructive animate-spin" />
                      : <LogOut className="h-4 w-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      {leaveConfirm ? "Tap again to confirm" : "Leave Group"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {leaveConfirm
                        ? "This will remove you from the group"
                        : "You won't be able to see this group anymore"}
                    </p>
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
