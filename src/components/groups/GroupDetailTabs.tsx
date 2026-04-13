"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseList } from "./expenses/ExpenseList"
import { BalanceList } from "./balances/BalanceList"
import { ActivityFeed } from "./activity/ActivityFeed"
import { AddExpenseButton } from "@/components/add-expense/AddExpenseButton"

interface Props {
  groupId: string
}

export function GroupDetailTabs({ groupId }: Props) {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0)

  function handleExpenseChanged() {
    setBalanceRefreshKey((k) => k + 1)
  }

  return (
    <Tabs defaultValue="expenses" className="w-full">
      <div className="px-4 lg:px-0 mb-4">
        <TabsList className="w-full h-10 bg-card border border-border/50 rounded-lg p-1 grid grid-cols-3">
          <TabsTrigger
            value="expenses"
            className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all"
          >
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="balances"
            className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all"
          >
            Balances
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-md text-sm font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all"
          >
            Activity
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="expenses" className="mt-0">
        <ExpenseList
          groupId={groupId}
          onAddExpense={() => setAddExpenseOpen(true)}
          onExpenseChanged={handleExpenseChanged}
        />
        <AddExpenseButton
          groupId={groupId}
          open={addExpenseOpen}
          onOpenChange={setAddExpenseOpen}
        />
      </TabsContent>

      <TabsContent value="balances" className="mt-0">
        <BalanceList groupId={groupId} refreshKey={balanceRefreshKey} />
      </TabsContent>

      <TabsContent value="activity" className="mt-0">
        <ActivityFeed groupId={groupId} />
      </TabsContent>
    </Tabs>
  )
}
