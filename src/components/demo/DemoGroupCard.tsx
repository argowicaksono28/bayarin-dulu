import Link from "next/link"
import { formatIDR, formatRelative } from "@/lib/formatters"
import type { Group } from "@/types"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import { GROUP_ICON_OPTIONS } from "@/lib/constants"

interface Props {
  group: Group
}

export function DemoGroupCard({ group }: Props) {
  const isPositive = group.myBalance > 0
  const isSettled = group.myBalance === 0
  const iconOption = GROUP_ICON_OPTIONS.find((o) => o.key === group.emoji)
  const Icon = iconOption?.icon ?? Users

  return (
    <Link href={`/demo/groups/${group.id}`} className="block">
      <div className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors rounded-lg cursor-pointer">
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
          group.coverColor || "bg-violet-500"
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{group.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {group.memberIds.length} members · {formatRelative(group.createdAt)}
          </p>
        </div>

        <div className="text-right shrink-0">
          {isSettled ? (
            <p className="text-sm text-muted-foreground font-medium">Settled</p>
          ) : (
            <>
              <p className={cn(
                "text-sm font-semibold",
                isPositive ? "text-primary" : "text-destructive"
              )}>
                {isPositive ? "+ " : "- "}{formatIDR(Math.abs(group.myBalance))}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPositive ? "you lent" : "you owe"}
              </p>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
