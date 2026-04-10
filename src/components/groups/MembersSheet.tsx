"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { User } from "@/types"

const avatarColors = [
  "bg-emerald-500", "bg-blue-500", "bg-amber-500",
  "bg-violet-500", "bg-rose-500", "bg-cyan-500",
]

interface Props {
  members: User[]
}

export function MembersSheet({ members }: Props) {
  const [open, setOpen] = useState(false)

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
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-border/50 pb-8">
          <SheetHeader className="pb-4">
            <SheetTitle>Group Members ({members.length})</SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            {members.map((member, idx) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-1 py-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`text-sm text-white font-semibold ${avatarColors[idx % avatarColors.length]}`}>
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                {idx === 0 && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
