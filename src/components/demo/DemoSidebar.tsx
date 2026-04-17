"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DemoSidebar() {
  const pathname = usePathname()
  const isHome = pathname === "/demo"

  return (
    <aside className="hidden lg:flex flex-col w-48 shrink-0 h-full bg-sidebar border-r border-border/50 relative overflow-hidden">
      {/* Warm glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 opacity-60"
        style={{ background: "radial-gradient(ellipse at bottom center, hsl(25 90% 35% / 0.25) 0%, transparent 70%)" }}
      />

      {/* Logo */}
      <div className="flex flex-col items-center gap-2 px-5 py-6">
        <img src="/logo.svg" alt="Bayarin Dulu" className="h-12 w-12 object-contain shrink-0" />
        <span className="font-bold text-sm text-foreground whitespace-nowrap">Bayarin Dulu</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <Link
          href="/demo"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
            isHome
              ? "bg-primary/15 text-primary font-medium"
              : "text-foreground/60 dark:text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
        >
          <Home className="h-4 w-4 shrink-0" />
          Dashboard
        </Link>
      </nav>

      {/* Footer: demo user + theme toggle */}
      <div className="px-3 py-4 relative z-10 space-y-2">
        <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">BS</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">Budi Santoso</p>
            <p className="text-xs text-foreground/55 dark:text-muted-foreground truncate">Demo account</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-1">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
