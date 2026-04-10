"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProfileSheet } from "@/components/profile/ProfileSheet"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
]

interface UserProfile {
  name: string
  initials: string
  email: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) {
          setUser({ name: data.name, initials: data.initials, email: data.email })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <aside className="hidden lg:flex flex-col w-48 shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border/50 relative overflow-hidden">
      {/* Warm glow at bottom — decorative */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 opacity-60"
        style={{ background: "radial-gradient(ellipse at bottom center, hsl(25 90% 35% / 0.25) 0%, transparent 70%)" }}
      />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="/logo.svg" alt="Bayarin Dulu" className="h-9 w-9 object-contain shrink-0" />
        <span className="font-bold text-base text-foreground">Bayarin Dulu</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer: profile + actions */}
      <div className="px-3 py-4 relative z-10 space-y-2">
        {/* Profile button → opens ProfileSheet */}
        <button
          onClick={() => setProfileSheetOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
              {user?.initials ?? "…"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.name ?? "Loading…"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user?.email ?? ""}
            </p>
          </div>
        </button>

        {/* Notification + Theme toggle row */}
        <div className="flex items-center gap-1 px-1">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      <ProfileSheet open={profileSheetOpen} onOpenChange={setProfileSheetOpen} />
    </aside>
  )
}
