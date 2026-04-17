"use client"

import { useDemo } from "@/contexts/DemoContext"
import { DemoGroupDetailTabs } from "./DemoGroupDetailTabs"
import { formatIDR } from "@/lib/formatters"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface Props {
  groupId: string
}

export function DemoGroupDetail({ groupId }: Props) {
  const { getGroupById, getMembersByGroupId } = useDemo()
  const group = getGroupById(groupId)

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <p className="text-sm text-muted-foreground">Group not found</p>
        <Link href="/demo" className="mt-3 text-sm text-primary hover:underline">
          Back to demo
        </Link>
      </div>
    )
  }

  const members = getMembersByGroupId(groupId)

  return (
    <div className="min-h-screen">
      {/* Group header */}
      <div className="px-4 pt-4 pb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-1"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {members.length} members · {formatIDR(group.totalExpenses)} total
              </p>
            </div>
          </div>

          {/* Member avatar stack */}
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="h-8 w-8 rounded-full bg-violet-600 border-2 border-background flex items-center justify-center"
                title={m.name}
              >
                <span className="text-[10px] font-semibold text-white">{m.initials}</span>
              </div>
            ))}
            {members.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-[10px] font-semibold text-muted-foreground">+{members.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <DemoGroupDetailTabs groupId={groupId} />
    </div>
  )
}
