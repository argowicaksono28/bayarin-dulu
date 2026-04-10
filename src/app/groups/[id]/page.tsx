import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatIDR } from "@/lib/formatters"
import { GroupDetailTabs } from "@/components/groups/GroupDetailTabs"
import { MembersSheet } from "@/components/groups/MembersSheet"
import { GroupSettingsSheet } from "@/components/groups/GroupSettingsSheet"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: { id: string }
}

export default async function GroupPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  const { data: groupData } = await supabase
    .from("groups")
    .select(`
      id, name, emoji, cover_color, created_by, created_at,
      group_members ( user_id, role, profiles ( id, name, initials, avatar_url, phone ) )
    `)
    .eq("id", params.id)
    .single()

  if (!groupData) redirect("/dashboard")

  // Compute total expenses
  const { data: expTotals } = await supabase
    .from("expenses")
    .select("amount")
    .eq("group_id", params.id)

  const totalExpenses = (expTotals ?? []).reduce((s, e) => s + e.amount, 0)

  const members = ((groupData.group_members ?? []) as any[]).map((m: any) => ({
    ...m.profiles,
    role: m.role,
  }))

  const group = {
    id: groupData.id,
    name: groupData.name,
    emoji: groupData.emoji,
    coverColor: groupData.cover_color,
    memberIds: members.map((m: any) => m.id),
    createdBy: groupData.created_by,
    createdAt: groupData.created_at,
    totalExpenses,
    myBalance: 0, // shown per-group on dashboard; not needed here
  }

  return (
    <div className="min-h-screen">
      {/* Group header */}
      <div className="px-4 pt-4 pb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Back arrow — desktop only */}
            <Link
              href="/dashboard"
              className="hidden lg:flex items-center text-muted-foreground hover:text-foreground transition-colors mr-1"
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

          <div className="flex items-center gap-2">
            {/* Member chips — click to open member list */}
            <MembersSheet members={members} />
            {/* Settings */}
            <GroupSettingsSheet group={group} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <GroupDetailTabs groupId={params.id} />
    </div>
  )
}
