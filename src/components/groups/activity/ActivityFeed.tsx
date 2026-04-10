"use client"

import { useEffect, useState } from "react"
import { ActivityItem } from "./ActivityItem"
import { ActivitySkeleton } from "./ActivitySkeleton"
import { Card } from "@/components/ui/card"
import { Activity as ActivityIcon } from "lucide-react"
import { Activity } from "@/types"

interface Props {
  groupId: string
}

export function ActivityFeed({ groupId }: Props) {
  const [activities, setActivities] = useState<Activity[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/groups/${groupId}/activities`)
      .then((r) => r.json())
      .then((data) => {
        setActivities(Array.isArray(data) ? data : [])
        setIsLoading(false)
      })
      .catch(() => {
        setActivities([])
        setIsLoading(false)
      })
  }, [groupId])

  if (isLoading) return <ActivitySkeleton />

  if (!activities || activities.length === 0) {
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
