import { formatRelative } from "@/lib/formatters"
import { getUserById } from "@/lib/mock-data"
import type { Notification } from "@/types"
import { cn } from "@/lib/utils"
import { Bell, CreditCard, Users, DollarSign } from "lucide-react"

const icons = {
  payment_request: DollarSign,
  expense_added: CreditCard,
  group_invite: Users,
  settlement_reminder: Bell,
}

interface Props {
  notification: Notification
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: Props) {
  const Icon = icons[notification.type]
  let actor: { initials: string; name: string } = { initials: "?", name: "Unknown" }
  try {
    actor = getUserById(notification.actorId)
  } catch {
    // actor not found
  }

  return (
    <button
      onClick={() => onRead(notification.id)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors",
        !notification.isRead && "bg-primary/5"
      )}
    >
      <div className={cn(
        "mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0",
        notification.isRead ? "bg-muted" : "bg-primary/10"
      )}>
        <Icon className={cn("h-4 w-4", notification.isRead ? "text-muted-foreground" : "text-primary")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.isRead && "font-medium")}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.body}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelative(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  )
}
