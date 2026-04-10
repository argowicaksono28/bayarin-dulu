"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"
import { CreateGroupSheet } from "@/components/groups/CreateGroupSheet"

export function EmptyGroupState() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No groups yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Create your first group and start splitting bills with friends
        </p>
        <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Your First Group
        </Button>
      </div>
      <CreateGroupSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
