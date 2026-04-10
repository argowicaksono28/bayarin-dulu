import Link from "next/link"
import { formatIDR, formatRelative } from "@/lib/formatters"
import type { Group } from "@/types"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"

// Deterministic color per group
const groupColors = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
]

function getGroupColor(id: string): string {
  const idx = parseInt(id.replace(/\D/g, ""), 10) % groupColors.length
  return groupColors[idx] || groupColors[0]
}

interface Props {
  group: Group
}

export function GroupCard({ group }: Props) {
  const isPositive = group.myBalance > 0
  const isSettled = group.myBalance === 0
  const colorClass = getGroupColor(group.id)

  return (
    <Link href={`/groups/${group.id}`} className="block">
      <div className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors rounded-lg cursor-pointer">
        {/* Colored icon */}
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
          colorClass
        )}>
          <Users className="h-5 w-5 text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{group.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {group.memberIds.length} members · {formatRelative(group.createdAt)}
          </p>
        </div>

        {/* Balance */}
        <div className="text-right shrink-0">
          {isSettled ? (
            <p className="text-sm text-muted-foreground font-medium">Settled</p>
          ) : (
            <>
              <p className={cn(
                "text-sm font-semibold",
                isPositive ? "text-primary" : "text-destructive"
              )}>
                {isPositive ? "" : "-"}{formatIDR(Math.abs(group.myBalance))}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPositive ? "you are owed" : "you owe"}
              </p>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
