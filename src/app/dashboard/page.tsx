import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserGroupsBase } from "@/lib/queries"
import { GlobalBalanceCard } from "@/components/dashboard/GlobalBalanceCard"
import { GroupList } from "@/components/dashboard/GroupList"
import { Card } from "@/components/ui/card"
import { CreateGroupButton } from "@/components/dashboard/CreateGroupButton"

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const groups = await getUserGroupsBase(supabase, user)
  const netBalance = groups.reduce((sum: number, g: any) => sum + (g.myBalance ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-0 space-y-5">
        <GlobalBalanceCard initialNetBalance={netBalance} />

        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-base text-foreground">Your Groups</h2>
            <CreateGroupButton />
          </div>
          <Card className="border border-border/50 bg-card rounded-xl overflow-hidden">
            <GroupList initialGroups={groups} />
          </Card>
        </div>
      </div>
    </div>
  )
}
