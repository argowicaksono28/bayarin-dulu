"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { NotificationBell } from "@/components/notifications/NotificationBell"

function getTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Bayarin Dulu"
  if (pathname === "/auth") return "Bayarin Dulu"
  if (pathname.startsWith("/groups/")) return ""
  return "Bayarin Dulu"
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const showBack = pathname.startsWith("/groups/")

  return (
    <header className="flex lg:hidden fixed top-0 left-0 right-0 z-50 h-14 items-center justify-between px-4 border-b border-border/50 bg-sidebar/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Bayarin Dulu" className="h-8 w-8 object-contain" />
            <span className="font-bold text-sm text-foreground">Bayarin Dulu</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
