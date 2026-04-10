import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: group, error } = await supabase
    .from("groups")
    .select(`
      *,
      group_members ( user_id, role, profiles ( id, name, initials, avatar_url, phone ) )
    `)
    .eq("id", params.id)
    .single()

  if (error || !group) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(group)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name, emoji, coverColor } = body

  const updates: Record<string, string> = {}
  if (name) updates.name = name.trim()
  if (emoji) updates.emoji = emoji
  if (coverColor) updates.cover_color = coverColor

  const { data, error } = await supabase
    .from("groups")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabase.from("groups").delete().eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
