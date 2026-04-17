"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export function DemoTopBar() {
  const pathname = usePathname()
  const isGroupPage = pathname.startsWith("/demo/groups/")

  return (
    <header className="flex lg:hidden fixed top-10 left-0 right-0 z-40 h-14 items-center justify-between px-4 border-b border-border/50 bg-sidebar/95 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {isGroupPage ? (
          <Link
            href="/demo"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Bayarin Dulu" className="h-10 w-10 object-contain" />
            <span className="font-bold text-sm text-foreground">Bayarin Dulu</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  )
}
