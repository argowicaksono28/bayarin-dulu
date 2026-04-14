"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateGroupSheet } from "@/components/groups/CreateGroupSheet"

export function CreateGroupButton() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 h-8 text-xs border-border/60 hover:bg-white/5"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        New Group
      </Button>
      <CreateGroupSheet open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
