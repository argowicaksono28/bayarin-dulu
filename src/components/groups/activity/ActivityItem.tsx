import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatRelative, formatIDR } from "@/lib/formatters"
import { getUserById } from "@/lib/mock-data"
import type { Activity } from "@/types"
import { Receipt, UserPlus, CheckCircle, Edit, Trash2 } from "lucide-react"

const typeConfig = {
  expense_added: { icon: Receipt, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/20" },
  expense_edited: { icon: Edit, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/20" },
  expense_deleted: { icon: Trash2, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20" },
  member_joined: { icon: UserPlus, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/20" },
  settlement: { icon: CheckCircle, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/20" },
}

interface Props {
  activity: Activity
}

export function ActivityItem({ activity }: Props) {
  const actor = getUserById(activity.actorId)
  const config = typeConfig[activity.type]
  const Icon = config.icon

  return (
    <div className="flex items-start gap-3 py-3 px-4">
      <div className={`h-9 w-9 rounded-full ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{activity.description}</p>
        {activity.amount && (
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            {formatIDR(activity.amount)}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelative(activity.createdAt)}
        </p>
      </div>
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarFallback className="text-[10px] bg-muted">
          {actor.initials}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
