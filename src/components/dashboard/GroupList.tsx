"use client"

import { useEffect, useRef, useState } from "react"
import { Group } from "@/types"
import { GroupCard } from "./GroupCard"
import { GroupListSkeleton } from "./GroupListSkeleton"
import { EmptyGroupState } from "./EmptyGroupState"
import { createClient } from "@/lib/supabase/client"

interface GroupListProps {
  initialGroups?: Group[] | null
}

export function GroupList({ initialGroups = null }: GroupListProps) {
  const [groups, setGroups] = useState<Group[] | null>(initialGroups)
  const [isLoading, setIsLoading] = useState(initialGroups === null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null)

  function fetchGroups() {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data) => {
        setGroups(Array.isArray(data) ? data : [])
      })
      .catch(() => setGroups([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (initialGroups === null) {
      fetchGroups()
    }

    const supabase = createClient()

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Re-fetch groups when expenses or settlements change (balance updates)
    const channel = supabase
      .channel(`dashboard:realtime:${Date.now()}`)
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "expenses" },
        () => { fetchGroups() }
      )
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "settlements" },
        () => { fetchGroups() }
      )
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "groups" },
        () => { fetchGroups() }
      )
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("[realtime] dashboard channel error")
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
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
