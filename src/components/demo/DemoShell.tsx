"use client"

import type { ReactNode } from "react"
import { DemoBanner } from "./DemoBanner"
import { DemoSidebar } from "./DemoSidebar"
import { DemoTopBar } from "./DemoTopBar"
import { DemoBottomNav } from "./DemoBottomNav"

export function DemoShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient warm glow */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-64 z-0 dark:block hidden"
        style={{
          background:
            "radial-gradient(ellipse at bottom left, hsl(25 90% 40% / 0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom right, hsl(25 90% 40% / 0.08) 0%, transparent 60%)",
        }}
      />

      {/* Demo banner — fixed at very top, full width */}
      <DemoBanner />

      {/* Desktop: sidebar + main (starts below 40px banner) */}
      <div className="hidden lg:flex relative z-10" style={{ height: "calc(100vh - 40px)", marginTop: "40px" }}>
        <DemoSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">{children}</div>
        </main>
      </div>

      {/* Mobile: topbar (below banner) + content + bottom nav */}
      <div className="flex lg:hidden flex-col min-h-screen relative z-10">
        <DemoTopBar />
        {/* pt-24 = banner(40px) + topbar(56px) + 4px gap; pb-28 clears bottom nav */}
        <main className="flex-1 pt-24 pb-28">{children}</main>
        <DemoBottomNav />
      </div>
    </div>
  )
}
