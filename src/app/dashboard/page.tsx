"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalBalanceCard } from "@/components/dashboard/GlobalBalanceCard"
import { GroupList } from "@/components/dashboard/GroupList"
import { Card } from "@/components/ui/card"
import { CreateGroupSheet } from "@/components/groups/CreateGroupSheet"

export default function DashboardPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Desktop header row */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Bayarin Dulu" className="h-9 w-9 object-contain" />
          <span className="font-bold text-lg">Bayarin Dulu</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-0 space-y-5">
        <GlobalBalanceCard />

        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-base text-foreground">Your Groups</h2>
            {/* Desktop only — on mobile the nav + button handles this */}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs border-border/60 hover:bg-white/5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New Group
            </Button>
          </div>
          <Card className="border border-border/50 bg-card rounded-xl overflow-hidden">
            <GroupList />
          </Card>
        </div>
      </div>

      <CreateGroupSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
