"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { UserPlus, Copy, Link, Mail } from "lucide-react"

interface Props {
  groupId: string
}

export function InviteMemberSheet({ groupId }: Props) {
  const [email, setEmail] = useState("")
  const inviteLink = `https://bayarindulu.app/invite/${groupId}`

  function handleCopyLink() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success("Link undangan disalin!")
    })
  }

  function handleSendEmail() {
    if (!email) {
      toast.error("Masukkan alamat email terlebih dahulu")
      return
    }
    toast.success(`Undangan dikirim ke ${email}`)
    setEmail("")
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Undang
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle>Undang Anggota</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Copy Link */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Salin Link</Label>
            </div>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="text-xs text-muted-foreground" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* QR Code */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">QR Code</Label>
            <div className="flex justify-center">
              <div className="h-40 w-40 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/30">
                <div className="text-center text-muted-foreground">
                  <div className="grid grid-cols-3 gap-1 mb-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-4 w-4 rounded-sm ${Math.random() > 0.5 ? "bg-foreground" : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs">QR Code</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Email invite */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Kirim via Email</Label>
            </div>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="teman@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleSendEmail}>Kirim</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
