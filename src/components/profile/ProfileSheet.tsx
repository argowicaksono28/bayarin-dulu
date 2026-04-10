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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { LogOut, Edit2, Phone, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  name: string
  initials: string
  email: string
  phone: string | null
  avatarUrl: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileSheet({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setProfile(data)
          setName(data.name)
          setPhone(data.phone ?? "")
        }
      })
      .catch(() => {})
  }, [open])

  async function handleSave() {
    setSaving(true)
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update profile")
      return
    }
    setProfile(data)
    setEditing(false)
    toast.success("Profile updated")
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    onOpenChange(false)
    router.push("/auth")
    router.refresh()
  }

  const displayName = profile?.name ?? "..."
  const displayEmail = profile?.email ?? ""
  const displayPhone = profile?.phone ?? "—"
  const initials = profile?.initials ?? displayName.slice(0, 2).toUpperCase()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle>Profile</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 py-2">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base">{displayName}</p>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(!editing)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-muted/30">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted/50 border-border/50 h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-muted/50 border-border/50 h-9"
                  type="tel"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-9 border-border/50"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-9 bg-primary hover:bg-primary/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}

          {/* Info rows */}
          {!editing && (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-1 py-2.5 rounded-xl">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">{displayEmail}</span>
              </div>
              <div className="flex items-center gap-3 px-1 py-2.5 rounded-xl">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">{displayPhone}</span>
              </div>
            </div>
          )}

          <Separator className="bg-border/40" />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-left"
          >
            <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-destructive">Sign Out</p>
              <p className="text-xs text-muted-foreground">You will be redirected to login</p>
            </div>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
