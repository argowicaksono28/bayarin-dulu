"use client"

import { useDemo } from "@/contexts/DemoContext"
import { ActivityItem } from "@/components/groups/activity/ActivityItem"
import { Card } from "@/components/ui/card"
import { Activity as ActivityIcon } from "lucide-react"

interface Props {
  groupId: string
}

export function DemoActivityFeed({ groupId }: Props) {
  const { getActivitiesByGroupId } = useDemo()
  const activities = getActivitiesByGroupId(groupId)

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <ActivityIcon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base mb-1">No activity yet</h3>
        <p className="text-sm text-muted-foreground">Group activity will appear here</p>
      </div>
    )
  }

  return (
    <div className="px-4">
      <Card className="border border-border/50 bg-card rounded-xl overflow-hidden">
        <div className="divide-y divide-border/40">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </Card>
    </div>
  )
}
