import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check if they're the last admin — block if so (someone else must be admin first)
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, role")
    .eq("group_id", params.id)

  const admins = (members ?? []).filter((m) => m.role === "admin")
  const isOnlyAdmin = admins.length === 1 && admins[0].user_id === user.id

  if (isOnlyAdmin && (members ?? []).length > 1) {
    return NextResponse.json(
      { error: "You're the only admin. Assign another admin before leaving." },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", params.id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
