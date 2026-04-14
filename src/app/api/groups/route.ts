import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUserGroupsBase } from "@/lib/queries"

export async function GET(request: Request) {
  try {
    const supabase = createClient(request as any)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const groups = await getUserGroupsBase(supabase, user)
    return NextResponse.json(groups)
  } catch (err: any) {
    console.error("GET /api/groups unhandled error:", err)
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { name, emoji = "🎉", coverColor = "bg-blue-500" } = body

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const { data: group, error } = await supabase.rpc("create_group", {
    p_name: name.trim(),
    p_emoji: emoji,
    p_cover_color: coverColor,
    p_user_id: user.id,
  })

  if (error) {
    console.error("create_group RPC error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(group, { status: 201 })
}
