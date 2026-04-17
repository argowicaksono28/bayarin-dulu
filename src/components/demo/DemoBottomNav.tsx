"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { DemoAddExpenseDialog } from "./DemoAddExpenseDialog"
import { toast } from "sonner"

export function DemoBottomNav() {
  const pathname = usePathname()
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)

  // Extract group ID if on a demo group page
  const groupMatch = pathname.match(/^\/demo\/groups\/([^/]+)/)
  const groupId = groupMatch?.[1] ?? null

  function handlePlusClick() {
    if (groupId) {
      setAddExpenseOpen(true)
    } else {
      toast.info("Open a group to add an expense")
    }
  }

  return (
    <>
      <nav className="fixed bottom-5 left-4 right-4 z-40 lg:hidden flex items-center justify-center">
        <div className="flex items-center gap-2 bg-sidebar/90 backdrop-blur-xl border border-border/40 rounded-full shadow-2xl px-4 h-16 w-full max-w-xs">

          {/* Left — Home */}
          <Link
            href="/demo"
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
              pathname === "/demo"
                ? "text-primary font-semibold"
                : "text-foreground/60 dark:text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          {/* Center — + button */}
          <button
            onClick={handlePlusClick}
            className="flex items-center justify-center h-12 w-20 rounded-full bg-primary shadow-lg text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all mx-1"
            aria-label={groupId ? "Add expense" : "Add expense"}
          >
            <Plus className="h-6 w-6" />
          </button>

          {/* Right — Profile (shows sign-up prompt) */}
          <button
            onClick={() => toast.info("Sign up to manage your profile", { action: { label: "Sign Up", onClick: () => { window.location.href = "/auth" } } })}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-xs text-foreground/60 dark:text-muted-foreground hover:text-foreground transition-colors"
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {groupId && (
        <DemoAddExpenseDialog
          groupId={groupId}
          open={addExpenseOpen}
          onOpenChange={setAddExpenseOpen}
        />
      )}
    </>
  )
}
