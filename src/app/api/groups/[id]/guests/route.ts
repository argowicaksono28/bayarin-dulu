import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function makeInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("guest_members")
    .select("id, name, initials, created_at")
    .eq("group_id", params.id)
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await request.json()
  const trimmed = (name ?? "").trim()
  if (!trimmed) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const { data, error } = await supabase
    .from("guest_members")
    .insert({ group_id: params.id, name: trimmed, initials: makeInitials(trimmed), created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { guestId } = await request.json()
  if (!guestId) return NextResponse.json({ error: "guestId is required" }, { status: 400 })

  const { error } = await supabase
    .from("guest_members")
    .delete()
    .eq("id", guestId)
    .eq("group_id", params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
