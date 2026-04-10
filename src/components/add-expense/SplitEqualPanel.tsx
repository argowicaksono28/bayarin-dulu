import { formatIDR } from "@/lib/formatters"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/types"

interface Props {
  members: User[]
  totalAmount: number
}

export function SplitEqualPanel({ members, totalAmount }: Props) {
  const perPerson = members.length > 0
    ? Math.floor(totalAmount / members.length)
    : 0

  return (
    <div className="space-y-2">
      {members.map((member, idx) => {
        const amount = idx === members.length - 1
          ? totalAmount - perPerson * (members.length - 1)
          : perPerson
        return (
          <div key={member.id} className="flex items-center gap-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm">{member.name}</span>
            <span className="text-sm font-medium">{formatIDR(amount)}</span>
          </div>
        )
      })}
    </div>
  )
}
