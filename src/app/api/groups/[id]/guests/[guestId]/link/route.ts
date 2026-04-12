import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; guestId: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const groupId = params.id
  const guestId = params.guestId

  // Verify user is a member of this group
  const { data: membership } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })

  // Verify the guest exists in this group
  const { data: guest } = await supabase
    .from("guest_members")
    .select("id, name")
    .eq("id", guestId)
    .eq("group_id", groupId)
    .single()

  if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 })

  // Transfer expense splits from guest to real user
  await supabase
    .from("expense_splits")
    .update({ user_id: user.id })
    .eq("user_id", guestId)

  // Transfer expenses where guest was the payer
  await supabase
    .from("expenses")
    .update({ paid_by: user.id })
    .eq("paid_by", guestId)
    .eq("group_id", groupId)

  // Delete the guest member record
  await supabase
    .from("guest_members")
    .delete()
    .eq("id", guestId)

  return NextResponse.json({ success: true, linkedName: guest.name })
}
