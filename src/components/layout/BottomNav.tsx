"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { CreateGroupSheet } from "@/components/groups/CreateGroupSheet"
import { ProfileSheet } from "@/components/profile/ProfileSheet"
import { AddExpenseButton } from "@/components/add-expense/AddExpenseButton"

export function BottomNav() {
  const pathname = usePathname()
  const [createOpen, setCreateOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)

  // Detect if we're on a group detail page
  const groupMatch = pathname.match(/^\/groups\/([^/]+)/)
  const groupId = groupMatch?.[1] ?? null

  function handlePlusClick() {
    if (groupId) {
      setAddExpenseOpen(true)
    } else {
      setCreateOpen(true)
    }
  }

  return (
    <>
      {/* Floating pill nav */}
      <nav className="fixed bottom-5 left-4 right-4 z-50 lg:hidden flex items-center justify-center">
        <div className="flex items-center gap-2 bg-sidebar/90 backdrop-blur-xl border border-border/40 rounded-full shadow-2xl px-4 h-16 w-full max-w-xs">

          {/* Left — Home */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
              pathname === "/dashboard"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {/* Center — context-aware + button */}
          <button
            onClick={handlePlusClick}
            className="flex items-center justify-center h-12 w-20 rounded-full bg-primary shadow-lg text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all mx-1"
            aria-label={groupId ? "Add expense" : "Create new group"}
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* Right — Profile */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      <CreateGroupSheet open={createOpen} onOpenChange={setCreateOpen} />
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
      {groupId && (
        <AddExpenseButton
          groupId={groupId}
          open={addExpenseOpen}
          onOpenChange={setAddExpenseOpen}
        />
      )}
    </>
  )
}
