"use client"

import { useEffect, useState } from "react"
import { Group } from "@/types"
import { GroupCard } from "./GroupCard"
import { GroupListSkeleton } from "./GroupListSkeleton"
import { EmptyGroupState } from "./EmptyGroupState"

export function GroupList() {
  const [groups, setGroups] = useState<Group[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => {
        setGroups(Array.isArray(data) ? data : [])
      })
      .catch(() => setGroups([]))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <GroupListSkeleton />
  if (!groups || groups.length === 0) return <EmptyGroupState />

  return (
    <div className="divide-y divide-border/40">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  )
}
