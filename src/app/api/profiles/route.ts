import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/** GET /api/profiles?q=name_or_phone — search profiles by name or phone */
export async function GET(request: Request) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json([])

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, initials, avatar_url, phone")
    .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
    .neq("id", user.id)   // exclude self
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}
