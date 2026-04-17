"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Gamepad2 } from "lucide-react"

export function DemoBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-10 flex items-center justify-between px-4 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
      <div className="flex items-center gap-2 min-w-0">
        <Gamepad2 className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground">Demo Mode</span>
        <span className="hidden sm:inline text-muted-foreground mx-1">·</span>
        <span className="hidden sm:inline text-xs text-muted-foreground truncate">Changes are not saved</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" className="h-7 text-xs px-3" asChild>
          <Link href="/auth">Sign In</Link>
        </Button>
        <Button size="sm" className="h-7 text-xs px-3" asChild>
          <Link href="/auth">Sign Up Free →</Link>
        </Button>
      </div>
    </div>
  )
}
