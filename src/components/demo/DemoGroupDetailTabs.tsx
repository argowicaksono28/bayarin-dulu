"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemoExpenseList } from "./DemoExpenseList"
import { DemoBalanceList } from "./DemoBalanceList"
import { DemoActivityFeed } from "./DemoActivityFeed"
import { DemoAddExpenseDialog } from "./DemoAddExpenseDialog"

interface Props {
  groupId: string
}

export function DemoGroupDetailTabs({ groupId }: Props) {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)

  return (
    <>
      <Tabs defaultValue="expenses" className="w-full">
        <div className="px-4 lg:px-0 mb-4">
          <TabsList className="w-full h-10 bg-card border border-border/50 rounded-lg p-1 grid grid-cols-3">
            <TabsTrigger value="expenses" className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="balances" className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all">
              Balances
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all">
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="expenses" className="mt-0">
          <DemoExpenseList groupId={groupId} onAddExpense={() => setAddExpenseOpen(true)} />
        </TabsContent>

        <TabsContent value="balances" className="mt-0">
          <DemoBalanceList groupId={groupId} />
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <DemoActivityFeed groupId={groupId} />
        </TabsContent>
      </Tabs>

      {/* Desktop-only add expense dialog (mobile handled by DemoBottomNav) */}
      <DemoAddExpenseDialog
        groupId={groupId}
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
      />
    </>
  )
}
