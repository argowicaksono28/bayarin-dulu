import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { GroupListSkeleton } from "@/components/dashboard/GroupListSkeleton"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="px-4 lg:px-0 space-y-5">
        {/* GlobalBalanceCard Skeleton */}
        <Card className="border border-border/50 bg-card rounded-xl">
          <CardContent className="px-6 py-5">
            <p className="text-sm text-muted-foreground mb-1">Your Net Balance</p>
            <div className="h-9 w-40 rounded bg-muted animate-pulse" />
            <p className="text-sm text-muted-foreground mt-1">
              <Skeleton className="h-4 w-24" />
            </p>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-base text-foreground">Your Groups</h2>
            <Button
              size="sm"
              variant="outline"
              disabled
              className="gap-1.5 h-8 text-xs border-border/60"
            >
              <Plus className="h-3.5 w-3.5" />
              New Group
            </Button>
          </div>
          <Card className="border border-border/50 bg-card rounded-xl overflow-hidden">
            <GroupListSkeleton />
          </Card>
        </div>
      </div>
    </div>
  )
}
