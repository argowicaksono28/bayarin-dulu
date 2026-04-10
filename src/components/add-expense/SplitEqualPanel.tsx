import { formatIDR } from "@/lib/formatters"
import { getUserById } from "@/lib/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Props {
  memberIds: string[]
  totalAmount: number
}

export function SplitEqualPanel({ memberIds, totalAmount }: Props) {
  const perPerson = memberIds.length > 0
    ? Math.floor(totalAmount / memberIds.length)
    : 0

  return (
    <div className="space-y-2">
      {memberIds.map((id, idx) => {
        const user = getUserById(id)
        const amount = idx === memberIds.length - 1
          ? totalAmount - perPerson * (memberIds.length - 1)
          : perPerson
        return (
          <div key={id} className="flex items-center gap-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm">{user.name}</span>
            <span className="text-sm font-medium">{formatIDR(amount)}</span>
          </div>
        )
      })}
    </div>
  )
}
