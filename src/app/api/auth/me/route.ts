import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error || !profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    initials: profile.initials,
    email: user.email,
    phone: profile.phone,
    avatarUrl: profile.avatar_url,
  })
}

export async function PATCH(request: Request) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name, phone } = body

  const updates: Record<string, string> = {}
  if (name?.trim()) updates.name = name.trim()
  if (phone !== undefined) updates.phone = phone

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    id: data.id,
    name: data.name,
    initials: data.initials,
    email: user.email,
    phone: data.phone,
    avatarUrl: data.avatar_url,
  })
}
