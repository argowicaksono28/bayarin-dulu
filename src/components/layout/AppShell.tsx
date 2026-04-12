"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"
import { TopBar } from "./TopBar"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/auth"
  const isPublicPage = pathname.startsWith("/view/")

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-background relative">
        <div
          className="pointer-events-none fixed bottom-0 left-0 right-0 h-64 z-0 dark:block hidden"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, hsl(25 90% 40% / 0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom right, hsl(25 90% 40% / 0.08) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    )
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Same ambient warm glow */}
        <div
          className="pointer-events-none fixed inset-0 z-0 dark:block hidden"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, hsl(25 90% 40% / 0.15) 0%, transparent 55%), radial-gradient(ellipse at bottom right, hsl(25 90% 40% / 0.10) 0%, transparent 55%), radial-gradient(ellipse at top center, hsl(220 20% 12% / 0.8) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient warm glow at page bottom */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-64 z-0 dark:block hidden"
        style={{
          background:
            "radial-gradient(ellipse at bottom left, hsl(25 90% 40% / 0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom right, hsl(25 90% 40% / 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Desktop: sidebar + main */}
      <div className="hidden lg:flex h-screen overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">{children}</div>
        </main>
      </div>

      {/* Mobile: topbar + content + bottom nav */}
      <div className="flex lg:hidden flex-col min-h-screen relative z-10">
        <TopBar />
        <main className="flex-1 pt-20 pb-28">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
